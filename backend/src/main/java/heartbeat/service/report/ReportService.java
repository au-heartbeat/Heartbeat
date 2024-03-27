package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.util.IdUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

import static heartbeat.service.report.scheduler.DeleteExpireCSVScheduler.EXPORT_CSV_VALIDITY_TIME;

@Service
@RequiredArgsConstructor
public class ReportService {

	private final CSVFileGenerator csvFileGenerator;

	private final AsyncMetricsDataHandler asyncMetricsDataHandler;

	private final GenerateReporterService generateReporterService;

	public InputStreamResource exportCsv(ReportType reportDataType, long csvTimestamp) {
		if (isExpiredTimeStamp(csvTimestamp)) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}
		return csvFileGenerator.getDataFromCSV(reportDataType, csvTimestamp);
	}

	private boolean isExpiredTimeStamp(long timeStamp) {
		return timeStamp < System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME;
	}

	public void generateReport(GenerateReportRequest request) {
		List<String> metricTypes = request.getMetricTypes();
		String timeStamp = request.getCsvTimeStamp();
		initializeMetricsDataCompletedInHandler(metricTypes, timeStamp);
		List<CompletableFuture<Void>> threadList = new ArrayList<>();
		for (String metricType : metricTypes) {
			CompletableFuture<Void> metricTypeThread = CompletableFuture.runAsync(() -> {
				switch (metricType) {
					case "board" -> generateReporterService.generateBoardReport(request);
					case "dora" -> generateReporterService.generateDoraReport(request);
					default -> {
						// TODO
					}
				}
			});
			threadList.add(metricTypeThread);
		}

		CompletableFuture.runAsync(() -> {
			for (CompletableFuture<Void> thread : threadList) {
				thread.join();
			}

			ReportResponse reportResponse = generateReporterService
				.getComposedReportResponseWithRequiredCsvField(timeStamp);
			generateReporterService.generateCSVForMetric(reportResponse, timeStamp);
			asyncMetricsDataHandler.updateAllMetricsCompletedInHandler(IdUtil.getDataCompletedPrefix(timeStamp));
		});
	}

	private void initializeMetricsDataCompletedInHandler(List<String> metricTypes, String timeStamp) {
		MetricsDataCompleted previousMetricsCompleted = asyncMetricsDataHandler
			.getMetricsDataCompleted(IdUtil.getDataCompletedPrefix(timeStamp));
		if (Objects.isNull(previousMetricsCompleted)) {
			asyncMetricsDataHandler.putMetricsDataCompleted(IdUtil.getDataCompletedPrefix(timeStamp),
					MetricsDataCompleted.builder()
						.boardMetricsCompleted(metricTypes.contains("board") ? false : null)
						.doraMetricsCompleted(metricTypes.contains("dora") ? false : null)
						.allMetricsCompleted(false)
						.build());
		}
	}

}
