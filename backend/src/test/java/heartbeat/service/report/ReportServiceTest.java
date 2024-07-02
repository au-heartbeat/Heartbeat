package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.ErrorInfo;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.handler.AsyncReportRequestHandler;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.util.IdUtil;
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
import static heartbeat.service.report.scheduler.DeleteExpireCSVScheduler.EXPORT_CSV_VALIDITY_TIME;
import static heartbeat.tools.TimeUtils.mockTimeStamp;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
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
	GenerateReporterService generateReporterService;

	@Mock
	ReportGenerator reportGenerator;

	@Mock
	AsyncReportRequestHandler asyncReportRequestHandler;

	@Captor
	ArgumentCaptor<MetricsDataCompleted> metricsDataCompletedArgumentCaptor;

	public static final String START_TIME = "20240310";

	public static final String END_TIME = "20240409";

	public static final String TEST_UUID = "test-uuid";

	@Nested
	class ExportCsv {

		@Test
		void shouldCallCsvFileGeneratorToGotTheStreamWhenTimestampIsValid() throws IOException {
			long validTimestamp = System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME + 20000L;
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + validTimestamp;
			when(csvFileGenerator.getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp))
				.thenReturn(new InputStreamResource(new ByteArrayInputStream("csv data".getBytes())));
			when(asyncReportRequestHandler.getReportFiles(TEST_UUID))
				.thenReturn(List.of("board-" + START_TIME + "-" + END_TIME + "-" + validTimestamp));

			InputStream result = reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME)
				.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(result)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals(returnData, "csv data");
			verify(csvFileGenerator).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
		}

		@Test
		void shouldThrowNotFoundExceptionWhenTimestampIsValid() {
			String invalidTimestamp = String.valueOf(System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME - 20000L);
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + invalidTimestamp;
			when(asyncReportRequestHandler.getReportFiles(TEST_UUID))
				.thenReturn(List.of("board-" + START_TIME + "-" + END_TIME + "-" + invalidTimestamp));

			assertThrows(NotFoundException.class,
					() -> reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME));
			verify(csvFileGenerator, never()).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
		}

		@Test
		void shouldThrowNotFoundExceptionWhenFilesNameDontHaveFourPart() {
			String invalidTimestamp = String.valueOf(System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME - 20000L);
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + invalidTimestamp;
			when(asyncReportRequestHandler.getReportFiles(TEST_UUID))
				.thenReturn(List.of("board-" + START_TIME + END_TIME + invalidTimestamp));

			assertThrows(NotFoundException.class,
					() -> reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME));
			verify(csvFileGenerator, never()).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
		}

		@Test
		void shouldThrowNotFoundExceptionWhenFilesNameNotExist() {
			String invalidTimestamp = String.valueOf(System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME - 20000L);
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + invalidTimestamp;
			when(asyncReportRequestHandler.getReportFiles(TEST_UUID))
				.thenReturn(List.of("board-" + START_TIME + "-" + "END_TIME" + "-" + invalidTimestamp,
						"board-" + "START_TIME" + "-" + END_TIME + "-" + invalidTimestamp));

			assertThrows(NotFoundException.class,
					() -> reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME));
			verify(csvFileGenerator, never()).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
		}

	}

	@Nested
	class GenerateReportByType {

		String timeStamp = String.valueOf(mockTimeStamp(2023, 5, 10, 0, 0, 0));

		String startTimeStamp = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));

		String endTimeStamp = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

		GenerateReportRequest request = GenerateReportRequest.builder()
			.csvTimeStamp(timeStamp)
			.startTime(startTimeStamp)
			.endTime(endTimeStamp)
			.metrics(new ArrayList<>())
			.metricTypes(List.of(BOARD))
			.timezone("Asia/Shanghai")
			.build();

		@Test
		void shouldSuccessfulGenerateBoardReportAndInitializeMetricDataWhenMetricTypesListOnlyHasBoardElement() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			doAnswer(invocation -> null).when(generateReporterService).generateBoardReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().reportMetricsError(ReportMetricsError.builder().build()).build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService, never()).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

		@Test
		void shouldSuccessfulGenerateDoraReportWhenMetricTypesListOnlyHasDoraMetricType() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			request.setMetricTypes(List.of(DORA));
			doAnswer(invocation -> null).when(generateReporterService).generateDoraReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().reportMetricsError(ReportMetricsError.builder().build()).build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService, never()).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

		@Test
		void shouldSuccessfulGenerateDoraReportAndBoardReportGivenMetricTypesListHasDoraMetricTypeAndBoardMetricType() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			request.setMetricTypes(List.of(BOARD, DORA));
			doAnswer(invocation -> null).when(generateReporterService).generateDoraReport(TEST_UUID, request);
			doAnswer(invocation -> null).when(generateReporterService).generateBoardReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().reportMetricsError(ReportMetricsError.builder().build()).build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(asyncMetricsDataHandler).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

		@Test
		void shouldNotGenerateMetricCsvWhenBoardMetricsHasError() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			request.setMetricTypes(List.of(BOARD, DORA));
			doAnswer(invocation -> null).when(generateReporterService).generateDoraReport(TEST_UUID, request);
			doAnswer(invocation -> null).when(generateReporterService).generateBoardReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder()
					.reportMetricsError(
							ReportMetricsError.builder().boardMetricsError(ErrorInfo.builder().build()).build())
					.build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService, never()).generateCSVForMetric(any(), any(), any());
				verify(asyncMetricsDataHandler, times(1)).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

		@Test
		void shouldNotGenerateMetricCsvWhenPiplineMetricsErrorHasError() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			request.setMetricTypes(List.of(BOARD, DORA));
			doAnswer(invocation -> null).when(generateReporterService).generateDoraReport(TEST_UUID, request);
			doAnswer(invocation -> null).when(generateReporterService).generateBoardReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder()
					.reportMetricsError(
							ReportMetricsError.builder().pipelineMetricsError(ErrorInfo.builder().build()).build())
					.build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService, never()).generateCSVForMetric(any(), any(), any());
				verify(asyncMetricsDataHandler, times(1)).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

		@Test
		void shouldNotGenerateMetricCsvWhenSourceControlMetricsErrorHasError() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			request.setMetricTypes(List.of(BOARD, DORA));
			doAnswer(invocation -> null).when(generateReporterService).generateDoraReport(TEST_UUID, request);
			doAnswer(invocation -> null).when(generateReporterService).generateBoardReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder()
					.reportMetricsError(
							ReportMetricsError.builder().sourceControlMetricsError(ErrorInfo.builder().build()).build())
					.build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService, never()).generateCSVForMetric(any(), any(), any());
				verify(asyncMetricsDataHandler, times(1)).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

		@Test
		void shouldSuccessfulGenerateDoraReportGivenBoardReportHasBeenGeneratedWhenRetryGenerateDoraReport() {
			MetricsDataCompleted expected = MetricsDataCompleted.builder()
				.boardMetricsCompleted(true)
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
			when(asyncMetricsDataHandler.getMetricsDataCompleted(any())).thenReturn(MetricsDataCompleted.builder()
				.boardMetricsCompleted(true)
				.doraMetricsCompleted(true)
				.overallMetricCompleted(true)
				.build());
			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));
			doAnswer(invocation -> null).when(asyncMetricsDataHandler).putMetricsDataCompleted(any(), any());
			request.setMetricTypes(List.of(DORA));
			doAnswer(invocation -> null).when(generateReporterService).generateDoraReport(TEST_UUID, request);
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(ReportResponse.builder().reportMetricsError(ReportMetricsError.builder().build()).build());

			reportService.generateReport(request, TEST_UUID);

			verify(asyncMetricsDataHandler).putMetricsDataCompleted(any(),
					metricsDataCompletedArgumentCaptor.capture());
			MetricsDataCompleted metricsDataCompleted = metricsDataCompletedArgumentCaptor.getValue();
			assertEquals(metricsDataCompleted, expected);
			Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
				verify(generateReporterService).generateDoraReport(TEST_UUID, request);
				verify(generateReporterService, never()).generateBoardReport(TEST_UUID, request);
				verify(generateReporterService).getComposedReportResponse(TEST_UUID, request.getCsvTimeStamp(),
						START_TIME, END_TIME);
				verify(generateReporterService).generateCSVForMetric(any(), any(), any());
				verify(asyncMetricsDataHandler, times(1)).updateOverallMetricsCompletedInHandler(
						IdUtil.getDataCompletedPrefix(TEST_UUID, request.getTimeRangeAndTimeStamp()));
			});
		}

	}

}
