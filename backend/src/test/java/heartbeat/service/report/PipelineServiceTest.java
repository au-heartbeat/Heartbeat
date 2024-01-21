package heartbeat.service.report;

import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.service.source.github.GitHubService;
import lombok.val;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class PipelineServiceTest {

	@InjectMocks
	private PipelineService pipelineService;

	@Mock
	private BuildKiteService buildKiteService;

	@Mock
	private GitHubService gitHubService;

	@Nested
	class FetchGithubData {

		@Test
		void shouldReturnEmptyBuildInfosListAndEmptyLeadTimeWhenDeploymentEnvironmentsIsEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(new ArrayList()).build())
				.metrics(new ArrayList<>())
				.build();
			FetchedData.BuildKiteData result = pipelineService.fetchGithubData(request);

			assertEquals(0, result.getBuildInfosList().size());
			verify(buildKiteService, never()).countDeployTimes(any(), any(), any(), any());
		}

		@Test
		void shouldReturnEmptyPipelineLeadTimeWhenCodebaseSettingIsEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(new ArrayList()).build())
				.metrics(new ArrayList<>())
				.build();
			FetchedData.BuildKiteData result = pipelineService.fetchGithubData(request);

			assertEquals(0, result.getPipelineLeadTimes().size());
			verify(gitHubService, never()).fetchPipelinesLeadTime(any(), any(), any());
		}

		@Test
		void shouldGetPipelineLeadTimeFromGithubServiceAndBuildkiteServiceWhenCodebaseSettingIsNotEmpty() {
			List<BuildKiteBuildInfo> fakeBuildKiteBuildInfos = new ArrayList<>();
			String startTime = "startTime", endTime = "endTime", token = "token";
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("env1").repository("repo1").build(),
							DeploymentEnvironment.builder().id("env2").repository("repo2").build()))
					.build())
				.startTime(startTime)
				.endTime(endTime)
				.codebaseSetting(CodebaseSetting.builder().token(token).build())
				.metrics(new ArrayList<>())
				.build();

			when(buildKiteService.fetchPipelineBuilds(eq(token), any(), eq(startTime), eq(endTime)))
				.thenReturn(fakeBuildKiteBuildInfos);
			when(buildKiteService.countDeployTimes(any(), eq(fakeBuildKiteBuildInfos), eq(startTime), eq(endTime)))
				.thenReturn(DeployTimes.builder().build());
			when(gitHubService.fetchPipelinesLeadTime(any(), any(), eq(token)))
				.thenReturn(List.of(PipelineLeadTime.builder().build()));

			FetchedData.BuildKiteData result = pipelineService.fetchGithubData(request);

			assertEquals(1, result.getPipelineLeadTimes().size());
			assertEquals(2, result.getBuildInfosList().size());
			assertEquals(2, result.getDeployTimesList().size());
			verify(buildKiteService, times(2)).countDeployTimes(any(), any(), any(), any());
			verify(buildKiteService, times(2)).countDeployTimes(any(), any(), any(), any());
			verify(gitHubService, times(1)).fetchPipelinesLeadTime(any(), any(), eq(token));
		}

		@Test
		void shouldFilterAuthorByInputCrews() {
			List<BuildKiteBuildInfo> fakeBuildKiteBuildInfos = List.of(
					BuildKiteBuildInfo.builder()
						.author(BuildKiteBuildInfo.Author.builder().name("test-author1").build())
						.build(),
					BuildKiteBuildInfo.builder()
						.author(BuildKiteBuildInfo.Author.builder().name("test-author2").build())
						.build());
			String startTime = "startTime", endTime = "endTime", token = "token";
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("env1").repository("repo1").build()))
					.pipelineCrews(List.of("test-author1"))
					.build())
				.startTime(startTime)
				.endTime(endTime)
				.codebaseSetting(CodebaseSetting.builder().token(token).build())
				.metrics(new ArrayList<>())
				.build();

			when(buildKiteService.fetchPipelineBuilds(eq(token), any(), eq(startTime), eq(endTime)))
				.thenReturn(fakeBuildKiteBuildInfos);
			when(buildKiteService.countDeployTimes(any(), eq(fakeBuildKiteBuildInfos), eq(startTime), eq(endTime)))
				.thenReturn(DeployTimes.builder().build());
			when(gitHubService.fetchPipelinesLeadTime(any(), any(), eq(token)))
				.thenReturn(List.of(PipelineLeadTime.builder().build()));

			FetchedData.BuildKiteData result = pipelineService.fetchGithubData(request);

			assertEquals(1, result.getPipelineLeadTimes().size());
			assertEquals(1, result.getBuildInfosList().size());
			assertEquals(0, result.getBuildInfosList().get(0).getValue().size());
			assertEquals(1, result.getDeployTimesList().size());
			verify(buildKiteService, times(1)).fetchPipelineBuilds(any(), any(), any(), any());
			verify(buildKiteService, times(1)).countDeployTimes(any(), any(), any(), any());
			verify(gitHubService, times(1)).fetchPipelinesLeadTime(any(), any(), eq(token));
		}

	}

	@Nested
	class FetchBuildKiteInfo {

		@Test
		void shouldReturnEmptyWhenDeploymentEnvListIsEmpty() {
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(new ArrayList()).build())
				.metrics(new ArrayList<>())
				.build();
			FetchedData.BuildKiteData result = pipelineService.fetchBuildKiteInfo(request);

			assertEquals(0, result.getDeployTimesList().size());
			assertEquals(0, result.getBuildInfosList().size());
			verify(buildKiteService, never()).fetchPipelineBuilds(any(), any(), any(), any());
			verify(buildKiteService, never()).countDeployTimes(any(), any(), any(), any());
		}

		@Test
		void shouldReturnValueWhenDeploymentEnvListIsNotEmpty() {
			List<BuildKiteBuildInfo> fakeBuildKiteBuildInfos = new ArrayList<>();
			String startTime = "startTime", endTime = "endTime", token = "token";
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("env1").repository("repo1").build()))
					.build())
				.metrics(new ArrayList<>())
				.build();

			when(buildKiteService.fetchPipelineBuilds(eq(token), any(), eq(startTime), eq(endTime)))
				.thenReturn(fakeBuildKiteBuildInfos);
			when(buildKiteService.countDeployTimes(any(), eq(fakeBuildKiteBuildInfos), eq(startTime), eq(endTime)))
				.thenReturn(DeployTimes.builder().build());

			FetchedData.BuildKiteData result = pipelineService.fetchBuildKiteInfo(request);

			assertEquals(result.getDeployTimesList().size(), 1);
			assertEquals(result.getBuildInfosList().size(), 1);
			verify(buildKiteService, times(1)).fetchPipelineBuilds(any(), any(), any(), any());
			verify(buildKiteService, times(1)).countDeployTimes(any(), any(), any(), any());
		}

		@Test
		void shouldFilterAuthorByInputCrews() {
			List<BuildKiteBuildInfo> fakeBuildKiteBuildInfos = List.of(
					BuildKiteBuildInfo.builder()
						.author(BuildKiteBuildInfo.Author.builder().name("test-author1").build())
						.build(),
					BuildKiteBuildInfo.builder()
						.author(BuildKiteBuildInfo.Author.builder().name("test-author2").build())
						.build());
			String startTime = "startTime", endTime = "endTime", token = "token";
			GenerateReportRequest request = GenerateReportRequest.builder()
				.buildKiteSetting(BuildKiteSetting.builder()
					.deploymentEnvList(List.of(DeploymentEnvironment.builder().id("env1").repository("repo1").build()))
					.pipelineCrews(List.of("test-author1"))
					.build())
				.startTime(startTime)
				.endTime(endTime)
				.codebaseSetting(CodebaseSetting.builder().token(token).build())
				.metrics(new ArrayList<>())
				.build();

			when(buildKiteService.fetchPipelineBuilds(eq(token), any(), eq(startTime), eq(endTime)))
				.thenReturn(fakeBuildKiteBuildInfos);
			when(buildKiteService.countDeployTimes(any(), eq(fakeBuildKiteBuildInfos), eq(startTime), eq(endTime)))
				.thenReturn(DeployTimes.builder().build());

			FetchedData.BuildKiteData result = pipelineService.fetchBuildKiteInfo(request);

			assertEquals(1, result.getBuildInfosList().size());
			assertEquals(0, result.getBuildInfosList().get(0).getValue().size());
			assertEquals(1, result.getDeployTimesList().size());
			verify(buildKiteService, times(1)).fetchPipelineBuilds(any(), any(), any(), any());
			verify(buildKiteService, times(1)).countDeployTimes(any(), any(), any(), any());
		}

	}

	@Nested
	class GenerateCSVForPipelineWithCodebase {

		@Test
		void shouldReturnEmptyWhenDeploymentEnvironmentsIsEmpty() {
			String startTime = "startTime", endTime = "endTime";
			List<PipelineCSVInfo> result = pipelineService.generateCSVForPipelineWithCodebase(
					CodebaseSetting.builder().build(), startTime, endTime, FetchedData.BuildKiteData.builder().build(),
					Lists.list());

			assertEquals(0, result.size());
		}

		@Test
		void shouldReturnEmptyWhenNoBuildInfoFoundForDeploymentEnvironment() {
			String startTime = "startTime", endTime = "endTime";
			List<PipelineCSVInfo> result = pipelineService.generateCSVForPipelineWithCodebase(
					CodebaseSetting.builder().build(), startTime, endTime, FetchedData.BuildKiteData.builder().build(),
					List.of(DeploymentEnvironment.builder().id("env1").build()));

			assertEquals(0, result.size());
		}

		// @Test
		// void
		// shouldOnlyReturnMatchedInfoWhenBuildInfoForDeploymentEnvironmentIsNotEmpty() {
		// String startTime = "startTime", endTime = "endTime";
		// List<PipelineCSVInfo> result =
		// pipelineService.generateCSVForPipelineWithCodebase(
		// CodebaseSetting.builder().build(), startTime, endTime,
		// FetchedData.BuildKiteData.builder().buildInfosList(
		// List.of(Map.entry("env1", List.of(BuildKiteBuildInfo.builder().build())))
		// ).build(),
		// List.of(DeploymentEnvironment.builder().id("env1").build(),
		// DeploymentEnvironment.builder().id("env2").build()));
		//
		// assertEquals(0, result.size());
		// }

	}

}
