package heartbeat.controller.report;

import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.CallbackResponse;
import heartbeat.controller.report.dto.response.ReportResponse;
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

import java.util.List;
import java.util.UUID;

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

	@GetMapping("/{reportType}/{uuid}")
	public InputStreamResource exportCSV(
			@Schema(type = "string", allowableValues = { "metric", "pipeline", "board" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable ReportType reportType,
			@PathVariable String uuid,
			@Schema(type = "string", example = "20240310", pattern = "^[0-9]{8}$") @Parameter String startTime,
			@Schema(type = "string", example = "20240409", pattern = "^[0-9]{8}$") @Parameter String endTime) {
		log.info("Start to export CSV file_reportType: {}, uuid: {}", reportType.getValue(), uuid);
		InputStreamResource result = reportService.exportCsv(reportType, uuid, startTime, endTime);
		log.info("Successfully get CSV file_reportType: {}, uuid: {}, _result: {}", reportType.getValue(), uuid,
				result);
		return result;
	}

	@GetMapping("/{uuid}/detail")
	public ReportResponse generateReport(@PathVariable String uuid,
			@Schema(type = "string", example = "20240310", pattern = "^[0-9]{8}$") @Parameter String startTime,
			@Schema(type = "string", example = "20240409", pattern = "^[0-9]{8}$") @Parameter String endTime) {
		log.info("Start to generate report_reportId: {}", uuid);
		return generateReporterService.getComposedReportResponse(uuid, startTime, endTime);
	}

	@GetMapping("/{uuid}")
	public List<String> getReportUrls(@PathVariable String uuid) {
		return reportService.getReportUrl(uuid);
	}

	@PostMapping("/{uuid}")
	public ResponseEntity<CallbackResponse> generateReport(@PathVariable String uuid,
			@RequestBody GenerateReportRequest request) {
		log.info("Start to generate report");
		reportService.generateReport(request, uuid);
		String callbackUrl = reportService.generateReportCallbackUrl(uuid,
				TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(request.getStartTime()),
						request.getTimezoneByZoneId()),
				TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(request.getEndTime()),
						request.getTimezoneByZoneId()));
		log.info("Successfully generate report");
		return ResponseEntity.status(HttpStatus.ACCEPTED)
			.body(CallbackResponse.builder().callbackUrl(callbackUrl).interval(interval).build());
	}

	@PostMapping
	public String generateUUID() {
		return UUID.randomUUID().toString();
	}

}
