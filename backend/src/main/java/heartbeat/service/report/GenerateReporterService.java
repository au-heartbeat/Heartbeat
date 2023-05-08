package heartbeat.service.report;

import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.request.RequireDataEnum;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentDateCount;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequencyModel;
import heartbeat.controller.report.dto.response.DeploymentFrequencyOfPipeline;
import heartbeat.controller.report.dto.response.GenerateReportResponse;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
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

	private final WorkDay workDay;

	// need add GitHubMetrics and BuildKiteMetrics
	private final List<String> kanbanMetrics = Stream
		.of(RequireDataEnum.VELOCITY, RequireDataEnum.CYCLE_TIME, RequireDataEnum.CLASSIFICATION)
		.map(RequireDataEnum::getValue)
		.toList();

	private final List<String> BuildKiteMetrics = Stream
		.of(RequireDataEnum.CHANGE_FAILURE_RATE, RequireDataEnum.DEPLOYMENT_FREQUENCY)
		.map(RequireDataEnum::getValue)
		.toList();

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
					reportResponse.setDeploymentFrequency(calculateDeploymentFrequency(
						Long.parseLong(request.getStartTime()), Long.parseLong(request.getEndTime())));
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

	private DeploymentFrequency calculateDeploymentFrequency(Long startTime, Long endTime) {
		// todo:add calculate Deployment logic
		int timePeriod = workDay.calculateWorkDaysBetween(startTime, endTime);

		List<DeploymentFrequencyModel> deploymentFrequencyModels = this.deployTimesListFromDeploySetting.stream()
			.map((item) -> {
				int passedDeployTimes = item.getPassed()
					.stream()
					.filter((deployInfoItem) -> Instant.parse(deployInfoItem.getJobFinishTime())
						.toEpochMilli() <= endTime)
					.toList()
					.size();
				if (passedDeployTimes == 0 || timePeriod == 0) {
					return new DeploymentFrequencyModel(item.getPipelineName(), item.getPipelineStep(), 0, null);
				}
				return new DeploymentFrequencyModel(item.getPipelineName(), item.getPipelineStep(),
					(double) passedDeployTimes / timePeriod, item.getPassed());
			})
			.toList();

		double deploymentFrequency = deploymentFrequencyModels.stream()
			.mapToDouble(DeploymentFrequencyModel::getValue)
			.sum();

		List<DeploymentFrequencyOfPipeline> deploymentFrequencyOfPipelines = deploymentFrequencyModels.stream()
			.map((item) -> new DeploymentFrequencyOfPipeline(item.getName(), item.getStep(), item.getValue(),
				mapDeploymentPassedItems(item.getPassed()
					.stream()
					.filter((data) -> Instant.parse(data.getJobFinishTime()).toEpochMilli() <= endTime)
					.toList())))
			.toList();

		int pipelineCount = deploymentFrequencyOfPipelines.size();
		double avgDeployFrequency = pipelineCount == 0 ? 0 : (double) deploymentFrequency / pipelineCount;

		// TODO 保留两位小数
		AvgDeploymentFrequency avgDeploymentFrequency = new AvgDeploymentFrequency(Double.toString(avgDeployFrequency));

		return DeploymentFrequency.builder()
			.avgDeploymentFrequency(avgDeploymentFrequency)
			.deploymentFrequencyOfPipelines(deploymentFrequencyOfPipelines)
			.build();
	}

	private List<DeploymentDateCount> mapDeploymentPassedItems(List<DeployInfo> deployInfos) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		if (deployInfos == null || deployInfos.isEmpty()) {
			return Collections.emptyList();
		}
		List<DeploymentDateCount> deploymentDateCounts = new ArrayList<>();
		deployInfos.forEach((item) -> {
			if (!item.getJobFinishTime().equals("") && !item.getJobFinishTime().equals("NaN")) {
				String localDate = formatter.format(Instant.parse(item.getJobFinishTime()).atZone(ZoneId.of("UTC")));
				DeploymentDateCount existingDateItem = deploymentDateCounts.stream()
					.filter((dateCountItem) -> dateCountItem.getDate().equals(localDate))
					.findFirst()
					.orElse(null);
				if (existingDateItem == null) {
					DeploymentDateCount dateCountItem = new DeploymentDateCount(localDate, 1);
					deploymentDateCounts.add(dateCountItem);
				} else {
					existingDateItem.setCount(existingDateItem.getCount() + 1);
				}
			}
		});
		return deploymentDateCounts;
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
			List<BuildKiteBuildInfo> buildInfo = buildKiteService.fetchPipelineBuilds(
				request.getBuildKiteSetting().getToken(), deploymentEnvironment, request.getStartTime(),
				request.getEndTime());
			DeployTimes deployTimes = buildKiteService.countDeployTimes(deploymentEnvironment, buildInfo);
			this.deployTimesListFromDeploySetting.add(deployTimes);
			this.buildInfos.add(Map.entry(deploymentEnvironment.getId(), buildInfo));
		}
	}

}
