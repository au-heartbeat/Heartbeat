package heartbeat.controller.report.dto.response;

import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.util.TimeUtil;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadTimeInfo {

	@Nullable
	private String prCreatedTime;

	@Nullable
	private String prMergedTime;

	@Nullable
	private String firstCommitTimeInPr;

	private String jobFinishTime;

	private String jobStartTime;

	private String noPRCommitTime;

	private String firstCommitTime;

	@Nullable
	private String prLeadTime;

	private String pipelineLeadTime;

	@Nullable
	private String totalTime;

	private Boolean isRevert;

	public LeadTimeInfo(LeadTime leadTime) {
		if (leadTime != null) {
			if (leadTime.getFirstCommitTimeInPr() != null) {
				this.firstCommitTimeInPr = TimeUtil
					.convertToISOFormat(String.valueOf(leadTime.getFirstCommitTimeInPr()));
			}

			if (leadTime.getPrCreatedTime() != null) {
				this.prCreatedTime = TimeUtil.convertToISOFormat(String.valueOf(leadTime.getPrCreatedTime()));
			}

			if (leadTime.getPrMergedTime() != null) {
				this.prMergedTime = TimeUtil.convertToISOFormat(String.valueOf(leadTime.getPrMergedTime()));
			}

			this.jobFinishTime = TimeUtil.convertToISOFormat(String.valueOf(leadTime.getJobFinishTime()));

			this.jobStartTime = TimeUtil.convertToISOFormat(String.valueOf(leadTime.getJobStartTime()));

			if (leadTime.getFirstCommitTime() != null) {
				this.firstCommitTime = TimeUtil.convertToISOFormat(String.valueOf(leadTime.getFirstCommitTime()));
			}

			this.pipelineLeadTime = TimeUtil.msToHMS(leadTime.getPipelineLeadTime());

			if (leadTime.getPrLeadTime() != null) {
				this.prLeadTime = TimeUtil.msToHMS(leadTime.getPrLeadTime());
			}

			if (leadTime.getTotalTime() != 0) {
				this.totalTime = TimeUtil.msToHMS(leadTime.getTotalTime());
			}

			if (leadTime.getIsRevert() != null) {
				this.isRevert = leadTime.getIsRevert();
			}

			if (leadTime.getNoPRCommitTime() != null) {
				this.noPRCommitTime = TimeUtil.convertToISOFormat(String.valueOf(leadTime.getNoPRCommitTime()));
			}
		}
	}

}
