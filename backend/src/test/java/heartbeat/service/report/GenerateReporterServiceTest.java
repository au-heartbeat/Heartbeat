package heartbeat.service.report;

import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.pipeline.dto.request.PipelineType;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.response.ChangeFailureRate;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.CycleTime;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.MeanTimeToRecovery;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.controller.source.SourceType;
import heartbeat.exception.BadRequestException;
import heartbeat.exception.BaseException;
import heartbeat.exception.GenerateReportException;
import heartbeat.exception.NotFoundException;
import heartbeat.exception.ServiceUnavailableException;
import heartbeat.handler.AsyncExceptionHandler;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.handler.AsyncReportRequestHandler;
import heartbeat.service.pipeline.buildkite.builder.BuildKiteBuildInfoBuilder;
import heartbeat.service.pipeline.buildkite.builder.BuildKiteJobBuilder;
import heartbeat.service.pipeline.buildkite.builder.DeployInfoBuilder;
import heartbeat.service.pipeline.buildkite.builder.DeployTimesBuilder;
import heartbeat.service.pipeline.buildkite.builder.DeploymentEnvironmentBuilder;
import heartbeat.service.report.calculator.ChangeFailureRateCalculator;
import heartbeat.service.report.calculator.ClassificationCalculator;
import heartbeat.service.report.calculator.CycleTimeCalculator;
import heartbeat.service.report.calculator.DeploymentFrequencyCalculator;
import heartbeat.service.report.calculator.LeadTimeForChangesCalculator;
import heartbeat.service.report.calculator.MeanToRecoveryCalculator;
import heartbeat.service.report.calculator.VelocityCalculator;
import heartbeat.service.report.calculator.model.FetchedData;
import org.junit.jupiter.api.Nested;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static heartbeat.TestFixtures.BUILDKITE_TOKEN;
import static heartbeat.TestFixtures.GITHUB_REPOSITORY;
import static heartbeat.TestFixtures.GITHUB_TOKEN;
import static heartbeat.service.report.scheduler.DeleteExpireCSVScheduler.EXPORT_CSV_VALIDITY_TIME;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GenerateReporterServiceTest {

	private static final String TIMESTAMP = "1683734399999";

	private static final String CSV_TIMESTAMP = "20240109232359";

	public static final String APP_OUTPUT_CSV_PATH = "./app/output/csv";

	@InjectMocks
	GenerateReporterService generateReporterService;

	@Mock
	WorkDay workDay;

	@Mock
	KanbanService kanbanService;

	@Mock
	PipelineService pipelineService;

	@Mock
	ClassificationCalculator classificationCalculator;

	@Mock
	DeploymentFrequencyCalculator deploymentFrequency;

	@Mock
	VelocityCalculator velocityCalculator;

	Path mockPipelineCsvPath = Path.of(APP_OUTPUT_CSV_PATH + "/exportPipelineMetrics-1683734399999.csv");

	Path mockBoardCsvPath = Path.of(APP_OUTPUT_CSV_PATH + "/exportBoard-1683734399999.csv");

	Path mockMetricCsvPath = Path.of(APP_OUTPUT_CSV_PATH + "/exportMetric-1683734399999.csv");

	@Mock
	ChangeFailureRateCalculator changeFailureRate;

	@Mock
	MeanToRecoveryCalculator meanToRecoveryCalculator;

	@Mock
	CycleTimeCalculator cycleTimeCalculator;

	@Mock
	VelocityCalculator velocityCalculator;

	@Mock
	CSVFileGenerator csvFileGenerator;

	@Mock
	LeadTimeForChangesCalculator leadTimeForChangesCalculator;

	@Mock
	AsyncReportRequestHandler asyncReportRequestHandler;

	@Mock
	AsyncMetricsDataHandler asyncMetricsDataHandler;

	@Mock
	AsyncExceptionHandler asyncExceptionHandler;

	@Captor
	ArgumentCaptor<ReportResponse> responseArgumentCaptor;

	@Captor
	ArgumentCaptor<BaseException> exceptionCaptor;

	@Nested
	class GenerateBoardReport {

		@AfterEach
	void afterEach() {
		new File(APP_OUTPUT_CSV_PATH).delete();
	}

	@AfterAll
	static void afterAll() {
		new File("./app/output").delete();
		new File("./app").delete();
	}

	@Test
		void shouldSaveReportResponseWithoutMetricDataAndUpdateMetricCompletedWhenMetricsIsEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			generateReporterService.generateBoardReport(request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(pipelineService, never()).fetchGithubData(any());
			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getBoardReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertNull(response.getCycleTime());
			assertNull(response.getVelocity());
			assertNull(response.getClassificationList());

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldThrowErrorWhenGetMetricDataCompletedIsNull() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any())).thenReturn(null);
			generateReporterService.generateBoardReport(request);

			verify(asyncExceptionHandler).put(eq(request.getBoardReportId()), exceptionCaptor.capture());
			assertEquals("Failed to update metrics data completed through this timestamp.",
					exceptionCaptor.getValue().getMessage());
			assertEquals(500, exceptionCaptor.getValue().getStatus());
			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getBoardReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(1800000L, response.getExportValidityTime());
			assertNull(response.getCycleTime());

			verify(asyncMetricsDataHandler, never()).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldThrowErrorWhenJiraBoardSettingIsNull() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of("velocity"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			generateReporterService.generateBoardReport(request);

			verify(asyncExceptionHandler).put(eq(request.getBoardReportId()), exceptionCaptor.capture());
			assertEquals("Failed to fetch Jira info due to Jira board setting is null.",
					exceptionCaptor.getValue().getMessage());
			assertEquals(400, exceptionCaptor.getValue().getStatus());
			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler, never()).putReport(eq(request.getBoardReportId()), any());
			verify(asyncMetricsDataHandler, never()).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldSaveReportResponseWithVelocityAndUpdateMetricCompletedWhenVelocityMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of("velocity"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(velocityCalculator.calculateVelocity(any()))
				.thenReturn(Velocity.builder().velocityForSP(10).velocityForCards(20).build());
			when(kanbanService.fetchDataFromKanban(request)).thenReturn(FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build());
			generateReporterService.generateBoardReport(request);

			verify(asyncExceptionHandler).remove(request.getBoardReportId());
			verify(pipelineService, never()).fetchGithubData(any());
			verify(kanbanService).fetchDataFromKanban(eq(request));
			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getBoardReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertEquals(10, response.getVelocity().getVelocityForSP());
			assertEquals(20, response.getVelocity().getVelocityForCards());

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldSaveReportResponseWithCycleTimeAndUpdateMetricCompletedWhenCycleTimeMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of("cycle time"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().boardMetricsCompleted(true).build());
			when(cycleTimeCalculator.calculateCycleTime(any(), any())).thenReturn(CycleTime.builder()
				.averageCycleTimePerSP(10)
				.totalTimeForCards(15)
				.averageCycleTimePerCard(20)
				.build());
			when(kanbanService.fetchDataFromKanban(request)).thenReturn(FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build());
			generateReporterService.generateBoardReport(request);

			verify(pipelineService, never()).fetchGithubData(any());
			verify(kanbanService).fetchDataFromKanban(eq(request));
			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getBoardReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertEquals(10, response.getCycleTime().getAverageCycleTimePerSP());
			assertEquals(20, response.getCycleTime().getAverageCycleTimePerCard());
			assertEquals(15, response.getCycleTime().getTotalTimeForCards());

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldSaveReportResponseWithClassificationAndUpdateMetricCompletedWhenClassificationMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of("classification"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<Classification> classifications = List.of(Classification.builder().build());
			when(classificationCalculator.calculate(any(), any())).thenReturn(classifications);
			when(kanbanService.fetchDataFromKanban(request)).thenReturn(FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build());
			generateReporterService.generateBoardReport(request);

			verify(pipelineService, never()).fetchGithubData(any());
			verify(kanbanService).fetchDataFromKanban(eq(request));
			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getBoardReportId()),
				responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertEquals(classifications, response.getClassificationList());

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldUpdateMetricCompletedWhenExceptionStart4() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of("classification"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(kanbanService.fetchDataFromKanban(request)).thenThrow(new NotFoundException(""));
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());

			generateReporterService.generateBoardReport(request);

			verify(asyncExceptionHandler).put(eq(request.getBoardReportId()), any());
			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

	}

	@Nested
	class GenerateDoraReport {

		@Test
		void shouldGenerateCsvFile() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			generateReporterService.generateDoraReport(request);

			verify(asyncExceptionHandler).remove(request.getPipelineReportId());
			verify(asyncExceptionHandler).remove(request.getSourceControlReportId());
			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(csvFileGenerator).convertPipelineDataToCSV(eq(pipelineCSVInfos), eq(request.getCsvTimeStamp()));
		}

		@Test
		void shouldGenerateCsvForPipelineWithPipelineMetricAndBuildInfoIsEmpty() throws IOException {
			Path csvFilePath = Path.of("./csv/exportPipelineMetrics-1683734399999.csv");
			DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
			mockDeployment.setRepository(GITHUB_REPOSITORY);

			CodebaseSetting codebaseSetting = CodebaseSetting.builder()
				.type(SourceType.GITHUB.name())
				.token(GITHUB_TOKEN)
				.leadTime(List.of(mockDeployment))
				.build();

			BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
				.type(PipelineType.BUILDKITE.name())
				.token(BUILDKITE_TOKEN)
				.deploymentEnvList(List.of(mockDeployment))
				.build();

			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(true)
				.metrics(List.of("lead time for changes", "deployment frequency"))
				.buildKiteSetting(buildKiteSetting)
				.codebaseSetting(codebaseSetting)
				.startTime("1661702400000")
				.endTime("1662739199000")
				.csvTimeStamp(TIMESTAMP)
				.build();

			when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
				.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
					.withCommit("")
					.withJobs(List.of(BuildKiteJobBuilder.withDefault().withState("broken").build()))
					.build()));
			when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());
			when(gitHubService.fetchPipelinesLeadTime(any(), any(), any()))
				.thenReturn(List.of(PipelineCsvFixture.MOCK_PIPELINE_LEAD_TIME_DATA()));

			doAnswer(invocation -> {
				Files.createDirectories(Path.of("./csv"));
				Files.createFile(csvFilePath);
				return null;
			}).when(csvFileGenerator).convertPipelineDataToCSV(any(), any());

			generateReporterService.generateDoraReport(request);

			boolean isExists = Files.exists(csvFilePath);
			assertTrue(isExists);
			Files.deleteIfExists(csvFilePath);
		}
	@Test
	void shouldGenerateCsvForPipelineWithPipelineMetricAndBuildInfoIsEmpty() throws IOException {
		Path csvFilePath = Path.of(APP_OUTPUT_CSV_PATH + "exportPipelineMetrics-1683734399999.csv");
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository(GITHUB_REPOSITORY);

		CodebaseSetting codebaseSetting = CodebaseSetting.builder()
			.type(SourceType.GITHUB.name())
			.token(GITHUB_TOKEN)
			.leadTime(List.of(mockDeployment))
			.build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type(PipelineType.BUILDKITE.name())
			.token(BUILDKITE_TOKEN)
			.deploymentEnvList(List.of(mockDeployment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(true)
			.metrics(List.of("lead time for changes", "deployment frequency"))
			.buildKiteSetting(buildKiteSetting)
			.codebaseSetting(codebaseSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.csvTimeStamp(TIMESTAMP)
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withCommit("")
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().withState("broken").build()))
				.build()));
		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());
		when(gitHubService.fetchPipelinesLeadTime(any(), any(), any()))
			.thenReturn(List.of(PipelineCsvFixture.MOCK_PIPELINE_LEAD_TIME_DATA()));

		doAnswer(invocation -> {
			Files.createDirectories(Path.of(APP_OUTPUT_CSV_PATH));
			Files.createFile(csvFilePath);
			return null;
		}).when(csvFileGenerator).convertPipelineDataToCSV(any(), any());

		generateReporterService.generateDoraReport(request);

		boolean isExists = Files.exists(csvFilePath);
		assertTrue(isExists);
		Files.deleteIfExists(csvFilePath);
	}

		@Test
		void shouldThrowErrorWhenCodeSettingIsNullButSourceControlMetricsIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.metrics(List.of("lead time for changes"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			try {
				generateReporterService.generateDoraReport(request);
				fail();
			}
			catch (BaseException e) {
				assertEquals(400, e.getStatus());
				assertEquals("Failed to fetch Github info due to code base setting is null.", e.getMessage());
			}

			verify(asyncExceptionHandler).remove(request.getPipelineReportId());
			verify(asyncExceptionHandler).remove(request.getSourceControlReportId());
			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(eq(pipelineCSVInfos),
				eq(request.getCsvTimeStamp()));
		}

	@Test
	void shouldGenerateCsvForPipelineWithPipelineMetric() throws IOException {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository(GITHUB_REPOSITORY);

		CodebaseSetting codebaseSetting = CodebaseSetting.builder()
			.type(SourceType.GITHUB.name())
			.token(GITHUB_TOKEN)
			.leadTime(List.of(mockDeployment))
			.build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type(PipelineType.BUILDKITE.name())
			.token(BUILDKITE_TOKEN)
			.deploymentEnvList(List.of(mockDeployment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(true)
			.metrics(List.of("lead time for changes", "deployment frequency"))
			.buildKiteSetting(buildKiteSetting)
			.codebaseSetting(codebaseSetting)
			.startTime(String.valueOf(Instant.MIN.getEpochSecond()))
			.endTime(String.valueOf(Instant.MAX.getEpochSecond()))
			.csvTimeStamp(TIMESTAMP)
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().build()))
				.withPipelineCreateTime("2022-09-09T04:57:34Z")
				.build()));
		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());
		when(gitHubService.fetchPipelinesLeadTime(any(), any(), any()))
			.thenReturn(List.of(PipelineCsvFixture.MOCK_PIPELINE_LEAD_TIME_DATA()));
		when(buildKiteService.getStepsBeforeEndStep(any(), any())).thenReturn(List.of("xx"));

		doAnswer(invocation -> {
			Files.createDirectories(Path.of(APP_OUTPUT_CSV_PATH));
			Files.createFile(mockPipelineCsvPath);
			return null;
		}).when(csvFileGenerator).convertPipelineDataToCSV(any(), any());

		generateReporterService.generateDoraReport(request);

			verify(asyncExceptionHandler).remove(request.getPipelineReportId());
			verify(asyncExceptionHandler).remove(request.getSourceControlReportId());
			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(eq(pipelineCSVInfos),
					eq(request.getCsvTimeStamp()));
		}

		@Test
		void shouldThrowErrorWhenBuildKiteSettingIsNullButPipelineMetricsIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.metrics(List.of("deployment frequency"))
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			try {
				generateReporterService.generateDoraReport(request);
				fail();
			}
			catch (BaseException e) {
				assertEquals("Failed to fetch BuildKite info due to BuildKite setting is null.", e.getMessage());
				assertEquals(400, e.getStatus());
			}

			verify(asyncExceptionHandler).remove(request.getPipelineReportId());
			verify(asyncExceptionHandler).remove(request.getSourceControlReportId());
			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(eq(pipelineCSVInfos),
					eq(request.getCsvTimeStamp()));
		}

		@Test
		void shouldGenerateCsvWithPipelineReportWhenPipeLineMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("deployment frequency", "change failure rate", "mean time to recovery"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchBuildKiteInfo(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			DeploymentFrequency fakeDeploymentFrequency = DeploymentFrequency.builder().build();
			ChangeFailureRate fakeChangeFailureRate = ChangeFailureRate.builder().build();
			MeanTimeToRecovery fakeMeantime = MeanTimeToRecovery.builder().build();
			when(deploymentFrequency.calculate(any(), any(), any())).thenReturn(fakeDeploymentFrequency);
			when(changeFailureRate.calculate(any())).thenReturn(fakeChangeFailureRate);
			when(meanToRecoveryCalculator.calculate(any())).thenReturn(fakeMeantime);

			generateReporterService.generateDoraReport(request);

			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getPipelineReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertEquals(fakeChangeFailureRate, response.getChangeFailureRate());
			assertEquals(fakeMeantime, response.getMeanTimeToRecovery());
			assertEquals(fakeChangeFailureRate, response.getChangeFailureRate());
			assertEquals(fakeDeploymentFrequency, response.getDeploymentFrequency());

			verify(csvFileGenerator).convertPipelineDataToCSV(eq(pipelineCSVInfos), eq(request.getCsvTimeStamp()));
		}

		@Test
		void shouldUpdateMetricCompletedWhenGenerateCsvWithPipelineReportFailed() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("change failure rate"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchBuildKiteInfo(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			when(changeFailureRate.calculate(any())).thenThrow(new NotFoundException(""));

			generateReporterService.generateDoraReport(request);

			verify(asyncExceptionHandler).put(eq(request.getPipelineReportId()), any());
			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

		@Test
		void shouldGenerateCsvWithSourceControlReportWhenSourceControlMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("lead time for changes"))
				.codebaseSetting(CodebaseSetting.builder().build())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchGithubData(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			LeadTimeForChanges fakeLeadTimeForChange = LeadTimeForChanges.builder().build();
			when(leadTimeForChangesCalculator.calculate(any())).thenReturn(fakeLeadTimeForChange);

			generateReporterService.generateDoraReport(request);

			verify(workDay).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getSourceControlReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertEquals(fakeLeadTimeForChange, response.getLeadTimeForChanges());

			verify(csvFileGenerator).convertPipelineDataToCSV(eq(pipelineCSVInfos), eq(request.getCsvTimeStamp()));
		}

		@Test
		void shouldGenerateCsvWithCachedDataWhenBuildKiteDataAlreadyExisted() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("lead time for changes", "change failure rate"))
				.codebaseSetting(CodebaseSetting.builder().build())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchGithubData(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			when(pipelineService.fetchBuildKiteInfo(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			LeadTimeForChanges fakeLeadTimeForChange = LeadTimeForChanges.builder().build();
			when(leadTimeForChangesCalculator.calculate(any())).thenReturn(fakeLeadTimeForChange);

			generateReporterService.generateDoraReport(request);

			verify(workDay, times(2)).changeConsiderHolidayMode(false);
			verify(asyncReportRequestHandler).putReport(eq(request.getSourceControlReportId()),
					responseArgumentCaptor.capture());

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(1800000L, response.getExportValidityTime());
			assertEquals(fakeLeadTimeForChange, response.getLeadTimeForChanges());

			verify(csvFileGenerator).convertPipelineDataToCSV(eq(pipelineCSVInfos), eq(request.getCsvTimeStamp()));
		}

		@Test
		void shouldUpdateMetricCompletedWhenGenerateCsvWithSourceControlReportFailed() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.considerHoliday(false)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("lead time for changes"))
				.codebaseSetting(CodebaseSetting.builder().build())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any()))
				.thenReturn(MetricsDataCompleted.builder().build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipelineWithCodebase(any(), any(), any(), any(), any()))
				.thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchGithubData(request)).thenReturn(
					FetchedData.BuildKiteData.builder().pipelineLeadTimes(List.of()).buildInfosList(List.of()).build());
			when(leadTimeForChangesCalculator.calculate(any())).thenThrow(new NotFoundException(""));

			generateReporterService.generateDoraReport(request);

			verify(asyncExceptionHandler).put(eq(request.getSourceControlReportId()), any());
			verify(asyncMetricsDataHandler).putMetricsDataCompleted(eq(request.getCsvTimeStamp()), any());
		}

	}

	@Nested
	class GenerateCSVForMetric {

		@Test
		void shouldCallCsvFileGenerator() {
			ReportResponse response = ReportResponse.builder().build();
			generateReporterService.generateCSVForMetric(response, "timestamp");

			verify(csvFileGenerator).convertMetricDataToCSV(eq(response), eq("timestamp"));
		}

	}

	@Nested
	class CheckGenerateReportIsDone {

		@Test
		void shouldThrowErrorWhenTimestampIsInvalid() {
			try {
				generateReporterService.checkGenerateReportIsDone(
						String.valueOf(System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME - 200));
				fail();
			}
			catch (BaseException e) {
				assertEquals("Failed to get report due to report time expires", e.getMessage());
				assertEquals(500, e.getStatus());
			}
		}

		@Test
		void shouldReturnMetricStatus() {
			String timeStamp = String.valueOf(System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME + 200);
			when(asyncMetricsDataHandler.isReportReady(timeStamp)).thenReturn(true);

			assertTrue(generateReporterService.checkGenerateReportIsDone(timeStamp));
		}

	}

	@Nested
	class GetComposedReportResponse {

		@Test
		void shouldGetDataFromCache() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(asyncExceptionHandler.get(any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(reportId, true);

			assertEquals(EXPORT_CSV_VALIDITY_TIME, res.getExportValidityTime());
			assertEquals(true, res.getAllMetricsCompleted());
			assertEquals(null, res.getReportMetricsError().getBoardMetricsError());
		}

		@Test
		void shouldReturnCompletedFalseGivenResponseNullMetricsDataCompletedFalseWhenGetDataFromCache() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(null);
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId)).thenReturn(MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.pipelineMetricsCompleted(false)
				.sourceControlMetricsCompleted(false)
				.build());
			when(asyncExceptionHandler.get(any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(reportId, false);

			assertEquals(EXPORT_CSV_VALIDITY_TIME, res.getExportValidityTime());
			assertEquals(false, res.getAllMetricsCompleted());
			assertEquals(false, res.getBoardMetricsCompleted());
			assertEquals(false, res.getPipelineMetricsCompleted());
			assertEquals(false, res.getSourceControlMetricsCompleted());
			assertEquals(null, res.getReportMetricsError().getBoardMetricsError());
		}

		@Test
		void shouldReturnCompletedTrueGivenResponseNonNullMetricsDataCompletedFalseWhenGetDataFromCache() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId)).thenReturn(MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.pipelineMetricsCompleted(false)
				.sourceControlMetricsCompleted(false)
				.build());
			when(asyncExceptionHandler.get(any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(reportId, true);

			assertEquals(EXPORT_CSV_VALIDITY_TIME, res.getExportValidityTime());
			assertEquals(true, res.getAllMetricsCompleted());
			assertEquals(true, res.getBoardMetricsCompleted());
			assertEquals(true, res.getPipelineMetricsCompleted());
			assertEquals(true, res.getSourceControlMetricsCompleted());
			assertEquals(null, res.getReportMetricsError().getBoardMetricsError());
		}

		@Test
		void shouldReturnCompletedNullGivenMetricsDataCompletedNullWhenGetDataFromCache() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId)).thenReturn(null);
			when(asyncExceptionHandler.get(any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(reportId, false);

			assertEquals(EXPORT_CSV_VALIDITY_TIME, res.getExportValidityTime());
			assertEquals(false, res.getAllMetricsCompleted());
			assertEquals(null, res.getBoardMetricsCompleted());
			assertEquals(null, res.getPipelineMetricsCompleted());
			assertEquals(null, res.getSourceControlMetricsCompleted());
			assertEquals(null, res.getReportMetricsError().getBoardMetricsError());
		}

		@Test
		void shouldReturnErrorDataWhenExceptionIs404Or403Or401() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(asyncExceptionHandler.get(any())).thenReturn(new NotFoundException("error"));

			ReportResponse res = generateReporterService.getComposedReportResponse(reportId, true);

			assertEquals(EXPORT_CSV_VALIDITY_TIME, res.getExportValidityTime());
			assertEquals(true, res.getAllMetricsCompleted());
			assertEquals(404, res.getReportMetricsError().getBoardMetricsError().getStatus());
		}

		@Test
		void shouldThrowGenerateReportExceptionWhenErrorIs500() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(asyncExceptionHandler.get(any())).thenReturn(new GenerateReportException("errorMessage"));

			try {
				generateReporterService.getComposedReportResponse(reportId, true);
				fail();
			}
			catch (BaseException e) {
				assertEquals("errorMessage", e.getMessage());
				assertEquals(500, e.getStatus());
			}
		}

		@Test
		void shouldThrowServiceUnavailableExceptionWhenErrorIs503() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(asyncExceptionHandler.get(any())).thenReturn(new ServiceUnavailableException("errorMessage"));

		when(jiraService.getStoryPointsAndCycleTimeForDoneCards(any(), any(), any(), any()))
			.thenReturn(CardCollection.builder()
				.storyPointSum(2)
				.cardsNumber(1)
				.jiraCardDTOList(BoardCsvFixture.MOCK_DONE_CARD_LIST())
				.build());
		when(jiraService.getStoryPointsAndCycleTimeForNonDoneCards(any(), any(), any()))
			.thenReturn(CardCollection.builder()
				.storyPointSum(2)
				.cardsNumber(1)
				.jiraCardDTOList(BoardCsvFixture.MOCK_NON_DONE_CARD_LIST())
				.build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(BoardCsvFixture.MOCK_JIRA_COLUMN_LIST())
			.jiraColumns(Collections.emptyList())
			.build());
		when(urlGenerator.getUri(any())).thenReturn(mockUrl);
		doAnswer(invocation -> {
			Files.createDirectories(Path.of(APP_OUTPUT_CSV_PATH));
			Files.createFile(mockBoardCsvPath);
			return null;
		}).when(csvFileGenerator).convertBoardDataToCSV(any(), any(), any(), any());

			generateReporterService.generateReporter(request);

			boolean isExists = Files.exists(mockBoardCsvPath);
			assertTrue(isExists);
			Files.deleteIfExists(mockBoardCsvPath);
		}

		@Test
		void shouldThrowServiceUnavailableExceptionWhenErrorIs503() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(asyncExceptionHandler.get(any())).thenReturn(new ServiceUnavailableException("errorMessage"));

			try {
				generateReporterService.getComposedReportResponse(reportId, true);
				fail();
			}
			catch (BaseException e) {
				assertEquals("errorMessage", e.getMessage());
				assertEquals(503, e.getStatus());
			}
		}

		@Test
		void shouldThrowRequestFailedExceptionWhenErrorIsDefault() {
			String reportId = "reportId";
			when(asyncReportRequestHandler.getReport(any())).thenReturn(ReportResponse.builder().build());
			when(asyncMetricsDataHandler.getMetricsDataCompleted(reportId))
				.thenReturn(MetricsDataCompleted.builder().build());
			when(asyncExceptionHandler.get(any())).thenReturn(new BadRequestException("error"));

			try {
				generateReporterService.getComposedReportResponse(reportId, true);
				fail();
			}
			catch (BaseException e) {
				assertEquals("Request failed with status statusCode 400, error: error", e.getMessage());
				assertEquals(400, e.getStatus());
			}
		}

	}

	@Nested
	class DeleteExpireCSV {

		Path mockPipelineCsvPath = Path.of("./csv/exportPipelineMetrics-1683734399999.csv");

		@Test
		void shouldDeleteExpireCsvWhenExportCsvWithCsvOutsideThirtyMinutes() throws IOException {
			Files.createDirectories(Path.of(APP_OUTPUT_CSV_PATH));
		Files.createFile(mockPipelineCsvPath);

			generateReporterService.deleteExpireCSV(System.currentTimeMillis(), new File(APP_OUTPUT_CSV_PATH));

			boolean isFileDeleted = Files.notExists(mockPipelineCsvPath);
			assertTrue(isFileDeleted);
		}

		@Test
		void shouldNotDeleteOldCsvWhenExportCsvWithoutOldCsvInsideThirtyMinutes() throws IOException {
			Files.createDirectories(Path.of(APP_OUTPUT_CSV_PATH));
		long currentTimeStamp = System.currentTimeMillis();
		Path csvFilePath = Path
			.of(String.format(APP_OUTPUT_CSV_PATH + "exportPipelineMetrics-%s.csv", currentTimeStamp));
		Files.createFile(csvFilePath);

			generateReporterService.deleteExpireCSV(currentTimeStamp - 800000, new File(APP_OUTPUT_CSV_PATH));

			boolean isFileDeleted = Files.notExists(csvFilePath);
			assertFalse(isFileDeleted);
			Files.deleteIfExists(csvFilePath);
		}

		@Test
		void shouldDeleteFailWhenDeleteCSV() {
			File mockFile = mock(File.class);
			when(mockFile.getName()).thenReturn("file1-1683734399999.CSV");
			when(mockFile.delete()).thenReturn(false);
			File[] mockFiles = new File[] { mockFile };
			File directory = mock(File.class);
			when(directory.listFiles()).thenReturn(mockFiles);

			Boolean deleteStatus = generateReporterService.deleteExpireCSV(System.currentTimeMillis(), directory);

			assertTrue(deleteStatus);
		}

		@Test
		void shouldThrowExceptionWhenDeleteCSV() {
			File mockFile = mock(File.class);
			when(mockFile.getName()).thenReturn("file1-1683734399999.CSV");
			when(mockFile.delete()).thenThrow(new RuntimeException("test"));
			File[] mockFiles = new File[] { mockFile };
			File directory = mock(File.class);
			when(directory.listFiles()).thenReturn(mockFiles);

			Boolean deleteStatus = generateReporterService.deleteExpireCSV(System.currentTimeMillis(), directory);

			assertFalse(deleteStatus);
		}

	private MeanTimeToRecovery createMockMeanToRecovery() {
		return MeanTimeToRecovery.builder()
			.meanTimeRecoveryPipelines(List.of(MeanTimeToRecoveryOfPipeline.builder().build()))
			.avgMeanTimeToRecovery(AvgMeanTimeToRecovery.builder().build())
			.build();
	}

	@Test
	void shouldReturnTrueWhenReportIsReady() {
		// given
		String fileTimeStamp = Long.toString(System.currentTimeMillis());
		// when
		when(asyncMetricsDataHandler.isReportReady(fileTimeStamp)).thenReturn(true);
		boolean generateReportIsOver = generateReporterService.checkGenerateReportIsDone(fileTimeStamp);
		// then
		assertTrue(generateReportIsOver);
	}

	@Test
	void shouldReturnFalseWhenReportIsNotReady() {
		// given
		String fileTimeStamp = Long.toString(System.currentTimeMillis());
		asyncReportRequestHandler.putReport("111111111", MetricCsvFixture.MOCK_METRIC_CSV_DATA_WITH_ONE_PIPELINE());
		// when
		boolean generateReportIsOver = generateReporterService.checkGenerateReportIsDone(fileTimeStamp);
		// then
		assertFalse(generateReportIsOver);

	}

	@Test
	void shouldThrowExceptionWhenTimeOutOf30m() {
		String fileExpiredTimeStamp = Long.toString(System.currentTimeMillis() - 1900000L);

		var generateReportException = assertThrows(GenerateReportException.class,
				() -> generateReporterService.checkGenerateReportIsDone(fileExpiredTimeStamp));

		assertEquals(500, generateReportException.getStatus());
		assertEquals("Failed to get report due to report time expires", generateReportException.getMessage());
	}

	@Test
	void shouldReturnReportResponse() {
		String reportId = Long.toString(System.currentTimeMillis());

		when(asyncReportRequestHandler.getReport(reportId))
			.thenReturn(MetricCsvFixture.MOCK_METRIC_CSV_DATA_WITH_ONE_PIPELINE());
		ReportResponse reportResponse = generateReporterService.getReportFromHandler(reportId);

		assertEquals(MetricCsvFixture.MOCK_METRIC_CSV_DATA_WITH_ONE_PIPELINE().getClassificationList(),
				reportResponse.getClassificationList());
		assertEquals(MetricCsvFixture.MOCK_METRIC_CSV_DATA_WITH_ONE_PIPELINE().getExportValidityTime(),
				reportResponse.getExportValidityTime());
		assertEquals(MetricCsvFixture.MOCK_METRIC_CSV_DATA_WITH_ONE_PIPELINE().getCycleTime(),
				reportResponse.getCycleTime());
	}

	@Test
	void shouldThrowUnauthorizedExceptionWhenCheckGenerateReportIsDone() {
		String timeStamp = Long.toString(System.currentTimeMillis());
		String reportId = IdUtil.getPipelineReportId(timeStamp);

		when(asyncExceptionHandler.get(reportId))
			.thenReturn(new UnauthorizedException("Failed to get GitHub info_status: 401, reason: PermissionDeny"));

		ErrorInfo pipelineError = generateReporterService.getReportErrorAndHandleAsyncException(timeStamp)
			.getPipelineMetricsError();

		assertEquals(401, pipelineError.getStatus());
		assertEquals("Failed to get GitHub info_status: 401, reason: PermissionDeny", pipelineError.getErrorMessage());
	}

	@Test
	void shouldThrowPermissionDenyExceptionWhenCheckGenerateReportIsDone() {
		String timeStamp = Long.toString(System.currentTimeMillis());
		String reportId = IdUtil.getPipelineReportId(timeStamp);
		asyncExceptionHandler.put(reportId,
				new PermissionDenyException("Failed to get GitHub info_status: 403, reason: PermissionDeny"));
		when(asyncExceptionHandler.get(reportId))
			.thenReturn(new PermissionDenyException("Failed to get GitHub info_status: 403, reason: PermissionDeny"));

		ErrorInfo pipelineError = generateReporterService.getReportErrorAndHandleAsyncException(timeStamp)
			.getPipelineMetricsError();

		assertEquals(403, pipelineError.getStatus());
		assertEquals("Failed to get GitHub info_status: 403, reason: PermissionDeny", pipelineError.getErrorMessage());
	}

	@Test
	void shouldThrowNotFoundExceptionWhenCheckGenerateReportIsDone() {
		String timeStamp = Long.toString(System.currentTimeMillis());
		String reportId = IdUtil.getPipelineReportId(timeStamp);
		when(asyncExceptionHandler.get(reportId))
			.thenReturn(new NotFoundException("Failed to get GitHub info_status: 404, reason: NotFound"));

		ErrorInfo pipelineError = generateReporterService.getReportErrorAndHandleAsyncException(timeStamp)
			.getPipelineMetricsError();

		assertEquals(404, pipelineError.getStatus());
		assertEquals("Failed to get GitHub info_status: 404, reason: NotFound", pipelineError.getErrorMessage());
	}

	@Test
	void shouldThrowGenerateReportExceptionWhenCheckGenerateReportIsDone() {
		String timeStamp = Long.toString(System.currentTimeMillis());
		String reportId = IdUtil.getPipelineReportId(timeStamp);
		when(asyncExceptionHandler.get(reportId))
			.thenReturn(new GenerateReportException("Failed to get GitHub info_status: 500, reason: GenerateReport"));

		BaseException exception = assertThrows(GenerateReportException.class,
				() -> generateReporterService.getReportErrorAndHandleAsyncException(timeStamp));

		assertEquals(500, exception.getStatus());
		assertEquals("Failed to get GitHub info_status: 500, reason: GenerateReport", exception.getMessage());
	}

	@Test
	void shouldThrowServiceUnavailableExceptionWhenCheckGenerateReportIsDone() {
		String timeStamp = Long.toString(System.currentTimeMillis());
		String reportId = IdUtil.getPipelineReportId(timeStamp);
		when(asyncExceptionHandler.get(reportId)).thenReturn(
				new ServiceUnavailableException("Failed to get GitHub info_status: 503, reason: ServiceUnavailable"));

		BaseException exception = assertThrows(ServiceUnavailableException.class,
				() -> generateReporterService.getReportErrorAndHandleAsyncException(timeStamp));

		assertEquals(503, exception.getStatus());
		assertEquals("Failed to get GitHub info_status: 503, reason: ServiceUnavailable", exception.getMessage());
	}

	@Test
	void shouldThrowRequestFailedExceptionWhenCheckGenerateReportIsDone() {
		String timeStamp = Long.toString(System.currentTimeMillis());
		String reportId = IdUtil.getPipelineReportId(timeStamp);
		when(asyncExceptionHandler.get(reportId)).thenReturn(new RequestFailedException(405, "RequestFailedException"));

		BaseException exception = assertThrows(RequestFailedException.class,
				() -> generateReporterService.getReportErrorAndHandleAsyncException(timeStamp));

		assertEquals(405, exception.getStatus());
		assertEquals(
				"Request failed with status statusCode 405, error: Request failed with status statusCode 405, error: RequestFailedException",
				exception.getMessage());
	}

	@Test
	void shouldThrowBadRequestExceptionGivenMetricsContainKanbanWhenJiraSettingIsNull() {
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of(RequireDataEnum.CYCLE_TIME.getValue()))
			.jiraBoardSetting(null)
			.startTime("123")
			.endTime("123")
			.csvTimeStamp(TIMESTAMP)
			.build();

		BadRequestException badRequestException = assertThrows(BadRequestException.class,
				() -> generateReporterService.generateReporter(request));

		assertEquals("Failed to fetch Jira info due to Jira board setting is null.", badRequestException.getMessage());
	}

	@Test
	void shouldThrowBadRequestExceptionGivenMetricsContainCodeBaseWhenCodeBaseSettingIsNull() {
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of(RequireDataEnum.LEAD_TIME_FOR_CHANGES.getValue()))
			.codebaseSetting(null)
			.startTime("123")
			.endTime("123")
			.csvTimeStamp(TIMESTAMP)
			.build();

		BadRequestException badRequestException = assertThrows(BadRequestException.class,
				() -> generateReporterService.generateReporter(request));

		assertEquals("Failed to fetch Github info due to code base setting is null.", badRequestException.getMessage());
	}

	@Test
	void shouldThrowBadRequestExceptionGivenMetricsContainBuildKiteWhenBuildKiteSettingIsNull() {
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of(RequireDataEnum.CHANGE_FAILURE_RATE.getValue()))
			.buildKiteSetting(null)
			.startTime("123")
			.endTime("123")
			.csvTimeStamp(TIMESTAMP)
			.build();

		BadRequestException badRequestException = assertThrows(BadRequestException.class,
				() -> generateReporterService.generateReporter(request));

		assertEquals("Failed to fetch BuildKite info due to BuildKite setting is null.",
				badRequestException.getMessage());
	}

	@Test
	void shouldInitializeValueFalseGivenPreviousMapperIsNullWhenInitializeRelatedMetricsCompleted() {
		String timeStamp = TIMESTAMP;
		List<String> metrics = List.of(RequireDataEnum.CYCLE_TIME.getValue());
		MetricsDataCompleted expectedPut = MetricsDataCompleted.builder()
			.boardMetricsCompleted(false)
			.pipelineMetricsCompleted(null)
			.sourceControlMetricsCompleted(null)
			.build();

		when(asyncMetricsDataHandler.getMetricsDataCompleted(timeStamp)).thenReturn(null);

		generateReporterService.initializeMetricsDataCompletedInHandler(timeStamp, metrics);

		verify(asyncMetricsDataHandler).putMetricsDataCompleted(timeStamp, expectedPut);
	}

	@Test
	void shouldInitializeValueFalseGivenPreviousValueExistWhenInitializeRelatedMetricsCompleted() {
		String timeStamp = TIMESTAMP;
		List<String> metrics = List.of(RequireDataEnum.CYCLE_TIME.getValue(),
				RequireDataEnum.DEPLOYMENT_FREQUENCY.getValue());
		MetricsDataCompleted previousMetricsDataCompleted = MetricsDataCompleted.builder()
			.boardMetricsCompleted(true)
			.pipelineMetricsCompleted(null)
			.sourceControlMetricsCompleted(null)
			.build();
		MetricsDataCompleted expectedPut = MetricsDataCompleted.builder()
			.boardMetricsCompleted(false)
			.pipelineMetricsCompleted(false)
			.sourceControlMetricsCompleted(null)
			.build();

		when(asyncMetricsDataHandler.getMetricsDataCompleted(timeStamp)).thenReturn(previousMetricsDataCompleted);

		generateReporterService.initializeMetricsDataCompletedInHandler(timeStamp, metrics);

		verify(asyncMetricsDataHandler).putMetricsDataCompleted(timeStamp, expectedPut);
	}

	@ParameterizedTest
	@MethodSource({ "provideDataForTest" })
	void shouldUpdateAndSetMetricsReadyNonnullTrueWhenMetricsExistAndPreviousMetricsReadyNotNull(List<String> metrics,
			MetricsDataCompleted previousReady, MetricsDataCompleted expectedReady) {
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(metrics)
			.jiraBoardSetting(buildJiraBoardSetting())
			.buildKiteSetting(buildPipelineSetting())
			.codebaseSetting(buildCodeBaseSetting())
			.startTime("123")
			.endTime("123")
			.csvTimeStamp(TIMESTAMP)
			.build();

		when(asyncMetricsDataHandler.getMetricsDataCompleted(request.getCsvTimeStamp())).thenReturn(previousReady);

		generateReporterService.updateMetricsDataCompletedInHandler(request.getCsvTimeStamp(), request.getMetrics());

		verify(asyncMetricsDataHandler, times(1)).putMetricsDataCompleted(request.getCsvTimeStamp(), expectedReady);
	}

	@Test
	void shouldNotUpdateMetricsAndThrowExceptionWhenPreviousMetricsDataReadyNull() {
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of("velocity", "cycle time", "classification", "deployment frequency", "change failure rate",
					"mean time to recovery", "lead time for changes"))
			.jiraBoardSetting(buildJiraBoardSetting())
			.buildKiteSetting(buildPipelineSetting())
			.codebaseSetting(buildCodeBaseSetting())
			.startTime("123")
			.endTime("123")
			.csvTimeStamp(TIMESTAMP)
			.build();

		when(asyncMetricsDataHandler.getMetricsDataCompleted(anyString())).thenReturn(null);

		assertThrows(GenerateReportException.class, () -> generateReporterService
			.updateMetricsDataCompletedInHandler(request.getCsvTimeStamp(), request.getMetrics()));

	}

	@Test
	void shouldReturnComposedReportResponseWhenBothBoardResponseAndDoraResponseReady() {
		ReportResponse boardResponse = ReportResponse.builder()
			.boardMetricsCompleted(true)
			.cycleTime(CycleTime.builder().averageCycleTimePerCard(20.0).build())
			.velocity(Velocity.builder().velocityForCards(10).build())
			.classificationList(List.of())
			.build();
		ReportResponse pipelineResponse = ReportResponse.builder()
			.pipelineMetricsCompleted(true)
			.changeFailureRate(ChangeFailureRate.builder()
				.avgChangeFailureRate(AvgChangeFailureRate.builder().name("name").failureRate(0.1f).build())
				.build())
			.deploymentFrequency(DeploymentFrequency.builder()
				.avgDeploymentFrequency(
						AvgDeploymentFrequency.builder().name("deploymentFrequency").deploymentFrequency(0.8f).build())
				.build())
			.meanTimeToRecovery(MeanTimeToRecovery.builder()
				.avgMeanTimeToRecovery(AvgMeanTimeToRecovery.builder().timeToRecovery(BigDecimal.TEN).build())
				.build())
			.build();

		String timeStamp = TIMESTAMP;
		String boardTimeStamp = "board-1683734399999";
		String pipelineTimestamp = "pipeline-1683734399999";

		when(generateReporterService.getReportFromHandler(boardTimeStamp)).thenReturn(boardResponse);
		when(generateReporterService.getReportFromHandler(pipelineTimestamp)).thenReturn(pipelineResponse);
		when(asyncMetricsDataHandler.getMetricsDataCompleted(timeStamp))
			.thenReturn(new MetricsDataCompleted(Boolean.TRUE, Boolean.TRUE, null));

		ReportResponse composedResponse = generateReporterService.getComposedReportResponse(timeStamp, true);

		assertTrue(composedResponse.getAllMetricsCompleted());
		assertEquals(20.0, composedResponse.getCycleTime().getAverageCycleTimePerCard());
		assertEquals("deploymentFrequency",
				composedResponse.getDeploymentFrequency().getAvgDeploymentFrequency().getName());
		assertEquals(0.8f,
				composedResponse.getDeploymentFrequency().getAvgDeploymentFrequency().getDeploymentFrequency());
	}

	@Test
	void shouldReturnBoardReportResponseWhenDoraResponseIsNullAndGenerateReportIsOver() {
		ReportResponse boardResponse = ReportResponse.builder()
			.boardMetricsCompleted(true)
			.cycleTime(CycleTime.builder().averageCycleTimePerCard(20.0).build())
			.velocity(Velocity.builder().velocityForCards(10).build())
			.classificationList(List.of())
			.build();

		String timeStamp = TIMESTAMP;
		String boardTimeStamp = "board-1683734399999";
		String doraTimestamp = "dora-1683734399999";

		when(generateReporterService.getReportFromHandler(boardTimeStamp)).thenReturn(boardResponse);
		when(generateReporterService.getReportFromHandler(doraTimestamp)).thenReturn(null);
		when(asyncMetricsDataHandler.getMetricsDataCompleted(timeStamp))
			.thenReturn(new MetricsDataCompleted(Boolean.TRUE, Boolean.TRUE, null));

		ReportResponse composedResponse = generateReporterService.getComposedReportResponse(timeStamp, true);

		assertTrue(composedResponse.getAllMetricsCompleted());
		assertTrue(composedResponse.getBoardMetricsCompleted());
		assertEquals(20.0, composedResponse.getCycleTime().getAverageCycleTimePerCard());
	}

	@Test
	void shouldDoConvertMetricDataToCSVWhenCallGenerateCSVForMetrics() throws IOException {
		String timeStamp = TIMESTAMP;
		ObjectMapper mapper = new ObjectMapper();
		ReportResponse reportResponse = mapper
			.readValue(new File("src/test/java/heartbeat/controller/report/reportResponse.json"), ReportResponse.class);
		doNothing().when(csvFileGenerator).convertMetricDataToCSV(any(), any());

		generateReporterService.generateCSVForMetric(reportResponse, timeStamp);

		verify(csvFileGenerator, times(1)).convertMetricDataToCSV(reportResponse, timeStamp);
	}

	@Test
	void shouldPutReportInHandlerWhenCallSaveReporterInHandler() throws IOException {
		String timeStamp = CSV_TIMESTAMP;
		String reportId = IdUtil.getPipelineReportId(timeStamp);
		ObjectMapper mapper = new ObjectMapper();
		ReportResponse reportResponse = mapper
			.readValue(new File("src/test/java/heartbeat/controller/report/reportResponse.json"), ReportResponse.class);
		doNothing().when(asyncReportRequestHandler).putReport(any(), any());

		generateReporterService.saveReporterInHandler(reportResponse, reportId);

		verify(asyncReportRequestHandler, times(1)).putReport(reportId, reportResponse);
	}

	@Test
	void shouldPutBoardReportIntoHandlerWhenCallGenerateBoardReport() throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		GenerateReportRequest reportRequest = mapper.readValue(new File(REQUEST_FILE_PATH),
				GenerateReportRequest.class);
		ReportResponse reportResponse = mapper.readValue(new File(RESPONSE_FILE_PATH), ReportResponse.class);
		reportRequest.setCsvTimeStamp(CSV_TIMESTAMP);
		String reportId = "board-20240109232359";
		MetricsDataCompleted previousMetricsReady = MetricsDataCompleted.builder()
			.boardMetricsCompleted(true)
			.pipelineMetricsCompleted(false)
			.sourceControlMetricsCompleted(false)
			.build();
		GenerateReporterService spyGenerateReporterService = spy(generateReporterService);

		doReturn(reportResponse).when(spyGenerateReporterService).generateReporter(reportRequest);
		when(asyncMetricsDataHandler.getMetricsDataCompleted(reportRequest.getCsvTimeStamp()))
			.thenReturn(previousMetricsReady);

		spyGenerateReporterService.generateBoardReport(reportRequest);

		verify(spyGenerateReporterService, times(1)).generateReporter(reportRequest);
		verify(asyncExceptionHandler, times(1)).remove(reportId);
		verify(spyGenerateReporterService, times(1))
			.initializeMetricsDataCompletedInHandler(reportRequest.getCsvTimeStamp(), reportRequest.getMetrics());
		verify(spyGenerateReporterService, times(1)).saveReporterInHandler(
				spyGenerateReporterService.generateReporter(reportRequest), reportRequest.getCsvTimeStamp());
		verify(spyGenerateReporterService, times(1))
			.updateMetricsDataCompletedInHandler(reportRequest.getCsvTimeStamp(), reportRequest.getMetrics());
	}

	@Test
	void shouldPutExceptionInHandlerWhenCallGenerateBoardReportThrowException() throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		GenerateReportRequest reportRequest = mapper.readValue(new File(REQUEST_FILE_PATH),
				GenerateReportRequest.class);
		reportRequest.setCsvTimeStamp(CSV_TIMESTAMP);
		String reportId = "board-20240109232359";
		GenerateReporterService spyGenerateReporterService = spy(generateReporterService);
		UnauthorizedException e = new UnauthorizedException("Error message");

		doThrow(e).when(spyGenerateReporterService).generateReporter(any());
		when(asyncMetricsDataHandler.getMetricsDataCompleted(reportRequest.getCsvTimeStamp()))
			.thenReturn(MetricsDataCompleted.builder().build());

		spyGenerateReporterService.generateBoardReport(reportRequest);

		verify(spyGenerateReporterService, times(1))
			.initializeMetricsDataCompletedInHandler(reportRequest.getCsvTimeStamp(), reportRequest.getMetrics());
		verify(spyGenerateReporterService, times(1))
			.saveReporterInHandler(spyGenerateReporterService.generateReporter(reportRequest), reportId);
		verify(asyncExceptionHandler, times(1)).put(reportId, e);
	}

	@Test
	void shouldPutExceptionInHandlerWhenCallGeneratePipelineReportThrowException() throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		GenerateReportRequest reportRequest = mapper.readValue(new File(REQUEST_FILE_PATH),
				GenerateReportRequest.class);
		reportRequest.setCsvTimeStamp("20240109232359");
		reportRequest.setMetrics(List.of(RequireDataEnum.DEPLOYMENT_FREQUENCY.getValue()));
		String reportId = "pipeline-20240109232359";
		GenerateReporterService spyGenerateReporterService = spy(generateReporterService);
		PermissionDenyException e = new PermissionDenyException("Error message");

		doThrow(e).when(spyGenerateReporterService).generateReporter(any());
		when(asyncMetricsDataHandler.getMetricsDataCompleted(reportRequest.getCsvTimeStamp()))
			.thenReturn(MetricsDataCompleted.builder().build());

		spyGenerateReporterService.generateDoraReport(reportRequest);

		verify(spyGenerateReporterService, times(1))
			.initializeMetricsDataCompletedInHandler(reportRequest.getCsvTimeStamp(), reportRequest.getMetrics());
		verify(spyGenerateReporterService, times(1))
			.saveReporterInHandler(spyGenerateReporterService.generateReporter(reportRequest), reportId);
		verify(asyncExceptionHandler, times(1)).put(reportId, e);
	}

	@Test
	void shouldGeneratePipelineReportAndUpdatePipelineMetricsReadyWhenCallGeneratePipelineReport() throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		GenerateReportRequest reportRequest = mapper.readValue(new File(REQUEST_FILE_PATH),
				GenerateReportRequest.class);
		reportRequest.setMetrics(List.of("Deployment frequency"));
		ReportResponse reportResponse = mapper.readValue(new File(RESPONSE_FILE_PATH), ReportResponse.class);
		GenerateReporterService spyGenerateReporterService = spy(generateReporterService);
		reportRequest.setCsvTimeStamp(CSV_TIMESTAMP);
		String reportId = "pipeline-20240109232359";
		MetricsDataCompleted previousMetricsReady = MetricsDataCompleted.builder()
			.boardMetricsCompleted(null)
			.pipelineMetricsCompleted(false)
			.sourceControlMetricsCompleted(false)
			.build();

		doReturn(reportResponse).when(spyGenerateReporterService).generateReporter(reportRequest);
		when(asyncMetricsDataHandler.getMetricsDataCompleted(reportRequest.getCsvTimeStamp()))
			.thenReturn(previousMetricsReady);

		spyGenerateReporterService.generateDoraReport(reportRequest);

		verify(spyGenerateReporterService, times(1)).generateReporter(any());
		verify(asyncExceptionHandler, times(1)).remove(reportId);
		verify(spyGenerateReporterService, times(1)).initializeMetricsDataCompletedInHandler(any(), any());
		verify(spyGenerateReporterService, times(1))
			.saveReporterInHandler(spyGenerateReporterService.generateReporter(any()), reportId);
		verify(spyGenerateReporterService, times(1)).updateMetricsDataCompletedInHandler(any(), any());
	}

	@Test
	void shouldGenerateCodebaseReportAndUpdateCodebaseMetricsReadyWhenCallGenerateSourceControlReport()
			throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		GenerateReportRequest reportRequest = mapper.readValue(new File(REQUEST_FILE_PATH),
				GenerateReportRequest.class);
		reportRequest.setMetrics(List.of("Lead time for changes"));
		ReportResponse reportResponse = mapper.readValue(new File(RESPONSE_FILE_PATH), ReportResponse.class);
		GenerateReporterService spyGenerateReporterService = spy(generateReporterService);
		reportRequest.setCsvTimeStamp(CSV_TIMESTAMP);
		String reportId = "sourceControl-20240109232359";
		MetricsDataCompleted previousMetricsReady = MetricsDataCompleted.builder()
			.boardMetricsCompleted(null)
			.pipelineMetricsCompleted(false)
			.sourceControlMetricsCompleted(false)
			.build();

		doReturn(reportResponse).when(spyGenerateReporterService).generateReporter(reportRequest);
		when(asyncMetricsDataHandler.getMetricsDataCompleted(reportRequest.getCsvTimeStamp()))
			.thenReturn(previousMetricsReady);

		spyGenerateReporterService.generateDoraReport(reportRequest);

		verify(spyGenerateReporterService, times(1)).generateReporter(any());
		verify(asyncExceptionHandler, times(1)).remove(reportId);
		verify(spyGenerateReporterService, times(1)).initializeMetricsDataCompletedInHandler(any(), any());
		verify(spyGenerateReporterService, times(1))
			.saveReporterInHandler(spyGenerateReporterService.generateReporter(any()), reportId);
		verify(spyGenerateReporterService, times(1)).updateMetricsDataCompletedInHandler(any(), any());

	}

	private JiraBoardSetting buildJiraBoardSetting() {
		return JiraBoardSetting.builder()
			.treatFlagCardAsBlock(true)
			.targetFields(BoardCsvFixture.MOCK_TARGET_FIELD_LIST())
			.build();
	}

	private BuildKiteSetting buildPipelineSetting() {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository(GITHUB_REPOSITORY);
		return BuildKiteSetting.builder()
			.type(PipelineType.BUILDKITE.name())
			.token(BUILDKITE_TOKEN)
			.deploymentEnvList(List.of(mockDeployment))
			.build();
	}

	private CodebaseSetting buildCodeBaseSetting() {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository(GITHUB_REPOSITORY);
		return CodebaseSetting.builder()
			.type(SourceType.GITHUB.name())
			.token(GITHUB_TOKEN)
			.leadTime(List.of(mockDeployment))
			.build();
	}

	private static Stream<Arguments> provideDataForTest() {
		return Stream.of(
				Arguments.of(List.of("velocity", "deployment frequency", "lead time for changes"),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(false)
							.pipelineMetricsCompleted(false)
							.sourceControlMetricsCompleted(null)
							.build(),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(true)
							.pipelineMetricsCompleted(true)
							.sourceControlMetricsCompleted(null)
							.build()),
				Arguments.of(List.of("velocity", "deployment frequency", "lead time for changes"),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(false)
							.pipelineMetricsCompleted(false)
							.sourceControlMetricsCompleted(false)
							.build(),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(true)
							.pipelineMetricsCompleted(true)
							.sourceControlMetricsCompleted(true)
							.build()),
				Arguments.of(List.of("velocity"),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(false)
							.pipelineMetricsCompleted(null)
							.sourceControlMetricsCompleted(null)
							.build(),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(true)
							.pipelineMetricsCompleted(null)
							.sourceControlMetricsCompleted(null)
							.build()),
				Arguments.of(List.of("deployment frequency", "change failure rate", "mean time to recovery"),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(null)
							.pipelineMetricsCompleted(false)
							.sourceControlMetricsCompleted(null)
							.build(),
						MetricsDataCompleted.builder()
							.boardMetricsCompleted(null)
							.pipelineMetricsCompleted(true)
							.sourceControlMetricsCompleted(null)
							.build()));
	}

}
