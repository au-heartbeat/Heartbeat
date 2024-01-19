package heartbeat.service.report;

import heartbeat.client.dto.codebase.github.CommitInfo;
import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteJob;
import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.LeadTimeInfo;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.service.source.github.GitHubService;
import heartbeat.util.GithubUtil;
import lombok.AllArgsConstructor;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
public class PipelineService {

	private static final List<String> REQUIRED_STATES = List.of("passed", "failed");

	private final BuildKiteService buildKiteService;

	private final GitHubService gitHubService;

	public FetchedData.BuildKiteData fetchGithubData(GenerateReportRequest request) {
		FetchedData.BuildKiteData buildKiteData = fetchBuildKiteInfo(request);
		Map<String, String> repoMap = getRepoMap(request.getBuildKiteSetting().getDeploymentEnvList());
		List<PipelineLeadTime> pipelineLeadTimes = Collections.emptyList();
		if (Objects.nonNull(request.getCodebaseSetting())
				&& StringUtils.hasLength(request.getCodebaseSetting().getToken())) {
			pipelineLeadTimes = gitHubService.fetchPipelinesLeadTime(buildKiteData.getDeployTimesList(), repoMap,
					request.getCodebaseSetting().getToken());
		}
		buildKiteData.setPipelineLeadTimes(pipelineLeadTimes);
		return buildKiteData;
	}

	public FetchedData.BuildKiteData fetchBuildKiteInfo(GenerateReportRequest request) {
		String startTime = request.getStartTime();
		String endTime = request.getEndTime();
		FetchedData.BuildKiteData result = new FetchedData.BuildKiteData();

		request.getBuildKiteSetting().getDeploymentEnvList().parallelStream().forEach(deploymentEnvironment -> {
			List<BuildKiteBuildInfo> buildKiteBuildInfo = getBuildKiteBuildInfo(startTime, endTime,
					deploymentEnvironment, request.getBuildKiteSetting().getToken(),
					request.getBuildKiteSetting().getPipelineCrews());
			result.addDeployTimes(
					buildKiteService.countDeployTimes(deploymentEnvironment, buildKiteBuildInfo, startTime, endTime));
			result.addBuildKiteBuildInfos(deploymentEnvironment.getId(), buildKiteBuildInfo);
		});
		return result;
	}

	public List<PipelineCSVInfo> generateCSVForPipelineWithCodebase(CodebaseSetting codebaseSetting, String startTime,
			String endTime, FetchedData.BuildKiteData buildKiteData,
			List<DeploymentEnvironment> deploymentEnvironments) {
		List<PipelineCSVInfo> pipelineCSVInfos = new ArrayList<>();
		deploymentEnvironments.parallelStream().forEach(deploymentEnvironment -> {
			List<BuildKiteBuildInfo> buildInfos = getBuildInfos(buildKiteData.getBuildInfosList(),
					deploymentEnvironment.getId());
			if (!buildInfos.isEmpty()) {
				List<String> pipelineSteps = buildKiteService.getPipelineStepNames(buildInfos);
				if (!pipelineSteps.isEmpty()) {
					List<PipelineCSVInfo> pipelineCSVInfoList = buildInfos.stream()
						.filter(buildInfo -> isBuildInfoValid(buildInfo, deploymentEnvironment, pipelineSteps,
								startTime, endTime))
						.map(buildInfo -> getPipelineCSVInfo(codebaseSetting, startTime, endTime, buildKiteData,
								deploymentEnvironment, buildInfo, pipelineSteps))
						.toList();
					pipelineCSVInfos.addAll(pipelineCSVInfoList);
				}
			}
		});
		return pipelineCSVInfos;
	}

