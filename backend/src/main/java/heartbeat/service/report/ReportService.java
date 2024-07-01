package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.handler.AsyncReportRequestHandler;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.util.IdUtil;
import heartbeat.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.function.BiConsumer;

import static heartbeat.controller.report.dto.request.MetricType.BOARD;
import static heartbeat.controller.report.dto.request.MetricType.DORA;
import static heartbeat.service.report.scheduler.DeleteExpireCSVScheduler.EXPORT_CSV_VALIDITY_TIME;

@Service
@RequiredArgsConstructor
public class ReportService {

	private final CSVFileGenerator csvFileGenerator;

	private final AsyncMetricsDataHandler asyncMetricsDataHandler;

	private final GenerateReporterService generateReporterService;

	private final ReportGenerator reportGenerator;

	private final AsyncReportRequestHandler asyncReportRequestHandler;

	private static final String FILENAME_SEPARATOR = "-";

	public InputStreamResource exportCsv(ReportType reportDataType, String uuid, String startTime, String endTime) {
		String timeRangeAndTimeStamp = asyncReportRequestHandler.getReportFiles(uuid)
			.stream()
			.map(it -> it.split("-"))
			.filter(it -> Objects.equals(it[1], startTime) && Objects.equals(it[2], endTime))
			.map(it -> it[1] + FILENAME_SEPARATOR + it[2] + FILENAME_SEPARATOR + it[3])
			.findFirst()
			.orElseThrow(() -> new NotFoundException(String
				.format("Don't find the report, uuid: %s, startTime: %s, endTime: %s", uuid, startTime, endTime)));

		String csvTimestamp = timeRangeAndTimeStamp.split(FILENAME_SEPARATOR)[2];

		if (isExpiredTimeStamp(Long.parseLong(csvTimestamp))) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}
		return csvFileGenerator.getDataFromCSV(reportDataType, uuid, timeRangeAndTimeStamp);
	}

	private boolean isExpiredTimeStamp(long timeStamp) {
		return timeStamp < System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME;
	}

	public void generateReport(GenerateReportRequest request, String uuid) {
		List<MetricType> metricTypes = request.getMetricTypes();
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
		initializeMetricsDataCompletedInHandler(uuid, metricTypes, timeRangeAndTimeStamp);
		Map<MetricType, BiConsumer<String, GenerateReportRequest>> reportGeneratorMap = reportGenerator
			.getReportGenerator(generateReporterService);
		List<CompletableFuture<Void>> threadList = new ArrayList<>();
		for (MetricType metricType : metricTypes) {
			CompletableFuture<Void> metricTypeThread = CompletableFuture
				.runAsync(() -> reportGeneratorMap.get(metricType).accept(uuid, request));
			threadList.add(metricTypeThread);
		}

		CompletableFuture<Void> allFutures = CompletableFuture.allOf(threadList.toArray(new CompletableFuture[0]));
		allFutures.thenRun(() -> {
			ReportResponse reportResponse = generateReporterService.getComposedReportResponse(uuid,
					request.getCsvTimeStamp(),
					convertTimeStampToYYYYMMDD(request.getStartTime(), request.getTimezoneByZoneId()),
					convertTimeStampToYYYYMMDD(request.getEndTime(), request.getTimezoneByZoneId()));
			if (isNotGenerateMetricError(reportResponse.getReportMetricsError())) {
				generateReporterService.generateCSVForMetric(uuid, reportResponse, request.getTimeRangeAndTimeStamp());
			}
			asyncMetricsDataHandler.updateOverallMetricsCompletedInHandler(
					IdUtil.getDataCompletedPrefix(uuid, request.getTimeRangeAndTimeStamp()));
		});
	}

	private String convertTimeStampToYYYYMMDD(String timeStamp, ZoneId timezone) {
		return TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(timeStamp), timezone);
	}

	private boolean isNotGenerateMetricError(ReportMetricsError reportMetricsError) {
		return Objects.isNull(reportMetricsError.getBoardMetricsError())
				&& Objects.isNull(reportMetricsError.getSourceControlMetricsError())
				&& Objects.isNull(reportMetricsError.getPipelineMetricsError());
	}

	private void initializeMetricsDataCompletedInHandler(String uuid, List<MetricType> metricTypes,
			String timeRangeAndTimeStamp) {
		MetricsDataCompleted previousMetricsDataCompleted = asyncMetricsDataHandler
			.getMetricsDataCompleted(IdUtil.getDataCompletedPrefix(uuid, timeRangeAndTimeStamp));
		Boolean initializeBoardMetricsCompleted = null;
		Boolean initializeDoraMetricsCompleted = null;
		if (!Objects.isNull(previousMetricsDataCompleted)) {
			initializeBoardMetricsCompleted = previousMetricsDataCompleted.boardMetricsCompleted();
			initializeDoraMetricsCompleted = previousMetricsDataCompleted.doraMetricsCompleted();
		}
		asyncMetricsDataHandler
			.putMetricsDataCompleted(IdUtil.getDataCompletedPrefix(uuid, timeRangeAndTimeStamp), MetricsDataCompleted
				.builder()
				.boardMetricsCompleted(metricTypes.contains(BOARD) ? Boolean.FALSE : initializeBoardMetricsCompleted)
				.doraMetricsCompleted(metricTypes.contains(DORA) ? Boolean.FALSE : initializeDoraMetricsCompleted)
				.overallMetricCompleted(Boolean.FALSE)
				.isSuccessfulCreateCsvFile(Boolean.FALSE)
				.build());
	}

	public List<String> getReportUrl(String uuid) {
		return asyncReportRequestHandler.getReportFiles(uuid)
			.stream()
			.map(it -> it.split("-"))
			.map(it -> this.generateReportCallbackUrl(uuid, it[1], it[2]))
			.distinct()
			.toList();
	}

	public String generateReportCallbackUrl(String uuid, String startTime, String endTime) {
		return "/reports/" + uuid + "/detail" + "?startTime=" + startTime + "&endTime=" + endTime;
	}

}
