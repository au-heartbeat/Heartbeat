package heartbeat.service.report;

import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.request.RequireDataEnum;
import heartbeat.controller.report.dto.response.GenerateReportResponse;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Log4j2

public class GenerateReporterService {

	// todo: need remove private fields not use void function when finish GenerateReport
	private CardCollection cardCollection;

	private List<DeployTimes> deployTimesListFromDeploySetting = new ArrayList<>();

	private List<Map.Entry<String, List<BuildKiteBuildInfo>>> buildInfos = new ArrayList<>();

	private final JiraService jiraService;

	private final BuildKiteService buildKiteService;

	private final CalculateDeploymentFrequency calculateDeploymentFrequency;

	// need add GitHubMetrics and BuildKiteMetrics
	private final List<String> kanbanMetrics = Stream
		.of(RequireDataEnum.VELOCITY, RequireDataEnum.CYCLE_TIME, RequireDataEnum.CLASSIFICATION)
		.map(RequireDataEnum::getValue)
		.toList();

	private final List<String> BuildKiteMetrics = Stream
		.of(RequireDataEnum.CHANGE_FAILURE_RATE, RequireDataEnum.DEPLOYMENT_FREQUENCY)
		.map(RequireDataEnum::getValue)
		.toList();


	private List<DeployTimes> deployTimesList = new ArrayList<>();

	private List<Map.Entry<String, List<BuildKiteBuildInfo>>> buildInfosList = new ArrayList<>();

	public GenerateReportResponse generateReporter(GenerateReportRequest request) {
		// fetch data for calculate
		this.fetchOriginalData(request);

		// calculate all required data
		calculateClassification();
		calculateCycleTime();
		calculateLeadTime();

		GenerateReportResponse reportResponse = new GenerateReportResponse();
		request.getMetrics().forEach((metrics) -> {
			switch (metrics.toLowerCase()) {
				case "velocity":
					reportResponse.setVelocity(calculateVelocity());
					break;
				case "deployment frequency":
					reportResponse.setDeploymentFrequency(calculateDeploymentFrequencyService.calculateDeploymentFrequency(
						this.deployTimesList, Long.parseLong(request.getStartTime()), Long.parseLong(request.getEndTime())));
					break;
				default:
					// TODO
			}
		});

		log.info("Successfully generate Report, request: {}, report: {}", request, reportResponse);
		return reportResponse;
	}

	private Velocity calculateVelocity() {
		return Velocity.builder()
			.velocityForSP(String.valueOf(cardCollection.getStoryPointSum()))
			.velocityForCards(String.valueOf(cardCollection.getCardsNumber()))
			.build();
	}

	private void calculateClassification() {
		// todo:add calculate classification logic
	}

	private void calculateCycleTime() {
		// todo:add calculate CycleTime logic
	}

	private void calculateLeadTime() {
		// todo:add calculate LeadTime logic
	}

	private void fetchOriginalData(GenerateReportRequest request) {
		List<String> lowMetrics = request.getMetrics().stream().map(String::toLowerCase).toList();

		if (lowMetrics.stream().anyMatch(this.kanbanMetrics::contains)) {
			fetchDataFromKanban(request);
		}

		fetchGithubData();

		if (lowMetrics.stream().anyMatch(this.BuildKiteMetrics::contains)) {
			fetchBuildKiteData(request);
		}

	}

	private void fetchDataFromKanban(GenerateReportRequest request) {
		JiraBoardSetting jiraBoardSetting = request.getJiraBoardSetting();
		StoryPointsAndCycleTimeRequest storyPointsAndCycleTimeRequest = StoryPointsAndCycleTimeRequest.builder()
			.token(jiraBoardSetting.getToken())
			.type(jiraBoardSetting.getType())
			.site(jiraBoardSetting.getSite())
			.project(jiraBoardSetting.getProjectKey())
			.boardId(jiraBoardSetting.getBoardId())
			.status(jiraBoardSetting.getDoneColumn())
			.startTime(request.getStartTime())
			.endTime(request.getEndTime())
			.targetFields(jiraBoardSetting.getTargetFields())
			.treatFlagCardAsBlock(jiraBoardSetting.getTreatFlagCardAsBlock())
			.build();
		cardCollection = jiraService.getStoryPointsAndCycleTime(storyPointsAndCycleTimeRequest,
			jiraBoardSetting.getBoardColumns(), jiraBoardSetting.getUsers());
	}

	private void fetchGithubData() {
		// todo:add fetchGithubData logic
	}

	private void fetchBuildKiteData(GenerateReportRequest request) {
		// todo:add fetchBuildKiteData logic
		for (DeploymentEnvironment deploymentEnvironment : request.getBuildKiteSetting().getDeployment()) {
			List<BuildKiteBuildInfo> buildKiteBuildInfos = buildKiteService.fetchPipelineBuilds(
				request.getBuildKiteSetting().getToken(), deploymentEnvironment, request.getStartTime(),
				request.getEndTime());
			DeployTimes deployTimes = buildKiteService.countDeployTimes(deploymentEnvironment, buildKiteBuildInfos);
			this.deployTimesList.add(deployTimes);
			this.buildInfosList.add(Map.entry(deploymentEnvironment.getId(), buildKiteBuildInfos));
		}
	}

}
