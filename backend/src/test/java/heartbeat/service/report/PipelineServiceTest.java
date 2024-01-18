package heartbeat.service.report;

import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import heartbeat.service.source.github.GitHubService;
import lombok.val;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
public class PipelineServiceTest {
	@InjectMocks
	private PipelineService pipelineService;

	@Mock
	private BuildKiteService buildKiteService;

	@Mock
	private GitHubService gitHubService;

	@Test
	void fetchGithubDataShouldReturnEmptyBuildInfosListAndEmptyLeadTimeWhenDeploymentEnvironmentsIsEmpty() {
		val request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(new ArrayList()).build())
			.metrics(new ArrayList<>()).build();
		val result = pipelineService.fetchGithubData(request);

		assertEquals(result.getBuildInfosList().size(), 0);
//		assertEquals(result.getLeadTimeBuildInfosList().size(), 0);
		verify(buildKiteService, never()).countDeployTimes(any(), any(), any(), any());
	}

	@Test
	void fetchGithubDataShouldReturnEmptyPipelineLeadTimeWhenCodebaseSettingIsEmpty() {
		val request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(new ArrayList()).build())
			.metrics(new ArrayList<>()).build();
		val result = pipelineService.fetchGithubData(request);

		assertEquals(result.getPipelineLeadTimes().size(), 0);
		verify(gitHubService, never()).fetchPipelinesLeadTime(any(), any(), any());
	}

	@Test
	void fetchGithubDataShouldGetPipelineLeadTimeFromGithubServiceWhenCodebaseSettingIsNotEmpty() {
		val request = GenerateReportRequest.builder()
			.buildKiteSetting(BuildKiteSetting.builder().deploymentEnvList(new ArrayList(){{
				DeploymentEnvironment.builder().id("env1").repository("repo1").build();
				DeploymentEnvironment.builder().id("env2").repository("repo2").build();
			}}).build())
			.codebaseSetting(CodebaseSetting.builder().token("token").build())
			.metrics(new ArrayList<>()).build();

//		when(buildKiteService.)
		val result = pipelineService.fetchGithubData(request);

		verify(buildKiteService, never()).countDeployTimes(any(), any(), any(), any());
		assertEquals(result.getPipelineLeadTimes().size(), 0);
		//buildKiteData.getDeployTimesList(), repoMap,
		//					request.getCodebaseSetting().getToken()
		verify(gitHubService).fetchPipelinesLeadTime(any(), any(),"token");
	}
}
