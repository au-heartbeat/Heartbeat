package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Builder
@NoArgsConstructor
@Data
public class LeadTimeForChangesOfSourceControl {

	private String organization;

	private String repo;

	private Double prLeadTime;

	private Double pipelineLeadTime;

	private Double totalDelayTime;

}
