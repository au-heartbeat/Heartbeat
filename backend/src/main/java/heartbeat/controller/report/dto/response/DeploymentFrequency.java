package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentFrequency {

	private AvgDeploymentFrequency avgDeploymentFrequency;

	private List<DeploymentFrequencyOfPipeline> deploymentFrequencyOfPipelines;

}
