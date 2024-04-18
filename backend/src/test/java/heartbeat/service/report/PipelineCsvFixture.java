package heartbeat.service.report;

import heartbeat.client.dto.codebase.github.Author;
import heartbeat.client.dto.codebase.github.Commit;
import heartbeat.client.dto.codebase.github.CommitInfo;
import heartbeat.client.dto.codebase.github.Committer;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteJob;
import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.controller.report.dto.response.LeadTimeInfo;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;

import java.util.List;

public class PipelineCsvFixture {

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.stepName(":rocket: Deploy prod")
			.piplineStatus("passed")
			.valid(true)
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().name("XXXX").build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA_WITHOUT_CREATOR() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.piplineStatus("passed")
			.stepName(":rocket: Deploy prod")
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.creator(null)
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().name("XXXX").build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("1683793037000")
				.jobFinishTime("1684793037000")
				.pipelineLeadTime("653037000")
				.firstCommitTime("168369327000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA_WITHOUT_CREATOR_NAME() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.piplineStatus("passed")
			.stepName(":rocket: Deploy prod")
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.creator(BuildKiteBuildInfo.Creator.builder().name(null).email("XXX@test.com").build())
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA_WITH_MESSAGE_IS_REVERT() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.piplineStatus("passed")
			.stepName(":rocket: Deploy prod")
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.creator(BuildKiteBuildInfo.Creator.builder().name(null).email("XXX@test.com").build())
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().name("XXXX").build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.message("Revert:xxxx")
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.isRevert(Boolean.TRUE)
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA_WITHOUT_Author_NAME() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.piplineStatus("passed")
			.stepName(":rocket: Deploy prod")
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.creator(BuildKiteBuildInfo.Creator.builder().name("XXX").email("XXX@test.com").build())
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA_WITH_PIPELINE_STATUS_IS_CANCELED() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.stepName(":rocket: Deploy prod")
			.piplineStatus("canceled")
			.valid(true)
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("canceled")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().name("XXXX").build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_PIPELINE_CSV_DATA_WITH_NULL_COMMIT_INFO() {
		PipelineCSVInfo pipelineCsvInfo = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.piplineStatus("passed")
			.stepName(":rocket: Deploy prod")
			.valid(true)
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().name("XXXX").build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo);
	}

	public static List<PipelineCSVInfo> MOCK_TWO_ORGANIZATIONS_PIPELINE_CSV_DATA() {
		PipelineCSVInfo pipelineCsvInfo1 = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.stepName(":rocket: Deploy prod")
			.piplineStatus("passed")
			.valid(true)
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.creator(BuildKiteBuildInfo.Creator.builder().name("XXXX").email("XXX@test.com").build())
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		PipelineCSVInfo pipelineCsvInfo2 = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Heartbeat")
			.pipeLineName("Heartbeat")
			.stepName(":rocket: Deploy prod")
			.piplineStatus("passed")
			.valid(true)
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.author(BuildKiteBuildInfo.Author.builder().name("XXXX").build())
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		PipelineCSVInfo pipelineCsvInfo3 = PipelineCSVInfo.builder()
			.organizationName("Thoughtworks-Foxtel")
			.pipeLineName("Heartbeat1")
			.stepName(":rocket: Deploy prod")
			.piplineStatus("passed")
			.valid(true)
			.buildInfo(BuildKiteBuildInfo.builder()
				.commit("713b31878c756c205a6c03eac5be3ac7c7e6a227")
				.pipelineCreateTime("2023-05-10T06:17:21.844Z")
				.state("passed")
				.number(880)
				.creator(BuildKiteBuildInfo.Creator.builder().name("XXXX").email("XXX@test.com").build())
				.jobs(List.of(BuildKiteJob.builder()
					.name(":rocket: Deploy prod")
					.state("passed")
					.startedAt("2023-05-10T06:42:47.498Z")
					.finishedAt("2023-05-10T06:43:02.653Z")
					.build()))
				.branch("branch")
				.build())
			.commitInfo(CommitInfo.builder()
				.commit(Commit.builder()
					.author(Author.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.committer(Committer.builder()
						.name("XXXX")
						.email("XXX@test.com")
						.date("2023-05-10T06:43:02.653Z")
						.build())
					.build())
				.build())
			.leadTimeInfo(LeadTimeInfo.builder()
				.firstCommitTimeInPr("2023-05-08T07:18:18Z")
				.totalTime("8379303")
				.prMergedTime("1683793037000")
				.prLeadTime("16837")
				.prCreatedTime("168369327000")
				.jobStartTime("168369327000")
				.jobFinishTime("1684793037000")
				.firstCommitTime("168369327000")
				.pipelineLeadTime("653037000")
				.build())
			.deployInfo(DeployInfo.builder()
				.state("passed")
				.jobFinishTime("1684793037000")
				.jobStartTime("168369327000")
				.build())
			.build();
		return List.of(pipelineCsvInfo1, pipelineCsvInfo2, pipelineCsvInfo3);
	}

}
