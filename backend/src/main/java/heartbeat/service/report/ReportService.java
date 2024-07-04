package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.repository.FileRepository;
import heartbeat.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.function.BiConsumer;

@Service
@RequiredArgsConstructor
public class ReportService {

	private final CSVFileGenerator csvFileGenerator;

	private final AsyncMetricsDataHandler asyncMetricsDataHandler;

	private final GenerateReporterService generateReporterService;

	private final ReportGenerator reportGenerator;

	private final FileRepository fileRepository;

	private static final String FILENAME_SEPARATOR = "-";

	public InputStreamResource exportCsv(ReportType reportDataType, String uuid, String startTime, String endTime) {
		String timeRangeAndTimeStamp = fileRepository.getReportFileTimeRangeAndTimeStampByStartTimeAndEndTime(uuid,
				startTime, endTime);

		String csvTimestamp = timeRangeAndTimeStamp.split(FILENAME_SEPARATOR)[2];

		if (fileRepository.isExpired(System.currentTimeMillis(), Long.parseLong(csvTimestamp))) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}
		return csvFileGenerator.getDataFromCSV(reportDataType, uuid, timeRangeAndTimeStamp);
	}

	public void generateReport(GenerateReportRequest request, String uuid) {
		List<MetricType> metricTypes = request.getMetricTypes();
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
		asyncMetricsDataHandler.initializeMetricsDataCompletedInHandler(uuid, metricTypes, timeRangeAndTimeStamp);
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
			asyncMetricsDataHandler.updateOverallMetricsCompletedInHandler(uuid, request.getTimeRangeAndTimeStamp());
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

	public List<String> getReportUrls(String uuid) {
		List<String> reportUrls = fileRepository.getReportFiles(uuid)
			.stream()
			.map(it -> it.split("-"))
			.filter(it -> it.length > 2)
			.map(it -> this.generateReportCallbackUrl(uuid, it[1], it[2]))
			.distinct()
			.toList();
		if (reportUrls.isEmpty()) {
			throw new NotFoundException(
					String.format("Don't get the data, please check the uuid: %s, maybe it's expired or error", uuid));
		}
		return reportUrls;
	}

	public String generateReportCallbackUrl(String uuid, String startTime, String endTime) {
		return "/reports/" + uuid + "/detail?startTime=" + startTime + "&endTime=" + endTime;
	}

}
