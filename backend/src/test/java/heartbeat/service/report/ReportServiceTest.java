package heartbeat.service.report;

import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.CodeBase;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.ErrorInfo;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.ShareApiDetailsResponse;
import heartbeat.controller.report.dto.response.UuidResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.repository.FileType;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.repository.FileRepository;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.InputStreamResource;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static heartbeat.controller.report.dto.request.MetricType.BOARD;
import static heartbeat.controller.report.dto.request.MetricType.DORA;
import static heartbeat.repository.FilePrefixType.USER_CONFIG_REPORT_PREFIX;
import static heartbeat.tools.TimeUtils.mockTimeStamp;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
public class ReportServiceTest {

	@InjectMocks
	ReportService reportService;

	@Mock
	CSVFileGenerator csvFileGenerator;

	@Mock
	AsyncMetricsDataHandler asyncMetricsDataHandler;

	@Mock
	FileRepository fileRepository;

	@Mock
	GenerateReporterService generateReporterService;

	@Mock
	ReportGenerator reportGenerator;

	@Captor
	ArgumentCaptor<SavedRequestInfo> argumentCaptor;

	public static final String START_TIME = "20240310";

	public static final String END_TIME = "20240409";

	public static final String TEST_UUID = "test-uuid";

	@Nested
	class ExportCsv {

		@Test
		void shouldCallCsvFileGeneratorToGotTheStreamWhenTimestampIsValid() throws IOException {
			long validTimestamp = System.currentTimeMillis() + 20000L;
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + validTimestamp;
			when(csvFileGenerator.getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp))
				.thenReturn(new InputStreamResource(new ByteArrayInputStream("csv data".getBytes())));
			when(fileRepository.getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT, TEST_UUID,
					START_TIME, END_TIME))
				.thenReturn(START_TIME + "-" + END_TIME + "-" + validTimestamp);
			when(fileRepository.isExpired(anyLong(), eq(validTimestamp))).thenReturn(false);

