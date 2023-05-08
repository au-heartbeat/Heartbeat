package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.DecimalFormat;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentFrequencyOfPipeline {

	private String name;

	private String step;

	private String deploymentFrequency;

	private List<DailyDeploymentCount> dailyDeploymentCounts;

	public DeploymentFrequencyOfPipeline(String name, String step, List<DailyDeploymentCount> dailyDeploymentCounts) {
		this.name = name;
		this.step = step;
		this.dailyDeploymentCounts = dailyDeploymentCounts;
	}

	public void setDeploymentFrequency(Double deploymentFrequency) {
		DecimalFormat df = new DecimalFormat(Constants.FORMAT_DOUBLE_2_DECIMALS);
		this.deploymentFrequency = df.format(deploymentFrequency);
	}

}
