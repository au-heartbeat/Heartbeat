package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.ErrorInfo;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.repository.FileRepository;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static heartbeat.tools.TimeUtils.mockTimeStamp;
import static heartbeat.repository.FileRepository.EXPORT_CSV_VALIDITY_TIME;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
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
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(START_TIME + "-" + END_TIME + "-" + validTimestamp);
			when(fileRepository.isExpired(anyLong(), eq(validTimestamp))).thenReturn(false);

			InputStream result = reportService.exportCsv(ReportType.METRIC, TEST_UUID, START_TIME, END_TIME)
				.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(result)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals(returnData, "csv data");
			verify(csvFileGenerator).getDataFromCSV(ReportType.METRIC, TEST_UUID, mockTimeRangeTimeStamp);
			verify(fileRepository).getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME);
			verify(fileRepository).isExpired(anyLong(), eq(validTimestamp));
		}

		@Test
		void shouldThrowNotFoundExceptionWhenTimestampIsValid() {
			long invalidTimestamp = System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME - 20000L;
			String mockTimeRangeTimeStamp = START_TIME + "-" + END_TIME + "-" + invalidTimestamp;
			when(fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(TEST_UUID, START_TIME,
					END_TIME))
				.thenReturn(START_TIME + "-" + END_TIME + "-" + invalidTimestamp);
			when(fileRepository.isExpired(anyLong(), eq(invalidTimestamp))).thenReturn(true);

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
		void shouldNotGenerateMetricCsvWhenPiplineMetricsErrorHasError() {
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
			List<MetricType> metricTypes = List.of(DORA);
			request.setMetricTypes(metricTypes);
			String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
			ReportResponse reportResponse = ReportResponse.builder()
				.reportMetricsError(ReportMetricsError.builder().build())
				.build();

			when(reportGenerator.getReportGenerator(generateReporterService)).thenReturn(Map.of(BOARD,
					generateReporterService::generateBoardReport, DORA, generateReporterService::generateDoraReport));
			when(generateReporterService.getComposedReportResponse(any(), any(), any(), any()))
				.thenReturn(reportResponse);

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

	}

	@Nested
	class GetReportUrl {

		@Test
		void shouldGetReportUrlsSuccessfully() {
			when(fileRepository.getReportFiles(TEST_UUID)).thenReturn(List.of("board-1-2-3", "board-2-3-4"));

			List<String> reportUrls = reportService.getReportUrls(TEST_UUID);

			verify(fileRepository).getReportFiles(TEST_UUID);
			assertEquals(2, reportUrls.size());
			assertEquals("/reports/test-uuid/detail?startTime=1&endTime=2", reportUrls.get(0));
			assertEquals("/reports/test-uuid/detail?startTime=2&endTime=3", reportUrls.get(1));
		}

		@Test
		void shouldThrowExceptionWhenFilenameIsInvalid() {
			when(fileRepository.getReportFiles(TEST_UUID)).thenReturn(List.of("board-123", "board-234"));

			NotFoundException notFoundException = assertThrows(NotFoundException.class, () -> reportService.getReportUrls(TEST_UUID));

			assertEquals("Don't get the data, please check the uuid: test-uuid, maybe it's expired or error", notFoundException.getMessage());

			verify(fileRepository).getReportFiles(TEST_UUID);
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

}