	private PipelineCSVInfo getPipelineCSVInfo(CodebaseSetting codebaseSetting, String startTime, String endTime,
			FetchedData.BuildKiteData buildKiteData, DeploymentEnvironment deploymentEnvironment,
			BuildKiteBuildInfo buildInfo, List<String> pipelineSteps) {
		DeployInfo deployInfo = buildInfo.mapToDeployInfo(
				buildKiteService.getStepsBeforeEndStep(deploymentEnvironment.getStep(), pipelineSteps), REQUIRED_STATES,
				startTime, endTime);
		CommitInfo commitInfo = null;
		if (Objects.nonNull(codebaseSetting) && StringUtils.hasLength(codebaseSetting.getToken())
				&& Objects.nonNull(deployInfo.getCommitId())) {
			commitInfo = gitHubService.fetchCommitInfo(deployInfo.getCommitId(),
					GithubUtil.getGithubUrlFullName(deploymentEnvironment.getRepository()), codebaseSetting.getToken());
		}
		return PipelineCSVInfo.builder()
			.pipeLineName(deploymentEnvironment.getName())
			.stepName(deployInfo.getJobName())
			.buildInfo(buildInfo)
			.deployInfo(deployInfo)
			.commitInfo(commitInfo)
			.leadTimeInfo(new LeadTimeInfo(filterLeadTime(buildKiteData, deploymentEnvironment, deployInfo)))
			.build();
	}

	private boolean isBuildInfoValid(BuildKiteBuildInfo buildInfo, DeploymentEnvironment deploymentEnvironment,
			List<String> steps, String startTime, String endTime) {
		BuildKiteJob buildKiteJob = buildInfo.getBuildKiteJob(buildInfo.getJobs(),
				buildKiteService.getStepsBeforeEndStep(deploymentEnvironment.getStep(), steps), REQUIRED_STATES,
				startTime, endTime);
		return buildKiteJob != null && !buildInfo.getCommit().isEmpty();
	}

	private List<BuildKiteBuildInfo> getBuildInfos(List<Map.Entry<String, List<BuildKiteBuildInfo>>> buildInfosList,
			String deploymentEnvironmentId) {
		return buildInfosList.stream()
			.filter(entry -> entry.getKey().equals(deploymentEnvironmentId))
			.findFirst()
			.map(Map.Entry::getValue)
			.orElse(new ArrayList<>());
	}

	private LeadTime filterLeadTime(FetchedData.BuildKiteData buildKiteData,
			DeploymentEnvironment deploymentEnvironment, DeployInfo deployInfo) {
		if (Objects.isNull(buildKiteData.getPipelineLeadTimes())) {
			return null;
		}
		return buildKiteData.getPipelineLeadTimes()
			.stream()
			.filter(pipelineLeadTime -> Objects.equals(pipelineLeadTime.getPipelineName(),
					deploymentEnvironment.getName()))
			.flatMap(filteredPipeLineLeadTime -> filteredPipeLineLeadTime.getLeadTimes().stream())
			.filter(leadTime -> leadTime.getCommitId().equals(deployInfo.getCommitId()))
			.findFirst()
			.orElse(null);
	}

	private Map<String, String> getRepoMap(List<DeploymentEnvironment> deploymentEnvironments) {
		return deploymentEnvironments.stream()
			.collect(Collectors.toMap(DeploymentEnvironment::getId, DeploymentEnvironment::getRepository));
	}

	private List<BuildKiteBuildInfo> getBuildKiteBuildInfo(String startTime, String endTime,
			DeploymentEnvironment deploymentEnvironment, String token, List<String> pipelineCrews) {
		Stream<BuildKiteBuildInfo> buildKiteBuildInfo = buildKiteService
			.fetchPipelineBuilds(token, deploymentEnvironment, startTime, endTime)
			.stream()
			.filter(info -> Objects.nonNull(info.getAuthor()));

		if (!CollectionUtils.isEmpty(pipelineCrews)) {
			buildKiteBuildInfo = buildKiteBuildInfo.filter(info -> pipelineCrews.contains(info.getAuthor().getName()));
		}
		return buildKiteBuildInfo.toList();
	}

}
