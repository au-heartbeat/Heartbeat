package heartbeat.controller.report.dto.response;

import heartbeat.config.Constants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.DecimalFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvgDeploymentFrequency {

	private String name = "Average";

	private float deploymentFrequency;

	public AvgDeploymentFrequency(float deploymentFrequency) {
		DecimalFormat df = new DecimalFormat(Constants.FORMAT_DOUBLE_2_DECIMALS);
		this.deploymentFrequency = Float.parseFloat(df.format(deploymentFrequency));
	}

}
