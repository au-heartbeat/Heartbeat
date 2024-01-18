package heartbeat.controller.report.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import heartbeat.util.IdUtil;
import heartbeat.util.MetricsUtil;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GenerateReportRequest {

	private Boolean considerHoliday;

	@NotBlank(message = "StartTime is required")
	private String startTime;

	@NotBlank(message = "EndTime is required")
	private String endTime;

	private List<String> metrics;

	private JiraBoardSetting jiraBoardSetting;

	private BuildKiteSetting buildKiteSetting;

	private CodebaseSetting codebaseSetting;

	@NotBlank
	private String csvTimeStamp;

	public List<String> getPipelineMetrics() {
		return this.metrics.stream().map(String::toLowerCase).filter(MetricsUtil.buildKiteMetrics::contains).toList();
	}

	public List<String> getMetrics() {
		return this.metrics.stream().map(String::toLowerCase).toList();
	}

	public List<String> getSourceControlMetrics() {
		return this.metrics.stream().map(String::toLowerCase).filter(MetricsUtil.codebaseMetrics::contains).toList();
	}

	public List<String> getBoardMetrics() {
		return this.metrics.stream().map(String::toLowerCase).filter(MetricsUtil.kanbanMetrics::contains).toList();
	}

	public String getPipelineReportId() {
		return IdUtil.getPipelineReportId(this.csvTimeStamp);
	}

	public String getSourceControlReportId() {
		return IdUtil.getSourceControlReportId(this.csvTimeStamp);
	}

	public String getBoardReportId() {
		return IdUtil.getBoardReportId(this.csvTimeStamp);
	}

}
