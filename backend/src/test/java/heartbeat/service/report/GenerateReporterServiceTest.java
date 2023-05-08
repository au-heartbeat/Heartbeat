package heartbeat.service.report;

import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteJob;
import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.GenerateReportResponse;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GenerateReporterServiceTest {

	@InjectMocks
	GenerateReporterService generateReporterService;

	@Mock
	JiraService jiraService;

	@Mock
	private BuildKiteService buildKiteService;

	@Mock
	private CalculateDeploymentFrequencyService calculateDeploymentFrequencyService;

	@Test
	void shouldReturnGenerateReportResponseWhenCallGenerateReporter() {
		JiraBoardSetting jiraBoardSetting = JiraBoardSetting.builder()
			.boardId("")
			.boardColumns(List.of())
			.token("testToken")
			.site("site")
			.doneColumn(List.of())
			.treatFlagCardAsBlock(true)
			.type("jira")
			.projectKey("PLL")
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.metrics(List.of("velocity"))
			.jiraBoardSetting(jiraBoardSetting)
			.startTime("123")
			.endTime("123")
			.jiraBoardSetting(JiraBoardSetting.builder().treatFlagCardAsBlock(true).build())
			.build();

		when(jiraService.getStoryPointsAndCycleTime(any(), any(), any()))
			.thenReturn(CardCollection.builder().storyPointSum(0).cardsNumber(0).build());

		GenerateReportResponse result = generateReporterService.generateReporter(request);
		Velocity velocity = Velocity.builder().velocityForSP("0").velocityForCards("0").build();

		assertThat(result).isEqualTo(GenerateReportResponse.builder().velocity(velocity).build());
	}

	@Test
	public void testGenerateReporterWithDeploymentFrequencyMetric() {
		DeploymentEnvironment deploymentEnvironment = DeploymentEnvironment.builder()
			.id("XXXX")
			.orgName("XXXX")
			.orgId("fs-platform-onboarding")
			.name("XXXX")
			.step(" :shipit: health check for uat environment")
			.build();
		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type("BuildKite")
			.token("bkua_6xxxafcc3bxxxxxxb8xxx8d8dxxxf7897cc8b2f1")
			.deployment(List.of(deploymentEnvironment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.metrics(List.of("deployment frequency"))
			.buildKiteSetting(buildKiteSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.build();
		DeploymentFrequency deploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency("Average", "0.1"))
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfo.builder()
				.commit("a7938273b118805f51956313ee3c6454b9baf9a8")
				.pipelineCreateTime("2022-09-09T04:55:58.978Z")
				.jobs(List.of(BuildKiteJob.builder()
					.name(":spiral_note_pad: static code analysis")
					.state("passed")
					.finishedAt("2022-09-09T04:57:48.802Z")
					.startedAt("2022-09-09T04:57:10.388Z")
					.build()))
				.build()));

		when(buildKiteService.countDeployTimes(any(), any())).thenReturn(DeployTimes.builder()
			.pipelineId("fs-platform-onboarding")
			.pipelineName("XXXX")
			.pipelineStep(" :shipit: health check for uat environment")
			.passed(List.of(DeployInfo.builder()
				.commitId("ab15ce1860a0d2ea26b854e736bf0492ee398b5b")
				.jobStartTime("2022-09-08T22:44:12.391Z")
				.jobFinishTime("2022-09-08T22:45:33.981Z")
				.pipelineCreateTime("2022-09-08T01:15:08.973Z")
				.state("passed")
				.build()))
			.build());
		DeploymentFrequency mockedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency("Average", "0.1"))
			.build();
		when(calculateDeploymentFrequencyService.calculateDeploymentFrequency(any(), anyLong(), anyLong()))
			.thenReturn(mockedDeploymentFrequency);

		GenerateReportResponse response = generateReporterService.generateReporter(request);

		assertThat(response.getDeploymentFrequency().getAvgDeploymentFrequency())
			.isEqualTo(deploymentFrequency.getAvgDeploymentFrequency());
	}

}
