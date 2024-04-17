package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.util.IdUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

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

	public InputStreamResource exportCsv(ReportType reportDataType, String csvTimestamp, String startDate,
			String endDate) {
		String timeRangeTimeStamp = startDate + "-" + endDate + "-" + csvTimestamp;
		if (isExpiredTimeStamp(Long.parseLong(csvTimestamp))) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}
		return csvFileGenerator.getDataFromCSV(reportDataType, timeRangeTimeStamp);
	}

	private boolean isExpiredTimeStamp(long timeStamp) {
		return timeStamp < System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME;
	}

	public void generateReport(GenerateReportRequest request) {
		List<MetricType> metricTypes = request.getMetricTypes();
		String timeRangeTimeStamp = request.getTimeRangeTimeStamp();
		initializeMetricsDataCompletedInHandler(metricTypes, timeRangeTimeStamp);
		Map<MetricType, Consumer<GenerateReportRequest>> reportGeneratorMap = reportGenerator
			.getReportGenerator(generateReporterService);
		List<CompletableFuture<Void>> threadList = new ArrayList<>();
		for (MetricType metricType : metricTypes) {
			CompletableFuture<Void> metricTypeThread = CompletableFuture
				.runAsync(() -> reportGeneratorMap.get(metricType).accept(request));
			threadList.add(metricTypeThread);
		}

		CompletableFuture.runAsync(() -> {
			for (CompletableFuture<Void> thread : threadList) {
				thread.join();
			}

			ReportResponse reportResponse = generateReporterService
				.getComposedReportResponse(request.getTimeRangeTimeStamp());
			if (isNotGenerateMetricError(reportResponse.getReportMetricsError())) {
				generateReporterService.generateCSVForMetric(reportResponse, request.getTimeRangeTimeStamp());
			}
			asyncMetricsDataHandler
				.updateOverallMetricsCompletedInHandler(IdUtil.getDataCompletedPrefix(request.getTimeRangeTimeStamp()));
		});
	}

	private boolean isNotGenerateMetricError(ReportMetricsError reportMetricsError) {
		return Objects.isNull(reportMetricsError.getBoardMetricsError())
				&& Objects.isNull(reportMetricsError.getSourceControlMetricsError())
				&& Objects.isNull(reportMetricsError.getPipelineMetricsError());
	}

	private void initializeMetricsDataCompletedInHandler(List<MetricType> metricTypes, String timeRangeTimeStamp) {
		MetricsDataCompleted previousMetricsDataCompleted = asyncMetricsDataHandler
			.getMetricsDataCompleted(IdUtil.getDataCompletedPrefix(timeRangeTimeStamp));
		Boolean initializeBoardMetricsCompleted = null;
		Boolean initializeDoraMetricsCompleted = null;
		if (!Objects.isNull(previousMetricsDataCompleted)) {
			initializeBoardMetricsCompleted = previousMetricsDataCompleted.boardMetricsCompleted();
			initializeDoraMetricsCompleted = previousMetricsDataCompleted.doraMetricsCompleted();
		}
		asyncMetricsDataHandler
			.putMetricsDataCompleted(IdUtil.getDataCompletedPrefix(timeRangeTimeStamp), MetricsDataCompleted.builder()
				.boardMetricsCompleted(metricTypes.contains(BOARD) ? Boolean.FALSE : initializeBoardMetricsCompleted)
				.doraMetricsCompleted(metricTypes.contains(DORA) ? Boolean.FALSE : initializeDoraMetricsCompleted)
				.overallMetricCompleted(Boolean.FALSE)
				.isSuccessfulCreateCsvFile(Boolean.FALSE)
				.build());
	}

}
