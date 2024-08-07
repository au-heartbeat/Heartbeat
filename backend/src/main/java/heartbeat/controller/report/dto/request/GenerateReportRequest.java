package heartbeat.controller.report.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import heartbeat.util.MetricsUtil;
import heartbeat.util.TimeUtil;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZoneId;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GenerateReportRequest {

	@NotBlank(message = "StartTime is required")
	private String startTime;

	@NotBlank(message = "EndTime is required")
	private String endTime;

	private List<String> metrics;

	private List<MetricType> metricTypes;

	private JiraBoardSetting jiraBoardSetting;

	private BuildKiteSetting buildKiteSetting;

	private CodebaseSetting codebaseSetting;

	@NotBlank
	private String csvTimeStamp;

	@NotBlank
	private String timezone;

	@NotBlank
	private CalendarTypeEnum calendarType;

	@JsonIgnore
	public List<String> getPipelineMetrics() {
		return this.metrics.stream()
			.map(String::toLowerCase)
			.filter(MetricsUtil.BUILDKITE_METRICS.getValue()::contains)
			.toList();
	}

	@JsonIgnore
	public List<String> getSourceControlMetrics() {
		return this.metrics.stream()
			.map(String::toLowerCase)
			.filter(MetricsUtil.CODEBASE_METRICS.getValue()::contains)
			.toList();
	}

	@JsonIgnore
	public List<String> getBoardMetrics() {
		return this.metrics.stream()
			.map(String::toLowerCase)
			.filter(MetricsUtil.KANBAN_METRICS.getValue()::contains)
			.toList();
	}

	@JsonIgnore
	public String getTimeRangeAndTimeStamp() {
		return TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(this.startTime), this.getTimezoneByZoneId()) + "-"
				+ TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(this.endTime), this.getTimezoneByZoneId()) + "-"
				+ this.csvTimeStamp;

	}

	@JsonIgnore
	public GenerateReportRequest toPipelineRequest() {
		return GenerateReportRequest.builder()
			.startTime(this.startTime)
			.endTime(this.endTime)
			.metrics(this.getPipelineMetrics())
			.codebaseSetting(this.codebaseSetting)
			.buildKiteSetting(this.buildKiteSetting)
			.csvTimeStamp(this.csvTimeStamp)
			.timezone(timezone)
			.calendarType(calendarType)
			.build();
	}

	@JsonIgnore
	public GenerateReportRequest toSourceControlRequest() {
		return GenerateReportRequest.builder()
			.startTime(this.startTime)
			.endTime(this.endTime)
			.metrics(this.getSourceControlMetrics())
			.codebaseSetting(this.codebaseSetting)
			.buildKiteSetting(this.buildKiteSetting)
			.csvTimeStamp(this.csvTimeStamp)
			.timezone(timezone)
			.calendarType(calendarType)
			.build();
	}

	@JsonIgnore
	public ZoneId getTimezoneByZoneId() {
		return ZoneId.of(timezone);
	}

}
