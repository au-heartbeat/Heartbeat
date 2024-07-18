package heartbeat.controller.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.CallbackResponse;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.ShareApiDetailsResponse;
import heartbeat.controller.report.dto.response.UuidResponse;
import heartbeat.service.report.GenerateReporterService;
import heartbeat.service.report.ReportService;
import heartbeat.util.TimeUtil;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Report")
@RequestMapping("/reports")
@Validated
@Log4j2
public class ReportController {

	private final GenerateReporterService generateReporterService;

	private final ReportService reportService;

	@Value("${callback.interval}")
	private Integer interval;

	@GetMapping("/{reportType}/{reportId}")
	public InputStreamResource exportCSV(
			@Schema(type = "string", allowableValues = { "metric", "pipeline", "board" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable ReportType reportType,
			@PathVariable String reportId,
			@Schema(type = "string", example = "20240310", pattern = "^[0-9]{8}$") @Parameter String startTime,
			@Schema(type = "string", example = "20240409", pattern = "^[0-9]{8}$") @Parameter String endTime) {
		log.info("Start to export CSV file_reportType: {}, reportId: {}", reportType.getValue(), reportId);
		InputStreamResource result = reportService.exportCsv(reportType, reportId, startTime, endTime);
		log.info("Successfully get CSV file_reportType: {}, reportId: {}, result description: {}",
				reportType.getValue(), reportId, result.getDescription());
		return result;
	}

	@GetMapping("/{reportId}/detail")
	public ReportResponse generateReport(@PathVariable String reportId,
			@Schema(type = "string", example = "20240310", pattern = "^[0-9]{8}$") @Parameter String startTime,
			@Schema(type = "string", example = "20240409", pattern = "^[0-9]{8}$") @Parameter String endTime) {
		log.info("Start to generate report, reportId: {}", reportId);
		ReportResponse composedReportResponse = generateReporterService.getComposedReportResponse(reportId, startTime,
				endTime);
		log.info("Successfully generate report, reportId: {}", reportId);
		return composedReportResponse;
	}

	@GetMapping("/{reportId}")
	public ShareApiDetailsResponse getShareDetails(@PathVariable String reportId) {
		log.info("Start to get share details, reportId: {}", reportId);
		ShareApiDetailsResponse shareReportInfo = reportService.getShareReportInfo(reportId);
		log.info("Successfully get share details result, reportId: {}", reportId);
		return shareReportInfo;
	}

	@PostMapping("/{reportId}")
	public ResponseEntity<CallbackResponse> generateReport(@PathVariable String reportId,
			@RequestBody GenerateReportRequest request) {
		log.info("Start to generate report, reportId: {}", reportId);
		reportService.generateReport(request, reportId);
		reportService.saveRequestInfo(request, reportId);
		String callbackUrl = reportService.generateReportCallbackUrl(reportId,
				TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(request.getStartTime()),
						request.getTimezoneByZoneId()),
				TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(request.getEndTime()),
						request.getTimezoneByZoneId()));
		log.info("Successfully generate report, reportId: {}", reportId);
		return ResponseEntity.status(HttpStatus.ACCEPTED)
			.body(CallbackResponse.builder().callbackUrl(callbackUrl).interval(interval).build());
	}

	@PostMapping
	public UuidResponse generateUUID() {
		log.info("start to generate reportId");
		UuidResponse uuidResponse = reportService.generateReportId();
		log.info("Successfully generate reportId, reportId: {}", uuidResponse.getReportId());
		return uuidResponse;
	}

}
