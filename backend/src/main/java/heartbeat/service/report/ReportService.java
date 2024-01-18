package heartbeat.service.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.ReportDataType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import static heartbeat.service.report.scheduler.DeleteExpireCSVScheduler.EXPORT_CSV_VALIDITY_TIME;

@Service
@RequiredArgsConstructor
public class ReportService {

	private final CSVFileGenerator csvFileGenerator;

	private final GenerateReporterService generateReporterService;

	public InputStreamResource exportCsv(ReportDataType reportDataType, long csvTimestamp) {
		if (isExpiredTimeStamp(csvTimestamp)) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}
		return csvFileGenerator.getDataFromCSV(reportDataType, csvTimestamp);
	}

	private boolean isExpiredTimeStamp(long timeStamp) {
		return timeStamp < System.currentTimeMillis() - EXPORT_CSV_VALIDITY_TIME;
	}

	public void generateReportByType(GenerateReportRequest request, ReportType metricType) {
		switch (metricType) {
			case BOARD -> generateReporterService.generateBoardReport(request);
			case DORA -> generateReporterService.generateDoraReport(request);
		}
	}

}
