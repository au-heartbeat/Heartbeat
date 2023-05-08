package heartbeat.controller.report.dto.response;

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

	private String deploymentFrequency;

	public AvgDeploymentFrequency(Double deploymentFrequency) {
		DecimalFormat df = new DecimalFormat(Constants.FORMAT_DOUBLE_2_DECIMALS);
		this.deploymentFrequency = df.format(deploymentFrequency);
	}

}
