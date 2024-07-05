package heartbeat.service.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.exception.GenerateReportException;
import heartbeat.exception.RequestFailedException;
import heartbeat.exception.ServiceUnavailableException;
import heartbeat.handler.base.AsyncExceptionDTO;
import heartbeat.repository.FilePrefixType;
import heartbeat.repository.FileRepository;
import heartbeat.repository.FileType;
import heartbeat.controller.board.dto.request.ReworkTimesSetting;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.MetricEnum;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.CycleTime;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DevChangeFailureRate;
import heartbeat.controller.report.dto.response.DevMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.Rework;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.exception.BaseException;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.service.report.calculator.ClassificationCalculator;
import heartbeat.service.report.calculator.CycleTimeCalculator;
import heartbeat.service.report.calculator.DeploymentFrequencyCalculator;
import heartbeat.service.report.calculator.DevChangeFailureRateCalculator;
import heartbeat.service.report.calculator.LeadTimeForChangesCalculator;
import heartbeat.service.report.calculator.MeanToRecoveryCalculator;
import heartbeat.service.report.calculator.ReworkCalculator;
import heartbeat.service.report.calculator.VelocityCalculator;
import heartbeat.service.report.calculator.model.FetchedData;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.BeforeEach;
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

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static heartbeat.controller.report.dto.request.MetricType.BOARD;
import static heartbeat.controller.report.dto.request.MetricType.DORA;
import static heartbeat.repository.FilePrefixType.DATA_COMPLETED_PREFIX;
import static heartbeat.repository.FileRepository.EXPORT_CSV_VALIDITY_TIME;
import static heartbeat.repository.FileType.ERROR;
import static heartbeat.repository.FileType.REPORT;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GenerateReporterServiceTest {

	private static final String TIMESTAMP = "1683734399999";

	@InjectMocks
	GenerateReporterService generateReporterService;

	@Mock
	KanbanService kanbanService;

	@Mock
	FileRepository fileRepository;

	@Mock
	PipelineService pipelineService;

	@Mock
	ClassificationCalculator classificationCalculator;

	@Mock
	ReworkCalculator reworkCalculator;

	@Mock
	DeploymentFrequencyCalculator deploymentFrequency;

	@Mock
	VelocityCalculator velocityCalculator;

	@Mock
	DevChangeFailureRateCalculator devChangeFailureRate;

	@Mock
	MeanToRecoveryCalculator meanToRecoveryCalculator;

	@Mock
	CycleTimeCalculator cycleTimeCalculator;

	@Mock
	CSVFileGenerator csvFileGenerator;

	@Mock
	LeadTimeForChangesCalculator leadTimeForChangesCalculator;

	@Mock
	AsyncMetricsDataHandler asyncMetricsDataHandler;

	@Mock
	KanbanCsvService kanbanCsvService;

	@Captor
	ArgumentCaptor<ReportResponse> responseArgumentCaptor;

	@Captor
	ArgumentCaptor<BaseException> exceptionCaptor;

	public static final String START_TIME = "20240310";

	public static final String END_TIME = "20240409";

	public static final String TEST_UUID = "test-uuid";

	@Nested
	class GenerateBoardReport {

		@Test
		void shouldSaveReportResponseWithReworkInfoWhenReworkInfoTimesIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("rework times"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder()
					.reworkTimesSetting(
							ReworkTimesSetting.builder().reworkState("In Dev").excludedStates(List.of()).build())
					.build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build();

			when(kanbanService.fetchDataFromKanban(request)).thenReturn(cardCollectionInfo);
			when(reworkCalculator.calculateRework(any(), any())).thenReturn(Rework.builder()
				.reworkState("In Dev")
				.reworkCardsRatio(1.1)
				.totalReworkTimes(4)
				.totalReworkCards(2)
				.fromTesting(2)
				.fromReview(2)
				.build());

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService).fetchDataFromKanban(request);
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(2, response.getRework().getFromTesting());
			assertEquals(2, response.getRework().getFromReview());
			assertEquals("In Dev", response.getRework().getReworkState());
			assertEquals(1.1, response.getRework().getReworkCardsRatio());
			assertEquals(4, response.getRework().getTotalReworkTimes());
			assertEquals(2, response.getRework().getTotalReworkCards());
			assertNull(response.getRework().getFromDone());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(reworkCalculator, times(1)).calculateRework(any(), any());
				verify(kanbanCsvService, times(1)).generateCsvInfo(TEST_UUID, request, cardCollectionInfo);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
			});
		}

		@Test
		void shouldSaveReportResponseWithReworkInfoWhenReworkSettingIsNullAndMetricsHasReworkTimes() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("rework times"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build();

			when(kanbanService.fetchDataFromKanban(request)).thenReturn(cardCollectionInfo);

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService).fetchDataFromKanban(request);
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			ReportResponse response = responseArgumentCaptor.getValue();
			assertNull(response.getRework());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(kanbanCsvService, times(1)).generateCsvInfo(TEST_UUID, request, cardCollectionInfo);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
			});
		}

		@Test
		void shouldSaveReportResponseWithoutMetricDataAndUpdateMetricCompletedWhenMetricsIsEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(pipelineService, never()).fetchGitHubData(any());
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(604800000L, response.getExportValidityTime());
			assertNull(response.getCycleTime());
			assertNull(response.getVelocity());
			assertNull(response.getClassificationList());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(kanbanCsvService, times(1)).generateCsvInfo(TEST_UUID, request, null);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
			});

		}

		@Test
		void shouldThrowErrorWhenJiraBoardSettingIsNull() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("velocity"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.METRIC_REPORT_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().build());

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(request);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, BOARD, true);
			verify(kanbanCsvService, never()).generateCsvInfo(eq(TEST_UUID), eq(request), any());
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);
			verify(fileRepository, times(1)).createFileByType(eq(ERROR), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					exceptionCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, BOARD, false);

			assertEquals("Failed to fetch Jira info due to Jira board setting is null.",
					exceptionCaptor.getValue().getMessage());
			assertEquals(400, exceptionCaptor.getValue().getStatus());
		}

		@Test
		void shouldSaveReportResponseWithVelocityAndUpdateMetricCompletedWhenVelocityMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("velocity"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build();

			when(velocityCalculator.calculateVelocity(any()))
				.thenReturn(Velocity.builder().velocityForSP(10).velocityForCards(20).build());
			when(kanbanService.fetchDataFromKanban(request)).thenReturn(cardCollectionInfo);

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService, times(1)).fetchDataFromKanban(request);
			verify(pipelineService, never()).fetchGitHubData(any());
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(604800000L, response.getExportValidityTime());
			assertEquals(10, response.getVelocity().getVelocityForSP());
			assertEquals(20, response.getVelocity().getVelocityForCards());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(kanbanCsvService, times(1)).generateCsvInfo(TEST_UUID, request, cardCollectionInfo);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
				verify(velocityCalculator, times(1)).calculateVelocity(any());
			});
		}

		@Test
		void shouldSaveReportResponseWithCycleTimeAndUpdateMetricCompletedWhenCycleTimeMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("cycle time"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build();

			when(cycleTimeCalculator.calculateCycleTime(any(), any())).thenReturn(CycleTime.builder()
				.averageCycleTimePerSP(10)
				.totalTimeForCards(15)
				.averageCycleTimePerCard(20)
				.build());
			when(kanbanService.fetchDataFromKanban(request)).thenReturn(cardCollectionInfo);

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService, times(1)).fetchDataFromKanban(request);
			verify(pipelineService, never()).fetchGitHubData(any());
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(604800000L, response.getExportValidityTime());
			assertEquals(10, response.getCycleTime().getAverageCycleTimePerSP());
			assertEquals(20, response.getCycleTime().getAverageCycleTimePerCard());
			assertEquals(15, response.getCycleTime().getTotalTimeForCards());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(cycleTimeCalculator, times(1)).calculateCycleTime(any(), any());
				verify(kanbanCsvService, times(1)).generateCsvInfo(TEST_UUID, request, cardCollectionInfo);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
			});
		}

		@Test
		void shouldSaveReportResponseWithClassificationAndUpdateMetricCompletedWhenClassificationMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("classification"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().build())
				.build();

			List<Classification> classifications = List.of(Classification.builder().build());
			when(classificationCalculator.calculate(any(), any())).thenReturn(classifications);
			when(kanbanService.fetchDataFromKanban(request)).thenReturn(cardCollectionInfo);

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService, times(1)).fetchDataFromKanban(request);
			verify(pipelineService, never()).fetchGitHubData(any());
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(604800000L, response.getExportValidityTime());
			assertEquals(classifications, response.getClassificationList());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(classificationCalculator, times(1)).calculate(any(), any());
				verify(kanbanCsvService, times(1)).generateCsvInfo(TEST_UUID, request, cardCollectionInfo);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
			});
		}

		@Test
		void shouldUpdateMetricCompletedWhenExceptionStart4() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("classification"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(kanbanService.fetchDataFromKanban(request)).thenThrow(new NotFoundException(""));

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(kanbanService, times(1)).fetchDataFromKanban(request);
			verify(pipelineService, never()).fetchGitHubData(any());
			verify(kanbanCsvService, never()).generateCsvInfo(eq(TEST_UUID), eq(request), any());
			verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, BOARD, false);
			verify(fileRepository, times(1)).createFileByType(eq(ERROR), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					exceptionCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			assertEquals("", exceptionCaptor.getValue().getMessage());
			assertEquals(404, exceptionCaptor.getValue().getStatus());
		}

		@Test
		void shouldAsyncToGenerateCsvAndGenerateReportWhenFetchRight() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("rework times"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.jiraBoardSetting(JiraBoardSetting.builder()
					.reworkTimesSetting(
							ReworkTimesSetting.builder().reworkState("To do").excludedStates(List.of("block")).build())
					.build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(kanbanService.fetchDataFromKanban(request)).thenReturn(FetchedData.CardCollectionInfo.builder()
				.realDoneCardCollection(CardCollection.builder().reworkCardNumber(2).build())
				.nonDoneCardCollection(CardCollection.builder().build())
				.build());

			when(reworkCalculator.calculateRework(any(), any()))
				.thenReturn(Rework.builder().totalReworkCards(2).build());

			generateReporterService.generateBoardReport(TEST_UUID, request);

			verify(reworkCalculator, times(1)).calculateRework(any(), any());
			verify(kanbanService, times(1)).fetchDataFromKanban(request);
			verify(pipelineService, never()).fetchGitHubData(any());
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.BOARD_REPORT_PREFIX));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);

			assertEquals(2, responseArgumentCaptor.getValue().getRework().getTotalReworkCards());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(reworkCalculator, times(1)).calculateRework(any(), any());
				verify(kanbanCsvService, times(1)).generateCsvInfo(eq(TEST_UUID), eq(request), any());
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, BOARD, true);
			});

		}

	}

	@Nested
	class GenerateDoraReport {

		@Test
		void shouldGenerateCsvFile() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(false).build());
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.SOURCE_CONTROL_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(pipelineService, times(1)).generateCSVForPipeline(any(), any(), any(), any());
				verify(csvFileGenerator, times(1)).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
						timeRangeAndTimeStamp);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, DORA, true);
			});
		}

		@Test
		void shouldGenerateCsvFileFailedWhenMetricsFileDontExist() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(null);
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.SOURCE_CONTROL_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);

			verify(pipelineService, never()).generateCSVForPipeline(any(), any(), any(), any());
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
					timeRangeAndTimeStamp);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, true);
		}

		@Test
		void shouldThrowErrorWhenCodeSettingIsNullButSourceControlMetricsIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.metrics(List.of("lead time for changes"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(true).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.SOURCE_CONTROL_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
			verify(pipelineService, never()).generateCSVForPipeline(any(), any(), any(), any());
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
					timeRangeAndTimeStamp);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, true);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(ERROR), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					exceptionCaptor.capture(), eq(FilePrefixType.SOURCE_CONTROL_PREFIX));

			assertEquals("Failed to fetch Github info due to code base setting is null.",
					exceptionCaptor.getValue().getMessage());
			assertEquals(400, exceptionCaptor.getValue().getStatus());
		}

		@Test
		void shouldThrowErrorWhenBuildKiteSettingIsNullButPipelineMetricsIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.metrics(List.of("deployment frequency"))
				.csvTimeStamp(TIMESTAMP)
				.startTime("1710000000000")
				.endTime("1712678399999")
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(true).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.SOURCE_CONTROL_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
			verify(pipelineService, never()).generateCSVForPipeline(any(), any(), any(), any());
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
					timeRangeAndTimeStamp);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, true);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(ERROR), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					exceptionCaptor.capture(), eq(FilePrefixType.PIPELINE_REPORT_PREFIX));

			assertEquals("Failed to fetch BuildKite info due to BuildKite setting is null.",
					exceptionCaptor.getValue().getMessage());
			assertEquals(400, exceptionCaptor.getValue().getStatus());
		}

		@Test
		void shouldGenerateCsvWithPipelineReportWhenPipeLineMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("deployment frequency", "dev change failure rate", "dev mean time to recovery"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(false).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchBuildKiteInfo(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			DeploymentFrequency fakeDeploymentFrequency = DeploymentFrequency.builder().build();
			DevChangeFailureRate fakeDevChangeFailureRate = DevChangeFailureRate.builder().build();
			DevMeanTimeToRecovery fakeMeantime = DevMeanTimeToRecovery.builder().build();
			when(deploymentFrequency.calculate(any(), any(), any(), any(), any())).thenReturn(fakeDeploymentFrequency);
			when(devChangeFailureRate.calculate(any())).thenReturn(fakeDevChangeFailureRate);
			when(meanToRecoveryCalculator.calculate(any(), any())).thenReturn(fakeMeantime);

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(eq(request));
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.PIPELINE_REPORT_PREFIX));

			ReportResponse response = responseArgumentCaptor.getValue();

			assertEquals(604800000L, response.getExportValidityTime());
			assertEquals(fakeDevChangeFailureRate, response.getDevChangeFailureRate());
			assertEquals(fakeMeantime, response.getDevMeanTimeToRecovery());
			assertEquals(fakeDevChangeFailureRate, response.getDevChangeFailureRate());
			assertEquals(fakeDeploymentFrequency, response.getDeploymentFrequency());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(pipelineService, times(1)).generateCSVForPipeline(any(), any(), any(), any());
				verify(csvFileGenerator, times(1)).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
						timeRangeAndTimeStamp);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, DORA, true);

				verify(deploymentFrequency, times(1)).calculate(any(), any(), any(), any(), any());
				verify(devChangeFailureRate, times(1)).calculate(any());
				verify(meanToRecoveryCalculator, times(1)).calculate(any(), any());
			});
		}

		@Test
		void shouldUpdateMetricCompletedWhenGenerateCsvWithPipelineReportFailed() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("dev change failure rate"))
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(true).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.fetchBuildKiteInfo(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			when(devChangeFailureRate.calculate(any())).thenThrow(new NotFoundException(""));

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(request);
			verify(devChangeFailureRate, times(1)).calculate(any());
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
			verify(pipelineService, never()).generateCSVForPipeline(any(), any(), any(), any());
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
					timeRangeAndTimeStamp);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, true);
			verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(ERROR), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					exceptionCaptor.capture(), eq(FilePrefixType.PIPELINE_REPORT_PREFIX));

			assertEquals("", exceptionCaptor.getValue().getMessage());
			assertEquals(404, exceptionCaptor.getValue().getStatus());
		}

		@Test
		void shouldGenerateCsvWithSourceControlReportWhenSourceControlMetricIsNotEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of("lead time for changes"))
				.codebaseSetting(CodebaseSetting.builder().build())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(false).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchGitHubData(request))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			LeadTimeForChanges fakeLeadTimeForChange = LeadTimeForChanges.builder().build();
			when(leadTimeForChangesCalculator.calculate(any())).thenReturn(fakeLeadTimeForChange);

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(request);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);

			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.SOURCE_CONTROL_PREFIX));

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(604800000L, response.getExportValidityTime());
			assertEquals(fakeLeadTimeForChange, response.getLeadTimeForChanges());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(leadTimeForChangesCalculator, times(1)).calculate(any());
				verify(pipelineService, times(1)).generateCSVForPipeline(any(), any(), any(), any());
				verify(csvFileGenerator, times(1)).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
						timeRangeAndTimeStamp);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, DORA, true);
			});
		}

		@Test
		void shouldGenerateCsvWithCachedDataWhenBuildKiteDataAlreadyExisted() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of(MetricEnum.LEAD_TIME_FOR_CHANGES.getValue(),
						MetricEnum.DEV_CHANGE_FAILURE_RATE.getValue()))
				.codebaseSetting(CodebaseSetting.builder().build())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(false).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchGitHubData(any()))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			when(pipelineService.fetchBuildKiteInfo(any()))
				.thenReturn(FetchedData.BuildKiteData.builder().buildInfosList(List.of()).build());
			LeadTimeForChanges fakeLeadTimeForChange = LeadTimeForChanges.builder().build();
			when(leadTimeForChangesCalculator.calculate(any())).thenReturn(fakeLeadTimeForChange);

			generateReporterService.generateDoraReport(TEST_UUID, request);

			verify(kanbanService, never()).fetchDataFromKanban(request);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(REPORT), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					responseArgumentCaptor.capture(), eq(FilePrefixType.SOURCE_CONTROL_PREFIX));

			ReportResponse response = responseArgumentCaptor.getValue();
			assertEquals(604800000L, response.getExportValidityTime());
			assertEquals(fakeLeadTimeForChange, response.getLeadTimeForChanges());

			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(pipelineService, times(1)).generateCSVForPipeline(any(), any(), any(), any());
				verify(csvFileGenerator, times(1)).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
						timeRangeAndTimeStamp);
				verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
						timeRangeAndTimeStamp, DORA, true);
				verify(leadTimeForChangesCalculator, times(1)).calculate(any());
			});
		}

		@Test
		void shouldUpdateMetricCompletedWhenGenerateCsvWithSourceControlReportFailed() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.calendarType(CalendarTypeEnum.REGULAR)
				.startTime("10000")
				.endTime("20000")
				.metrics(List.of(MetricEnum.LEAD_TIME_FOR_CHANGES.getValue()))
				.codebaseSetting(CodebaseSetting.builder().build())
				.buildKiteSetting(BuildKiteSetting.builder().build())
				.csvTimeStamp(TIMESTAMP)
				.timezone("Asia/Shanghai")
				.build();
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().doraMetricsCompleted(true).build());
			List<PipelineCSVInfo> pipelineCSVInfos = List.of();
			when(pipelineService.generateCSVForPipeline(any(), any(), any(), any())).thenReturn(pipelineCSVInfos);
			when(pipelineService.fetchGitHubData(request)).thenReturn(
					FetchedData.BuildKiteData.builder().pipelineLeadTimes(List.of()).buildInfosList(List.of()).build());
			doThrow(new NotFoundException("")).when(leadTimeForChangesCalculator).calculate(any());

			generateReporterService.generateDoraReport(TEST_UUID, request);
			verify(kanbanService, never()).fetchDataFromKanban(request);
			verify(leadTimeForChangesCalculator, times(1)).calculate(any());
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).removeFileByType(ERROR, TEST_UUID, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
			verify(pipelineService, never()).generateCSVForPipeline(any(), any(), any(), any());
			verify(csvFileGenerator, never()).convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos,
					timeRangeAndTimeStamp);
			verify(asyncMetricsDataHandler, never()).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, true);
			verify(asyncMetricsDataHandler, times(1)).updateMetricsDataCompletedInHandler(TEST_UUID,
					timeRangeAndTimeStamp, DORA, false);
			verify(fileRepository, times(1)).createFileByType(eq(ERROR), eq(TEST_UUID), eq(timeRangeAndTimeStamp),
					exceptionCaptor.capture(), eq(FilePrefixType.SOURCE_CONTROL_PREFIX));

			assertEquals("", exceptionCaptor.getValue().getMessage());
			assertEquals(404, exceptionCaptor.getValue().getStatus());
		}

	}

	@Nested
	class GenerateCSVForMetric {

		@Test
		void shouldCallCsvFileGenerator() {
			ReportResponse response = ReportResponse.builder().build();
			generateReporterService.generateCSVForMetric(TEST_UUID, response, "timestamp");

			verify(csvFileGenerator).convertMetricDataToCSV(TEST_UUID, response, "timestamp");
		}

	}

	@Nested
	class CheckReportReadyStatus {

		@Test
		void shouldThrowErrorWhenTimeStampIsInvalid() {
			String timeRangeAndTimeStamp = "20200101-20240101-1234";

			when(fileRepository.isExpired(anyLong(), eq(1234L))).thenReturn(true);

			GenerateReportException generateReportException = assertThrows(GenerateReportException.class, () -> {
				generateReporterService.checkReportReadyStatus(TEST_UUID, timeRangeAndTimeStamp);
			});

			assertEquals("Failed to get report due to report time expires", generateReportException.getMessage());

			verify(fileRepository, never()).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
		}

		@Test
		void shouldThrowErrorWhenTimeStampIsvalid() {
			String timeRangeAndTimeStamp = "20200101-20240101-1234";

			when(fileRepository.isExpired(anyLong(), eq(1234L))).thenReturn(false);

			generateReporterService.checkReportReadyStatus(TEST_UUID, timeRangeAndTimeStamp);

			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
		}

	}

	@Nested
	class GetComposedReportResponse {

		String reportId;

		String dataCompletedId;

		@BeforeEach
		void setUp() {
			reportId = String.valueOf(System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME + 2000000);
			dataCompletedId = FileType.METRICS_DATA_COMPLETED + START_TIME + "-" + END_TIME + "-" + reportId;
		}

		@Test
		void shouldGetDataFromCache() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(EXPORT_CSV_VALIDITY_TIME, res.getExportValidityTime());
			assertFalse(res.getBoardMetricsCompleted());
			assertTrue(res.getDoraMetricsCompleted());
			assertFalse(res.getAllMetricsCompleted());
			assertNull(res.getReportMetricsError().getBoardMetricsError());
		}

		@Test
		void shouldReturnErrorDataWhenExceptionIs404Or403Or401() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any()))
				.thenReturn(new AsyncExceptionDTO(new NotFoundException("error")));

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertFalse(res.getAllMetricsCompleted());
			assertEquals(404, res.getReportMetricsError().getBoardMetricsError().getStatus());
		}

		@Test
		void shouldThrowGenerateReportExceptionWhenErrorIs500() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any()))
				.thenReturn(new AsyncExceptionDTO(new GenerateReportException("errorMessage")));

			GenerateReportException generateReportException = assertThrows(GenerateReportException.class,
					() -> generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME));

			assertEquals("errorMessage", generateReportException.getMessage());
		}

		@Test
		void shouldThrowServiceUnavailableExceptionWhenErrorIs503() {

			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any()))
				.thenReturn(new AsyncExceptionDTO(new ServiceUnavailableException("errorMessage")));

			ServiceUnavailableException serviceUnavailableException = assertThrows(ServiceUnavailableException.class,
					() -> generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME));

			assertEquals("errorMessage", serviceUnavailableException.getMessage());
		}

		@Test
		void shouldThrowRequestFailedExceptionWhenErrorIsDefault() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any()))
				.thenReturn(new AsyncExceptionDTO("errorMessage", 400));

			RequestFailedException requestFailedException = assertThrows(RequestFailedException.class,
					() -> generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME));

			assertEquals("Request failed with status statusCode 400, error: errorMessage",
					requestFailedException.getMessage());
			assertEquals(400, requestFailedException.getStatus());
		}

		@Test
		void shouldGetDataWhenBoardMetricsCompletedIsFalseDoraMetricsCompletedIsNull() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertFalse(res.getBoardMetricsCompleted());
			assertNull(res.getDoraMetricsCompleted());
			assertFalse(res.getAllMetricsCompleted());
		}

		@Test
		void shouldGetDataWhenBoardMetricsCompletedIsNullDoraMetricsCompletedIsFalse() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.doraMetricsCompleted(false)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertNull(res.getBoardMetricsCompleted());
			assertFalse(res.getDoraMetricsCompleted());
			assertFalse(res.getAllMetricsCompleted());
		}

		@Test
		void shouldGetDataWhenBoardMetricsCompletedIsTrueDoraMetricsCompletedIsTrueOverallMetricCompletedIsTrue() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(true)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(true)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertTrue(res.getBoardMetricsCompleted());
			assertTrue(res.getDoraMetricsCompleted());
			assertTrue(res.getAllMetricsCompleted());
		}

		@Test
		void shouldGetDataWhenBoardMetricsCompletedIsNullDoraMetricsCompletedIsNullOverallMetricCompletedIsTrue() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().overallMetricCompleted(true).build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertNull(res.getBoardMetricsCompleted());
			assertNull(res.getDoraMetricsCompleted());
			assertTrue(res.getAllMetricsCompleted());
		}

		@Test
		void shouldGetDataWhenBoardMetricsCompletedIsNullDoraMetricsCompletedIsNullOverallMetricCompletedIsFalse() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-1234";
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(timeRangeAndTimeStamp);
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder().overallMetricCompleted(false).build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, START_TIME, END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertNull(res.getBoardMetricsCompleted());
			assertNull(res.getDoraMetricsCompleted());
			assertFalse(res.getAllMetricsCompleted());
		}

		@Test
		void shouldGetDataFromCacheWhenGetComposedReportResponse() {
			String timeRangeAndTimeStamp = START_TIME + "-" + END_TIME + "-" + reportId;
			when(fileRepository.isExpired(anyLong(), anyLong())).thenReturn(false);
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, DATA_COMPLETED_PREFIX))
				.thenReturn(MetricsDataCompleted.builder()
					.boardMetricsCompleted(false)
					.doraMetricsCompleted(true)
					.overallMetricCompleted(false)
					.build());
			when(fileRepository.readFileByType(eq(REPORT), any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().build());
			when(fileRepository.readFileByType(eq(ERROR), any(), any(), any(), any())).thenReturn(null);

			ReportResponse res = generateReporterService.getComposedReportResponse(TEST_UUID, reportId, START_TIME,
					END_TIME);

			assertEquals(604800000L, res.getExportValidityTime());
			assertFalse(res.getBoardMetricsCompleted());
			assertTrue(res.getDoraMetricsCompleted());
			assertFalse(res.getAllMetricsCompleted());
			assertNull(res.getReportMetricsError().getBoardMetricsError());
		}

	}

	@Test
	void shouldDoConvertMetricDataToCSVWhenCallGenerateCSVForMetrics() throws IOException {
		String timeStamp = TIMESTAMP;
		ObjectMapper mapper = new ObjectMapper();
		ReportResponse reportResponse = mapper
			.readValue(new File("src/test/java/heartbeat/controller/report/reportResponse.json"), ReportResponse.class);

		generateReporterService.generateCSVForMetric(TEST_UUID, reportResponse, timeStamp);

		verify(csvFileGenerator, times(1)).convertMetricDataToCSV(TEST_UUID, reportResponse, timeStamp);
	}

}
