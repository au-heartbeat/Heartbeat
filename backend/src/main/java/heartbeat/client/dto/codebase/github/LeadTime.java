package heartbeat.client.dto.codebase.github;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadTime {

	private String commitId;

	private String committer;

	private Integer pullNumber;

	@Nullable
	private Long prCreatedTime;

	@Nullable
	private Long prMergedTime;

	@Nullable
	private Long firstCommitTimeInPr;

	private Long jobFinishTime;

	private Long jobStartTime;

	@Nullable
	private Long noPRCommitTime;

	@Nullable
	private Long firstCommitTime;

	private Long pipelineCreateTime;

	@Nullable
	private Boolean isRevert;

	@Nullable
	private Long prLeadTime;

	private long pipelineLeadTime;

	private long totalTime;

	private long holidays;

}
