package heartbeat.controller.report.dto.response;

import heartbeat.config.Constants;
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

	private float deploymentFrequency;

	private List<DailyDeploymentCount> dailyDeploymentCounts;

	public DeploymentFrequencyOfPipeline(String name, String step, List<DailyDeploymentCount> dailyDeploymentCounts) {
		this.name = name;
		this.step = step;
		this.dailyDeploymentCounts = dailyDeploymentCounts;
	}

	public void setDeploymentFrequency(float deploymentFrequency) {
		DecimalFormat df = new DecimalFormat(Constants.FORMAT_DOUBLE_2_DECIMALS);
		this.deploymentFrequency = Float.parseFloat(df.format(deploymentFrequency));
	}

}
