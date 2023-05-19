package heartbeat.client.dto.codebase.github;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadTime {

	private String commitId;

	private double prCreatedTime;

	private double prMergedTime;

	private double firstCommitTimeInPr;

	private double jobFinishTime;

	private double pipelineCreateTime;

	private double prDelayTime;

	private double pipelineDelayTime;

	private double totalTime;

}
