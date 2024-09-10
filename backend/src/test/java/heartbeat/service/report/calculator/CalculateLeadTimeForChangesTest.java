package heartbeat.service.report.calculator;

import static org.junit.jupiter.api.Assertions.assertEquals;

import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.codebase.github.SourceControlLeadTime;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.CodeBase;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.AvgLeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfPipelines;
import java.util.List;

import heartbeat.controller.report.dto.response.LeadTimeForChangesOfSourceControl;
import heartbeat.service.report.calculator.model.FetchedData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class CalculateLeadTimeForChangesTest {

	@InjectMocks
	private LeadTimeForChangesCalculator calculator;

	@Mock
	private PipelineLeadTime pipelineLeadTime;

	@BeforeEach
	void setup() {
		pipelineLeadTime = PipelineLeadTime.builder()
			.pipelineStep("Step")
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.prCreatedTime(165854910000L)
				.prMergedTime(1658549160000L)
				.firstCommitTimeInPr(165854910000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(165854910000L)
				.prLeadTime(60000L)
				.pipelineLeadTime(60000)
				.totalTime(120000)
				.build()))
			.build();
	}

	@Test
	void shouldReturnEmptyWhenPipelineLeadTimeIsEmpty() {
		List<PipelineLeadTime> pipelineLeadTimes = List.of();
		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(pipelineLeadTimes).build());
		fetchedData.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of()).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(List.of()).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of())
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder().name("Average").build())
			.leadTimeForChangesOfSourceControls(List.of())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnLeadTimeForChangesPipelineIsNotEmpty() {
		List<DeploymentEnvironment> deploymentEnvironmentList = List.of(
				DeploymentEnvironment.builder().id("1").name("Name").step("Step").build(),
				DeploymentEnvironment.builder().id("2").name("Pipeline Name").step("Pipeline Step").build(),
				DeploymentEnvironment.builder().id("3").name("Name").step("Pipeline Step").build());
		List<PipelineLeadTime> pipelineLeadTimes = List.of(pipelineLeadTime);

		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(pipelineLeadTimes).build());
		fetchedData.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of()).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(deploymentEnvironmentList).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(List.of()).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfSourceControls(List.of())
			.leadTimeForChangesOfPipelines(List.of(
					LeadTimeForChangesOfPipelines.builder()
						.name("Name")
						.step("Step")
						.prLeadTime(1.0)
						.pipelineLeadTime(1.0)
						.totalDelayTime(2.0)
						.build(),
					LeadTimeForChangesOfPipelines.builder()
						.name("Pipeline Name")
						.step("Pipeline Step")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build(),
					LeadTimeForChangesOfPipelines.builder()
						.name("Name")
						.step("Pipeline Step")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build()))
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(1.0)
				.pipelineLeadTime(1.0)
				.totalDelayTime(2.0)
				.build())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnEmptyWhenLeadTimeIsNull() {
		PipelineLeadTime mockPipelineLeadTime = PipelineLeadTime.builder()
			.pipelineStep("Step")
			.pipelineName("Name")
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of())
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(0.0)
				.pipelineLeadTime(0.0)
				.totalDelayTime(0.0)
				.build())
			.leadTimeForChangesOfSourceControls(List.of())
			.build();
		List<PipelineLeadTime> pipelineLeadTimes = List.of(mockPipelineLeadTime);
		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(pipelineLeadTimes).build());
		fetchedData.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of()).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(List.of()).build())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnEmptyWhenLeadTimeIsEmpty() {
		pipelineLeadTime.setLeadTimes(List.of());
		List<PipelineLeadTime> pipelineLeadTimes = List.of(pipelineLeadTime);

		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(pipelineLeadTimes).build());
		fetchedData.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of()).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(List.of()).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of())
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(0.0)
				.pipelineLeadTime(0.0)
				.totalDelayTime(0.0)
				.build())
			.leadTimeForChangesOfSourceControls(List.of())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnFilteredResultWhenPrMergedTimeOrPrLeadTimeIsNull() {
		PipelineLeadTime noMergedTime = PipelineLeadTime.builder()
			.pipelineStep("Step")
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder().prMergedTime(0L).build(), LeadTime.builder().build(),
					LeadTime.builder().prMergedTime(1L).prLeadTime(0L).build(),
					LeadTime.builder().prMergedTime(1L).build(),
					LeadTime.builder()
						.commitId("111")
						.prCreatedTime(165854910000L)
						.prMergedTime(1658549160000L)
						.firstCommitTimeInPr(165854910000L)
						.jobFinishTime(1658549160000L)
						.pipelineCreateTime(165854910000L)
						.prLeadTime(60000L)
						.pipelineLeadTime(60000)
						.totalTime(120000)
						.build()))
			.build();
		List<PipelineLeadTime> pipelineLeadTimes = List.of(noMergedTime);

		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(pipelineLeadTimes).build());
		fetchedData.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of()).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(List.of()).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of(LeadTimeForChangesOfPipelines.builder()
				.name("Name")
				.step("Step")
				.prLeadTime(0.2)
				.pipelineLeadTime(0.2)
				.totalDelayTime(0.4)
				.build()))
			.leadTimeForChangesOfSourceControls(List.of())
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(0.2)
				.pipelineLeadTime(0.2)
				.totalDelayTime(0.4)
				.build())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnLeadTimeForChangesWhenSourceControlIsNotEmpty() {
		List<CodeBase> codeBaseList = List.of(
				CodeBase.builder()
					.organization("test-org1")
					.branches(List.of("test-branch1"))
					.repo("test-repo1")
					.build(),
				CodeBase.builder()
					.organization("test-org2")
					.branches(List.of("test-branch2"))
					.repo("test-repo2")
					.build(),
				CodeBase.builder()
					.organization("test-org1")
					.branches(List.of("test-branch3"))
					.repo("test-repo3")
					.build());

		SourceControlLeadTime sourceControlLeadTime = SourceControlLeadTime.builder()
			.organization("test-org1")
			.repo("test-repo1")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.prCreatedTime(165854910000L)
				.prMergedTime(1658549160000L)
				.firstCommitTimeInPr(165854910000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(165854910000L)
				.prLeadTime(60000L)
				.pipelineLeadTime(60000)
				.totalTime(120000)
				.build()))
			.build();

		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(List.of()).build());
		fetchedData
			.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of(sourceControlLeadTime)).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(codeBaseList).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of())
			.leadTimeForChangesOfSourceControls(List.of(
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org1")
						.repo("test-repo1")
						.prLeadTime(1.0)
						.pipelineLeadTime(1.0)
						.totalDelayTime(2.0)
						.build(),
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org2")
						.repo("test-repo2")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build(),
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org1")
						.repo("test-repo3")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build()))
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(1.0)
				.pipelineLeadTime(1.0)
				.totalDelayTime(2.0)
				.build())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnLeadTimeForChangesWhenSourceControlLeadTimeIsNull() {
		List<CodeBase> codeBaseList = List.of(
				CodeBase.builder()
					.organization("test-org1")
					.branches(List.of("test-branch1"))
					.repo("test-repo1")
					.build(),
				CodeBase.builder()
					.organization("test-org2")
					.branches(List.of("test-branch2"))
					.repo("test-repo2")
					.build(),
				CodeBase.builder()
					.organization("test-org3")
					.branches(List.of("test-branch3"))
					.repo("test-repo3")
					.build());

		SourceControlLeadTime sourceControlLeadTime = SourceControlLeadTime.builder()
			.organization("test-org1")
			.repo("test-repo1")
			.build();

		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(List.of()).build());
		fetchedData
			.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of(sourceControlLeadTime)).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(codeBaseList).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of())
			.leadTimeForChangesOfSourceControls(List.of(
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org1")
						.repo("test-repo1")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build(),
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org2")
						.repo("test-repo2")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build(),
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org3")
						.repo("test-repo3")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build()))
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(0.0)
				.pipelineLeadTime(0.0)
				.totalDelayTime(0.0)
				.build())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnLeadTimeForChangesWhenSourceControlLeadTimeIsEmpty() {
		List<CodeBase> codeBaseList = List.of(
				CodeBase.builder()
					.organization("test-org1")
					.branches(List.of("test-branch1"))
					.repo("test-repo1")
					.build(),
				CodeBase.builder()
					.organization("test-org2")
					.branches(List.of("test-branch2"))
					.repo("test-repo2")
					.build(),
				CodeBase.builder()
					.organization("test-org3")
					.branches(List.of("test-branch3"))
					.repo("test-repo3")
					.build());

		SourceControlLeadTime sourceControlLeadTime = SourceControlLeadTime.builder()
			.organization("test-org1")
			.repo("test-repo1")
			.leadTimes(List.of())
			.build();

		FetchedData fetchedData = new FetchedData();
		fetchedData.setBuildKiteData(FetchedData.BuildKiteData.builder().pipelineLeadTimes(List.of()).build());
		fetchedData
			.setRepoData(FetchedData.RepoData.builder().sourceControlLeadTimes(List.of(sourceControlLeadTime)).build());
		GenerateReportRequest request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(List.of()).build())
			.codebaseSetting(CodebaseSetting.builder().codebases(codeBaseList).build())
			.build();
		LeadTimeForChanges expect = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of())
			.leadTimeForChangesOfSourceControls(List.of(
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org1")
						.repo("test-repo1")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build(),
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org2")
						.repo("test-repo2")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build(),
					LeadTimeForChangesOfSourceControl.builder()
						.organization("test-org3")
						.repo("test-repo3")
						.prLeadTime(0.0)
						.pipelineLeadTime(0.0)
						.totalDelayTime(0.0)
						.build()))
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.prLeadTime(0.0)
				.pipelineLeadTime(0.0)
				.totalDelayTime(0.0)
				.build())
			.build();

		LeadTimeForChanges result = calculator.calculate(fetchedData, request);

		assertEquals(expect, result);
	}

}