			InputStream result = reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME)
				.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(result)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals(returnData, "csv data");
			verify(csvFileGenerator).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
			verify(fileRepository).getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT, TEST_UUID,
					START_TIME, END_TIME);
			verify(fileRepository).isExpired(anyLong(), eq(validTimestamp));
		}

		@Test
		void shouldThrowNotFoundExceptionWhenTimestampIsValid() {
			long invalidTimestamp = System.currentTimeMillis() - 20000L;
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + invalidTimestamp;
			when(fileRepository.getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT, TEST_UUID,
					START_TIME, END_TIME))
				.thenReturn(START_TIME + "-" + END_TIME + "-" + invalidTimestamp);
			when(fileRepository.isExpired(anyLong(), eq(invalidTimestamp))).thenReturn(true);

			assertThrows(NotFoundException.class,
					() -> reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME));
			verify(csvFileGenerator, never()).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
		}

		@Test
		void shouldThrowNotFoundExceptionWhenTimestampIsNull() {
			long invalidTimestamp = System.currentTimeMillis() - 20000L;
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + invalidTimestamp;

			assertThrows(NotFoundException.class,
					() -> reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME));
			verify(csvFileGenerator, never()).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
			verify(fileRepository).getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT, TEST_UUID,
					START_TIME, END_TIME);
		}

	}

	@Nested
	class GenerateReportByType {

		String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));

		String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));

		String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

		List<MetricType> metricTypes = List.of(BOARD);

		GenerateReportRequest request = GenerateReportRequest.builder()
			.csvTimeStamp(timeStamp)
			.startTime(startTimeStamp)
			.endTime(endTimeStamp)
			.metrics(new ArrayList<>())
			.metricTypes(metricTypes)
			.timezone("Asia/Shanghai")
			.build();

		@Test
		void shouldSuccessfulGenerateBoardReportAndInitializeMetricDataWhenMetricTypesListOnlyHasBoardElement() {
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(ReportMetricsError.builder().build())
				.build();

			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService, never()).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

		@Test
		void shouldSuccessfulGenerateDoraReportWhenMetricTypesListOnlyHasDoraMetricType() {
			metricTypes = List.of(DORA);
			request.setMetricTypes(metricTypes);
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(ReportMetricsError.builder().build())
				.build();

			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService, never()).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

		@Test
		void shouldSuccessfulGenerateDoraReportAndBoardReportGivenMetricTypesListHasDoraMetricTypeAndBoardMetricType() {
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			metricTypes = List.of(BOARD, DORA);
			request.setMetricTypes(metricTypes);
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(ReportMetricsError.builder().build())
				.build();
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

		@Test
		void shouldNotGenerateMetricCsvWhenBoardMetricsHasError() {
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			metricTypes = List.of(BOARD, DORA);
			request.setMetricTypes(metricTypes);
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(ReportMetricsError.builder().boardMetricsError(ErrorInfo.builder().build()).build())
				.build();

			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService, never()).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

		@Test
		void shouldNotGenerateMetricCsvWhenPipelineMetricsErrorHasError() {
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			metricTypes = List.of(BOARD, DORA);
			request.setMetricTypes(metricTypes);
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(
						ReportMetricsError.builder().pipelineMetricsError(ErrorInfo.builder().build()).build())
				.build();

			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService, never()).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

		@Test
		void shouldNotGenerateMetricCsvWhenSourceControlMetricsErrorHasError() {
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			metricTypes = List.of(BOARD, DORA);
			request.setMetricTypes(metricTypes);
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(
						ReportMetricsError.builder().sourceControlMetricsError(ErrorInfo.builder().build()).build())
				.build();

			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService, never()).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

		@Test
		void shouldSuccessfulGenerateDoraReportGivenBoardReportHasBeenGeneratedWhenRetryGenerateDoraReport() {
			List<MetricType> doraMetricType = List.of(DORA);
			request.setMetricTypes(doraMetricType);
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(ReportMetricsError.builder().build())
				.build();

			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).initializeMetricsDataCompletedInHandler(TEST_UUID, doraMetricType,
					timeRangeAndTimeStamp);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService, never()).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService).generateCSVForMetric(TEST_UUID, reportResponse,
						request.getTimeRangeAndTimeStamp());
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp);
			});
		}

	}

	@Nested
	class GetShareReportInfo {

		@Test
		void shouldGetReportUrlsSuccessfully() {
			when(fileRepository.getFiles(FileType.REPORT, TEST_UUID)).thenReturn(List.of("board-1-2-3", "board-2-3-4"));
			when(fileRepository.getFiles(FileType.CONFIGS, TEST_UUID))
				.thenReturn(List.of("board-0-0-0", "board-9-9-9"));

			when(fileRepository.readFileByType(eq(FileType.CONFIGS), eq(TEST_UUID), eq("0-0-0"), any(), any()))
				.thenReturn(SavedRequestInfo.builder().metrics(List.of("test-metrics1", "test-metrics2"))
					.classificationNames(List.of("test-classification-chart1", "test-classification-chart2"))
					.pipelines(List.of(
					DeploymentEnvironment.builder().id("1").name("pipeline1").step("step1").build(),
					DeploymentEnvironment.builder().id("1").name("pipeline1").step("step2").build(),
					DeploymentEnvironment.builder().id("1").name("pipeline2").step("step1").build()
				)).sourceControl(List.of(
						CodeBase.builder().repo("repo1").organization("org1").branches(List.of("branch1", "branch2")).build(),
						CodeBase.builder().repo("repo2").organization("org2").branches(List.of("branch3", "branch2")).build(),
						CodeBase.builder().repo("repo3").organization("org3").branches(List.of("branch1", "branch3")).build()
						)).build());
			when(fileRepository.readFileByType(eq(FileType.CONFIGS), eq(TEST_UUID), eq("9-9-9"), any(), any()))
				.thenReturn(SavedRequestInfo.builder().metrics(List.of("test-metrics1", "test-metrics3"))
					.classificationNames(List.of("test-classification-chart1", "test-classification-chart3"))
					.pipelines(List.of(
					DeploymentEnvironment.builder().id("1").name("pipeline1").step("step1").build(),
					DeploymentEnvironment.builder().id("1").name("pipeline2").step("step1").build(),
					DeploymentEnvironment.builder().id("1").name("pipeline2").step("step2").build()
				)).sourceControl(List.of(
								CodeBase.builder().repo("repo1").organization("org1").branches(List.of("branch1", "branch2")).build(),
								CodeBase.builder().repo("repo2").organization("org2").branches(List.of("branch3", "branch2")).build(),
								CodeBase.builder().repo("repo3").organization("org3").branches(List.of("branch1", "branch3")).build())).build());
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);

			ShareApiDetailsResponse shareReportInfo = reportService.getShareReportInfo(TEST_UUID);
			List<String> metrics = shareReportInfo.getMetrics();

			assertEquals(3, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));
			assertEquals("test-metrics3", metrics.get(2));

			List<String> classificationCharts = shareReportInfo.getClassificationNames();

			assertEquals(3, classificationCharts.size());
			assertEquals("test-classification-chart1", classificationCharts.get(0));
			assertEquals("test-classification-chart2", classificationCharts.get(1));
			assertEquals("test-classification-chart3", classificationCharts.get(2));

			List<String> reportUrls = shareReportInfo.getReportURLs();

			assertEquals(2, reportUrls.size());
			assertEquals("/reports/test-uuid/detail?startTime=1&endTime=2", reportUrls.get(0));
			assertEquals("/reports/test-uuid/detail?startTime=2&endTime=3", reportUrls.get(1));

			List<String> pipelines = shareReportInfo.getPipelines();
			assertEquals(4, pipelines.size());
			assertEquals("pipeline1/step1", pipelines.get(0));
			assertEquals("pipeline1/step2", pipelines.get(1));
			assertEquals("pipeline2/step1", pipelines.get(2));
			assertEquals("pipeline2/step2", pipelines.get(3));

			List<String> sourceControls = shareReportInfo.getSourceControls();
			assertEquals(3, sourceControls.size());
			assertEquals("org1/repo1", sourceControls.get(0));
			assertEquals("org2/repo2", sourceControls.get(1));
			assertEquals("org3/repo3", sourceControls.get(2));

			verify(fileRepository).getFiles(FileType.REPORT, TEST_UUID);
			verify(fileRepository).getFiles(FileType.CONFIGS, TEST_UUID);
			verify(fileRepository).readFileByType(eq(FileType.CONFIGS), eq(TEST_UUID), eq("0-0-0"), any(), any());
			verify(fileRepository).readFileByType(eq(FileType.CONFIGS), eq(TEST_UUID), eq("9-9-9"), any(), any());
			verify(fileRepository, times(2)).isExpired(anyLong(), anyLong());

		}

		@Test
		void shouldThrowExceptionWhenGetFilesThrowNotFoundException() {
			when(fileRepository.getFiles(FileType.REPORT, TEST_UUID)).thenThrow(NotFoundException.class);

			NotFoundException notFoundException = assertThrows(NotFoundException.class, () -> reportService.getShareReportInfo(TEST_UUID));

			assertEquals("Don't find the test-uuid folder in the report files", notFoundException.getMessage());

			verify(fileRepository).getFiles(FileType.REPORT, TEST_UUID);
		}

		@Test
		void shouldThrowExceptionWhenFilenameIsInvalid() {
			when(fileRepository.getFiles(FileType.REPORT, TEST_UUID)).thenReturn(List.of("board-123", "board-234"));

			NotFoundException notFoundException = assertThrows(NotFoundException.class, () -> reportService.getShareReportInfo(TEST_UUID));

			assertEquals("Don't get the data, please check the uuid: test-uuid, maybe it's expired or error", notFoundException.getMessage());

			verify(fileRepository).getFiles(FileType.REPORT, TEST_UUID);
		}

		@Test
		void shouldThrowExceptionWhenFileIsExpired() {
			when(fileRepository.getFiles(FileType.REPORT, TEST_UUID)).thenReturn(List.of("board-1-2-3", "board-2-3-4"));
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(true);

			NotFoundException notFoundException = assertThrows(NotFoundException.class, () -> reportService.getShareReportInfo(TEST_UUID));

			assertEquals("Don't get the data, please check the uuid: test-uuid, maybe it's expired or error", notFoundException.getMessage());

			verify(fileRepository).getFiles(FileType.REPORT, TEST_UUID);
			verify(fileRepository).isExpired(anyLong(), anyLong());
		}

	}

	@Nested
	class GenerateReportCallbackUrl {

		@Test
		void shouldGetReportCallbackUrlSuccessfully() {
			String startTime = "20200101";
			String endTime = "20200102";

			String result = reportService.generateReportCallbackUrl(TEST_UUID, startTime, endTime);

			assertEquals("/reports/test-uuid/detail?startTime=20200101&endTime=20200102", result);
		}

	}

	@Nested
	class GenerateReportId {

		@Test
		void shouldGenerateReportId() {
			UuidResponse uuidResponse = reportService.generateReportId();

			assertEquals(36, uuidResponse.getReportId().length());
		}

	}

	@Nested
	class SaveRequestInfo {

		@Test
		void shouldSaveRequestInfoSuccessfully() {
			String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));
			String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));
			String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

			GenerateReportRequest request = GenerateReportRequest.builder()
				.csvTimeStamp(timeStamp)
				.startTime(startTimeStamp)
				.endTime(endTimeStamp)
				.metrics(List.of("test-metrics1", "test-metrics2"))
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("1").build()))
					.build())
				.jiraBoardSetting(JiraBoardSetting.builder()
					.classificationNames(List.of("test-classification-chart1", "test-classification-chart2"))
					.build())
				.codebaseSetting(CodebaseSetting.builder()
					.codebases(List.of(
							CodeBase.builder().repo("repo1").organization("org1").branches(List.of("branch1")).build(),
							CodeBase.builder().repo("repo2").organization("org2").branches(List.of("branch2")).build()))
					.build())
				.timezone("Asia/Shanghai")
				.build();

			reportService.saveRequestInfo(request, TEST_UUID);

			verify(fileRepository).createFileByType(eq(FileType.CONFIGS), eq(TEST_UUID),
					eq(request.getTimeRangeAndTimeStamp()), argumentCaptor.capture(), eq(USER_CONFIG_REPORT_PREFIX));

			SavedRequestInfo savedRequestInfo = argumentCaptor.getValue();

			List<DeploymentEnvironment> pipelines = savedRequestInfo.getPipelines();

			assertEquals(1, pipelines.size());
			assertEquals("1", pipelines.get(0).getId());

			List<String> metrics = savedRequestInfo.getMetrics();

			assertEquals(2, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));

			List<String> classificationCharts = savedRequestInfo.getClassificationNames();
			assertEquals(2, classificationCharts.size());
			assertEquals("test-classification-chart1", classificationCharts.get(0));
			assertEquals("test-classification-chart2", classificationCharts.get(1));

			List<CodeBase> sourceControl = savedRequestInfo.getSourceControl();
			assertEquals(2, sourceControl.size());
			assertEquals("repo1", sourceControl.get(0).getRepo());
			assertEquals("org1", sourceControl.get(0).getOrganization());
			assertEquals(List.of("branch1"), sourceControl.get(0).getBranches());
			assertEquals("repo2", sourceControl.get(1).getRepo());
			assertEquals("org2", sourceControl.get(1).getOrganization());
			assertEquals(List.of("branch2"), sourceControl.get(1).getBranches());
		}

		@Test
		void shouldSaveRequestInfoSuccessfullyWhenBuildKiteSettingIsNull() {
			String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));
			String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));
			String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

			GenerateReportRequest request = GenerateReportRequest.builder()
				.csvTimeStamp(timeStamp)
				.startTime(startTimeStamp)
				.endTime(endTimeStamp)
				.metrics(List.of("test-metrics1", "test-metrics2"))
				.timezone("Asia/Shanghai")
				.build();

			reportService.saveRequestInfo(request, TEST_UUID);

			verify(fileRepository).createFileByType(eq(FileType.CONFIGS), eq(TEST_UUID),
					eq(request.getTimeRangeAndTimeStamp()), argumentCaptor.capture(), eq(USER_CONFIG_REPORT_PREFIX));

			SavedRequestInfo savedRequestInfo = argumentCaptor.getValue();

			List<DeploymentEnvironment> pipelines = savedRequestInfo.getPipelines();

			assertEquals(0, pipelines.size());

			List<String> metrics = savedRequestInfo.getMetrics();

			assertEquals(2, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));

		}

		@Test
		void shouldSaveRequestInfoSuccessfullyWhenCodeBaseSettingIsNull() {
			String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));
			String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));
			String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

			GenerateReportRequest request = GenerateReportRequest.builder()
				.csvTimeStamp(timeStamp)
				.startTime(startTimeStamp)
				.endTime(endTimeStamp)
				.metrics(List.of("test-metrics1", "test-metrics2"))
				.timezone("Asia/Shanghai")
				.build();

			reportService.saveRequestInfo(request, TEST_UUID);

			verify(fileRepository).createFileByType(eq(FileType.CONFIGS), eq(TEST_UUID),
					eq(request.getTimeRangeAndTimeStamp()), argumentCaptor.capture(), eq(USER_CONFIG_REPORT_PREFIX));

			SavedRequestInfo savedRequestInfo = argumentCaptor.getValue();

			List<DeploymentEnvironment> pipelines = savedRequestInfo.getPipelines();
			assertEquals(0, pipelines.size());

			List<String> metrics = savedRequestInfo.getMetrics();
			assertEquals(2, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));

			List<CodeBase> sourceControl = savedRequestInfo.getSourceControl();
			assertEquals(0, sourceControl.size());

		}

		@Test
		void shouldSaveRequestInfoSuccessfullyWhenDeploymentEnvListIsNull() {
			String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));
			String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));
			String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

			GenerateReportRequest request = GenerateReportRequest.builder()
				.csvTimeStamp(timeStamp)
				.startTime(startTimeStamp)
				.endTime(endTimeStamp)
				.metrics(List.of("test-metrics1", "test-metrics2"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.timezone("Asia/Shanghai")
				.build();

			reportService.saveRequestInfo(request, TEST_UUID);

			verify(fileRepository).createFileByType(eq(FileType.CONFIGS), eq(TEST_UUID),
					eq(request.getTimeRangeAndTimeStamp()), argumentCaptor.capture(), eq(USER_CONFIG_REPORT_PREFIX));

			SavedRequestInfo savedRequestInfo = argumentCaptor.getValue();

			List<DeploymentEnvironment> pipelines = savedRequestInfo.getPipelines();

			assertEquals(0, pipelines.size());

			List<String> metrics = savedRequestInfo.getMetrics();

			assertEquals(2, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));
		}

		@Test
		void shouldSaveRequestInfoSuccessfullyWhenJiraBoardSettingIsNull() {
			String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));
			String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));
			String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

			GenerateReportRequest request = GenerateReportRequest.builder()
				.csvTimeStamp(timeStamp)
				.startTime(startTimeStamp)
				.endTime(endTimeStamp)
				.metrics(List.of("test-metrics1", "test-metrics2"))
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("1").build()))
					.build())
				.timezone("Asia/Shanghai")
				.build();

			reportService.saveRequestInfo(request, TEST_UUID);

			verify(fileRepository).createFileByType(eq(FileType.CONFIGS), eq(TEST_UUID),
					eq(request.getTimeRangeAndTimeStamp()), argumentCaptor.capture(), eq(USER_CONFIG_REPORT_PREFIX));

			SavedRequestInfo savedRequestInfo = argumentCaptor.getValue();

			List<DeploymentEnvironment> pipelines = savedRequestInfo.getPipelines();

			assertEquals(1, pipelines.size());
			assertEquals("1", pipelines.get(0).getId());

			List<String> metrics = savedRequestInfo.getMetrics();

			assertEquals(2, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));

			List<String> classificationCharts = savedRequestInfo.getClassificationNames();
			assertEquals(0, classificationCharts.size());
		}

		@Test
		void shouldSaveRequestInfoSuccessfullyWhenClassificationChartsIsNull() {
			String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));
			String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));
			String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

			GenerateReportRequest request = GenerateReportRequest.builder()
				.csvTimeStamp(timeStamp)
				.startTime(startTimeStamp)
				.endTime(endTimeStamp)
				.metrics(List.of("test-metrics1", "test-metrics2"))
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("1").build()))
					.build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.timezone("Asia/Shanghai")
				.build();

			reportService.saveRequestInfo(request, TEST_UUID);

			verify(fileRepository).createFileByType(eq(FileType.CONFIGS), eq(TEST_UUID),
					eq(request.getTimeRangeAndTimeStamp()), argumentCaptor.capture(), eq(USER_CONFIG_REPORT_PREFIX));

			SavedRequestInfo savedRequestInfo = argumentCaptor.getValue();

			List<DeploymentEnvironment> pipelines = savedRequestInfo.getPipelines();

			assertEquals(1, pipelines.size());
			assertEquals("1", pipelines.get(0).getId());

			List<String> metrics = savedRequestInfo.getMetrics();

			assertEquals(2, metrics.size());
			assertEquals("test-metrics1", metrics.get(0));
			assertEquals("test-metrics2", metrics.get(1));

			List<String> classificationCharts = savedRequestInfo.getClassificationNames();
			assertEquals(0, classificationCharts.size());
		}

	}

}
