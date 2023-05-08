package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvgDeploymentFrequency {

	@Builder.Default
	private String name = "Average";

	private String deploymentFrequency;

	public AvgDeploymentFrequency(String deploymentFrequency) {
		this.deploymentFrequency = deploymentFrequency;
	}

}