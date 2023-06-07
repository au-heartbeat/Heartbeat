package heartbeat.service.report;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import heartbeat.client.component.JiraUriGenerator;
import heartbeat.client.dto.board.jira.JiraBoardConfigDTO;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.client.dto.codebase.github.CommitInfo;
import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteJob;
import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.board.dto.request.BoardRequestParam;
import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.CycleTimeInfo;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraColumnDTO;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.ExportCSVRequest;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.request.RequireDataEnum;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.LeadTimeInfo;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.service.board.jira.JiraColumnResult;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import heartbeat.service.report.calculator.ChangeFailureRateCalculator;
import heartbeat.service.report.calculator.ClassificationCalculator;
import heartbeat.service.report.calculator.CycleTimeCalculator;
import heartbeat.service.report.calculator.DeploymentFrequencyCalculator;
import heartbeat.service.report.calculator.VelocityCalculator;
import heartbeat.service.source.github.GitHubService;
import heartbeat.util.GithubUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.Instant;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Log4j2
public class GenerateReporterService {

	private final JiraService jiraService;

	private final WorkDay workDay;

	private final ClassificationCalculator classificationCalculator;

	private final GitHubService gitHubService;

	private final BuildKiteService buildKiteService;

	private final DeploymentFrequencyCalculator deploymentFrequency;

	private final ChangeFailureRateCalculator changeFailureRate;

	private final CycleTimeCalculator cycleTimeCalculator;

	private final VelocityCalculator velocityCalculator;

	private final CSVFileGenerator csvFileGenerator;

	private final LeadTimeForChangesCalculator leadTimeForChangesCalculator;

	private final JiraUriGenerator urlGenerator;

	private final List<String> kanbanMetrics = Stream
		.of(RequireDataEnum.VELOCITY, RequireDataEnum.CYCLE_TIME, RequireDataEnum.CLASSIFICATION)
		.map(RequireDataEnum::getValue)
		.toList();

	private final List<String> buildKiteMetrics = Stream
		.of(RequireDataEnum.CHANGE_FAILURE_RATE, RequireDataEnum.DEPLOYMENT_FREQUENCY)
		.map(RequireDataEnum::getValue)
		.toList();

	private final List<String> codebaseMetrics = Stream.of(RequireDataEnum.LEAD_TIME_FOR_CHANGES)
		.map(RequireDataEnum::getValue)
		.toList();

	List<String> REQUIRED_STATES = List.of("passed", "failed");

	private CardCollection cardCollection;

	private CardCollection nonDoneCardCollection;

	private List<PipelineLeadTime> pipelineLeadTimes;

	private List<DeployTimes> deployTimesList = new ArrayList<>();

	private List<Map.Entry<String, List<BuildKiteBuildInfo>>> buildInfosList = new ArrayList<>();

	private List<Map.Entry<String, List<BuildKiteBuildInfo>>> leadTimeBuildInfosList = new ArrayList<>();

	public static Map<String, String> getRepoMap(CodebaseSetting codebaseSetting) {
		Map<String, String> repoMap = new HashMap<>();
		for (DeploymentEnvironment currentValue : codebaseSetting.getLeadTime()) {
			repoMap.put(currentValue.getId(), currentValue.getRepository());
		}
		return repoMap;
	}

	public synchronized ReportResponse generateReporter(GenerateReportRequest request) {
		workDay.changeConsiderHolidayMode(request.getConsiderHoliday());
		// fetch data for calculate
		this.fetchOriginalData(request);

		generateCSVForPipeline(request);

		ReportResponse reportResponse = new ReportResponse();
		request.getMetrics().forEach((metrics) -> {
			switch (metrics.toLowerCase()) {
				case "velocity" -> reportResponse.setVelocity(velocityCalculator.calculateVelocity(cardCollection));
				case "cycle time" -> reportResponse.setCycleTime(cycleTimeCalculator.calculateCycleTime(cardCollection,
						request.getJiraBoardSetting().getBoardColumns()));
				case "classification" -> reportResponse.setClassificationList(classificationCalculator
					.calculate(request.getJiraBoardSetting().getTargetFields(), cardCollection));
				case "deployment frequency" ->
					reportResponse.setDeploymentFrequency(deploymentFrequency.calculate(deployTimesList,
							Long.parseLong(request.getStartTime()), Long.parseLong(request.getEndTime())));
				case "change failure rate" ->
					reportResponse.setChangeFailureRate(changeFailureRate.calculate(deployTimesList));
				case "lead time for changes" ->
					reportResponse.setLeadTimeForChanges(leadTimeForChangesCalculator.calculate(pipelineLeadTimes));
				default -> {
					// TODO
				}
			}
		});

		return reportResponse;
	}

	private void fetchOriginalData(GenerateReportRequest request) {
		List<String> lowMetrics = request.getMetrics().stream().map(String::toLowerCase).toList();

		if (lowMetrics.stream().anyMatch(this.kanbanMetrics::contains)) {
			fetchDataFromKanban(request);
		}

		if (lowMetrics.stream().anyMatch(this.codebaseMetrics::contains)) {
			fetchGithubData(request);
		}

		if (lowMetrics.stream().anyMatch(this.buildKiteMetrics::contains)) {
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

		nonDoneCardCollection = jiraService.getStoryPointsAndCycleTimeForNonDoneCards(storyPointsAndCycleTimeRequest,
				jiraBoardSetting.getBoardColumns(), jiraBoardSetting.getUsers());

		BoardRequestParam boardRequestParam = BoardRequestParam.builder()
			.boardId(jiraBoardSetting.getBoardId())
			.projectKey(jiraBoardSetting.getProjectKey())
			.site(jiraBoardSetting.getSite())
			.token(jiraBoardSetting.getToken())
			.startTime(request.getStartTime())
			.endTime(request.getEndTime())
			.build();
		URI baseUrl = urlGenerator.getUri(boardRequestParam.getSite());

		JiraBoardConfigDTO jiraBoardConfigDTO = jiraService.getJiraBoardConfig(baseUrl, boardRequestParam.getBoardId(),
				boardRequestParam.getToken());
		JiraColumnResult jiraColumns = jiraService.getJiraColumns(boardRequestParam, baseUrl, jiraBoardConfigDTO);

		generateCSVForBoard(cardCollection.getJiraCardDTOList(), nonDoneCardCollection.getJiraCardDTOList(),
				jiraColumns.getJiraColumnResponse(), jiraBoardSetting.getTargetFields(), request.getCsvTimeStamp());
	}

	private void generateCSVForBoard(List<JiraCardDTO> allDoneCards, List<JiraCardDTO> nonDoneCards,
			List<JiraColumnDTO> jiraColumns, List<TargetField> targetFields, String csvTimeStamp) {
		List<TargetField> activeTargetFields = targetFields.stream()
			.filter(TargetField::isFlag)
			.collect(Collectors.toList());
		List<BoardCSVConfig> fields = getFixedBoardFields();

		List<BoardCSVConfig> extraFields = getExtraFields(activeTargetFields, fields);

		nonDoneCards.sort((preCard, nextCard) -> {
			Status preStatus = preCard.getBaseInfo().getFields().getStatus();
			Status nextStatus = nextCard.getBaseInfo().getFields().getStatus();
			if (preStatus == null || nextStatus == null) {
				return jiraColumns.size() + 1;
			}
			else {
				String preCardName = preStatus.getDisplayName();
				String nextCardName = nextStatus.getDisplayName();
				return getIndexForStatus(jiraColumns, nextCardName) - getIndexForStatus(jiraColumns, preCardName);
			}
		});

		List<JiraCardDTO> cardDTOList = new ArrayList<>();
		// jiraCardWithEmptyValue
		List<JiraCardDTO> emptyJiraCard = List.of(JiraCardDTO.builder().build());
		cardDTOList.addAll(allDoneCards);
		cardDTOList.addAll(emptyJiraCard);
		cardDTOList.addAll(nonDoneCards);

		List<BoardCSVConfig> newExtraFields = updateExtraFields(extraFields, cardDTOList);

		List<BoardCSVConfig> allBoardFields = insertExtraFields(newExtraFields, fields);
		// cardDTOList.stream().map((jiraCardDTO -> {
		// if (jiraCardDTO.getOriginCycleTime() != null) {
		// jiraCardDTO.getOriginCycleTime().stream().map(CycleTimeInfo::getColumn).distinct().toList();
		// }
		// }))

		Set<String> columns = new HashSet<>();
		cardDTOList.forEach((jiraCardDTO -> {
			if (jiraCardDTO.getOriginCycleTime() != null) {
				jiraCardDTO.getOriginCycleTime().forEach(cardCycleTime -> columns.add(cardCycleTime.getColumn()));
			}
		}));
		columns.forEach(column -> fields.add(
				BoardCSVConfig.builder().label("OriginCycleTime: " + column).value("cycleTimeFlat." + column).build()));

		cardDTOList.forEach((card) -> {
			card.setCycleTimeFlat(buildCycleTimeFlatObject(card));
			card.setTotalCycleTimeDivideStoryPoints(calculateTotalCycleTimeDivideStoryPoints(card));
		});
		csvFileGenerator.convertBoardDataToCSV(cardDTOList, allBoardFields, csvTimeStamp);

	}

	private String calculateTotalCycleTimeDivideStoryPoints(JiraCardDTO card) {
		if (card.getBaseInfo() == null) {
			return "";
		}
		int storyPoints = card.getBaseInfo().getFields().getStoryPoints();
		double cardCycleTime = card.getCardCycleTime().getTotal() == 0.0 ? 0.0 : card.getCardCycleTime().getTotal();

		String formattedResult = String.format("%.2f", cardCycleTime / storyPoints);
		return storyPoints > 0 ? formattedResult : "";
	}

	private Object buildCycleTimeFlatObject(JiraCardDTO card) {
		if (card.getOriginCycleTime() == null) {
			return null;
		}
		HashMap<String, Double> cycleTimeFlat = new HashMap<>();
		for (int j = 0; j < card.getOriginCycleTime().size(); j++) {
			CycleTimeInfo cycleTimeInfo = card.getOriginCycleTime().get(j);
			cycleTimeFlat.put(cycleTimeInfo.getColumn().trim(), cycleTimeInfo.getDay());
		}
		return cycleTimeFlat;
	}

	private List<BoardCSVConfig> insertExtraFields(List<BoardCSVConfig> newExtraFields, List<BoardCSVConfig> fields) {
		int insertIndex = 0;
		for (int index = 0; index < fields.size(); index++) {
			BoardCSVConfig currentField = fields.get(index);
			if ("Cycle Time".equals(currentField.getLabel())) {
				insertIndex = index + 1;
				break;
			}
		}
		fields.addAll(insertIndex, newExtraFields);
		return fields;
	}

	private List<BoardCSVConfig> updateExtraFields(List<BoardCSVConfig> extraFields, List<JiraCardDTO> cardDTOList) {
		final boolean[] hasUpdated = { false };
		return extraFields.stream().map(field -> {
			cardDTOList.stream().map(card -> {
				if (card.getBaseInfo() != null) {
					Map<String, Object> tempFields = classificationCalculator
						.extractFields(card.getBaseInfo().getFields());
					if (!hasUpdated[0] && field.getOriginKey() != null && field.getOriginKey().isEmpty()) {
						Object object = tempFields.get(tempFields);
						String extendField = getFieldDisplayValue(object);
						if (!extendField.isEmpty()) {
							field.setValue(field.getValue() + extendField);
							hasUpdated[0] = true;
						}
					}
				}
				return card;
			}).toList();
			return field;
		}).toList();
	}

	private String getFieldDisplayValue(Object object) {
		boolean isArray = false;
		String result = "";
		if (object instanceof List) {
			isArray = true;
			object = ((List<?>) object).get(0);
		}
		if (object instanceof JsonObject jsonObject) {
			JsonElement name = jsonObject.get("name");
			if (name != null) {
				result = ".name";
			}
			JsonElement displayName = jsonObject.get("displayName");
			if (displayName != null) {
				result = ".displayName";
			}
			JsonElement value = jsonObject.get("value");
			if (value != null) {
				result = ".value";
			}
			JsonElement key = jsonObject.get("key");
			if (key != null) {
				result = ".key";
			}
		}
		else {
			return "";
		}
		if (isArray) {
			result = "[0]" + result;
		}
		return result;
	}

	private int getIndexForStatus(List<JiraColumnDTO> jiraColumns, String name) {
		if (name == null) {
			return 0;
		}
		for (int index = 0; index < jiraColumns.size(); index++) {
			List<String> statuses = jiraColumns.get(index).getValue().getStatuses();
			if (statuses.indexOf(name.toUpperCase()) > -1) {
				return index;
			}
		}
		return jiraColumns.size();
	}

	private static List<BoardCSVConfig> getFixedBoardFields() {
		List<BoardCSVConfig> fields = new ArrayList<>();
		fields.add(BoardCSVConfig.builder().label("Issue key").value("baseInfo.key").build());
		fields.add(BoardCSVConfig.builder().label("Summary").value("baseInfo.fields.summary").build());
		fields.add(BoardCSVConfig.builder().label("Issue Type").value("baseInfo.fields.issuetype.name").build());
		fields.add(BoardCSVConfig.builder().label("Status").value("baseInfo.fields.status.name").build());
		fields.add(BoardCSVConfig.builder().label("Story Points").value("baseInfo.fields.storyPoints").build());
		fields.add(BoardCSVConfig.builder().label("assignee").value("baseInfo.fields.assignee.displayName").build());
		fields.add(BoardCSVConfig.builder().label("Reporter").value("baseInfo.fields.reporter.displayName").build());
		fields.add(BoardCSVConfig.builder().label("Project Key").value("baseInfo.fields.project.key").build());
		fields.add(BoardCSVConfig.builder().label("Project Name").value("baseInfo.fields.project.name").build());
		fields.add(BoardCSVConfig.builder().label("Priority").value("baseInfo.fields.priority.name").build());
		fields.add(BoardCSVConfig.builder()
			.label("Parent Summary")
			.value("baseInfo.fields.parent.fields.summary")
			.build());
		fields.add(BoardCSVConfig.builder().label("Sprint").value("baseInfo.fields.sprint").build());
		fields.add(BoardCSVConfig.builder().label("Labels").value("baseInfo.fields.label").build());
		fields.add(BoardCSVConfig.builder().label("Cycle Time").value("cardCycleTime.total").build());
		fields.add(BoardCSVConfig.builder()
			.label("Cycle Time / Story Points")
			.value("totalCycleTimeDivideStoryPoints")
			.build());
		fields.add(BoardCSVConfig.builder().label("Analysis Days").value("cardCycleTime.steps.analyse").build());
		fields.add(BoardCSVConfig.builder().label("In Dev Days").value("cardCycleTime.steps.development").build());
		fields.add(BoardCSVConfig.builder().label("Waiting Days").value("cardCycleTime.steps.waiting").build());
		fields.add(BoardCSVConfig.builder().label("Testing Days").value("cardCycleTime.steps.testing").build());
		fields.add(BoardCSVConfig.builder().label("Block Days").value("cardCycleTime.steps.blocked").build());
		fields.add(BoardCSVConfig.builder().label("Review Days").value("cardCycleTime.steps.review").build());
		return fields;
	}

	public List<BoardCSVConfig> getExtraFields(List<TargetField> targetFields, List<BoardCSVConfig> currentFields) {
		List<BoardCSVConfig> extraFields = new ArrayList<>();
		for (TargetField targetField : targetFields) {
			boolean isInCurrentFields = false;
			for (BoardCSVConfig currentField : currentFields) {
				if (currentField.getLabel().equalsIgnoreCase(targetField.getName())
						// 区分name相同，但key值不同
						|| currentField.getValue().contains(targetField.getKey())) {
					isInCurrentFields = true;
					break;
				}
			}
			if (!isInCurrentFields) {
				BoardCSVConfig extraField = new BoardCSVConfig();
				extraField.setLabel(targetField.getName());
				extraField.setValue("baseInfo.fields." + targetField.getKey());
				extraField.setOriginKey(targetField.getKey());
				extraFields.add(extraField);
			}
		}
		return extraFields;
	}

	private void fetchGithubData(GenerateReportRequest request) {
		fetchBuildKiteData(request.getStartTime(), request.getEndTime(), request.getCodebaseSetting().getLeadTime(),
				request.getBuildKiteSetting().getToken());
		Map<String, String> repoMap = getRepoMap(request.getCodebaseSetting());
		pipelineLeadTimes = gitHubService.fetchPipelinesLeadTime(deployTimesList, repoMap,
				request.getCodebaseSetting().getToken());
	}

	private void fetchBuildKiteData(GenerateReportRequest request) {
		fetchBuildKiteData(request.getStartTime(), request.getEndTime(),
				request.getBuildKiteSetting().getDeploymentEnvList(), request.getBuildKiteSetting().getToken());
	}

	private void fetchBuildKiteData(String startTime, String endTime,
			List<DeploymentEnvironment> deploymentEnvironments, String token) {
		deployTimesList.clear();
		buildInfosList.clear();
		leadTimeBuildInfosList.clear();
		for (DeploymentEnvironment deploymentEnvironment : deploymentEnvironments) {
			List<BuildKiteBuildInfo> buildKiteBuildInfos = buildKiteService.fetchPipelineBuilds(token,
					deploymentEnvironment, startTime, endTime);
			DeployTimes deployTimes = buildKiteService.countDeployTimes(deploymentEnvironment, buildKiteBuildInfos,
					startTime, endTime);
			deployTimesList.add(deployTimes);
			buildInfosList.add(Map.entry(deploymentEnvironment.getId(), buildKiteBuildInfos));
			leadTimeBuildInfosList.add(Map.entry(deploymentEnvironment.getId(), buildKiteBuildInfos));
		}
	}

	private void generateCSVForPipeline(GenerateReportRequest request) {
		if (request.getBuildKiteSetting() == null) {
			return;
		}

		List<PipelineCSVInfo> leadTimeData = generateCSVForPipelineWithCodebase(request.getCodebaseSetting(),
				request.getStartTime(), request.getEndTime());

		List<PipelineCSVInfo> pipelineData = generateCSVForPipelineWithoutCodebase(
				request.getBuildKiteSetting().getDeploymentEnvList(), request.getStartTime(), request.getEndTime());

		leadTimeData.addAll(pipelineData);
		csvFileGenerator.convertPipelineDataToCSV(leadTimeData, request.getCsvTimeStamp());

	}

	private List<PipelineCSVInfo> generateCSVForPipelineWithoutCodebase(List<DeploymentEnvironment> deploymentEnvList,
			String startTime, String endTime) {
		List<PipelineCSVInfo> pipelineCSVInfos = new ArrayList<>();

		for (DeploymentEnvironment deploymentEnvironment : deploymentEnvList) {
			List<BuildKiteBuildInfo> buildInfos = buildInfosList.stream()
				.filter(entry -> entry.getKey().equals(deploymentEnvironment.getId()))
				.findFirst()
				.map(Map.Entry::getValue)
				.orElse(new ArrayList<>());

			List<PipelineCSVInfo> pipelineCSVInfoList = buildInfos.stream().filter(buildInfo -> {
				BuildKiteJob buildKiteJob = buildInfo.getBuildKiteJob(buildInfo.getJobs(),
						deploymentEnvironment.getStep(), REQUIRED_STATES, startTime, endTime);
				return buildKiteJob != null && !buildInfo.getCommit().isEmpty();
			}).map(buildInfo -> {
				DeployInfo deployInfo = buildInfo.mapToDeployInfo(deploymentEnvironment.getStep(), REQUIRED_STATES,
						startTime, endTime);

				LeadTime noMergeDelayTime = getLeadTimeWithoutMergeDelayTime(deployInfo);

				return PipelineCSVInfo.builder()
					.pipeLineName(deploymentEnvironment.getName())
					.stepName(deploymentEnvironment.getStep())
					.buildInfo(buildInfo)
					.deployInfo(deployInfo)
					.leadTimeInfo(new LeadTimeInfo(noMergeDelayTime))
					.build();
			}).toList();

			pipelineCSVInfos.addAll(pipelineCSVInfoList);
		}
		return pipelineCSVInfos;
	}

	private List<PipelineCSVInfo> generateCSVForPipelineWithCodebase(CodebaseSetting codebaseSetting, String startTime,
			String endTime) {
		List<PipelineCSVInfo> pipelineCSVInfos = new ArrayList<>();

		if (codebaseSetting == null) {
			return pipelineCSVInfos;
		}

		for (DeploymentEnvironment deploymentEnvironment : codebaseSetting.getLeadTime()) {
			String repoId = GithubUtil
				.getGithubUrlFullName(getRepoMap(codebaseSetting).get(deploymentEnvironment.getId()));
			List<BuildKiteBuildInfo> buildInfos = leadTimeBuildInfosList.stream()
				.filter(entry -> entry.getKey().equals(deploymentEnvironment.getId()))
				.findFirst()
				.map(Map.Entry::getValue)
				.orElse(new ArrayList<>());

			List<PipelineCSVInfo> pipelineCSVInfoList = buildInfos.stream().filter(buildInfo -> {
				BuildKiteJob buildKiteJob = buildInfo.getBuildKiteJob(buildInfo.getJobs(),
						deploymentEnvironment.getStep(), REQUIRED_STATES, startTime, endTime);
				return buildKiteJob != null && !buildInfo.getCommit().isEmpty();
			}).map(buildInfo -> {
				DeployInfo deployInfo = buildInfo.mapToDeployInfo(deploymentEnvironment.getStep(), REQUIRED_STATES,
						startTime, endTime);

				LeadTime filteredLeadTime = pipelineLeadTimes.stream()
					.filter(pipelineLeadTime -> Objects.equals(pipelineLeadTime.getPipelineName(),
							deploymentEnvironment.getName()))
					.flatMap(filteredPipeLineLeadTime -> filteredPipeLineLeadTime.getLeadTimes().stream())
					.filter(leadTime -> leadTime.getCommitId().equals(deployInfo.getCommitId()))
					.findFirst()
					.orElse(null);

				CommitInfo commitInfo = gitHubService.fetchCommitInfo(deployInfo.getCommitId(), repoId,
						codebaseSetting.getToken());
				return PipelineCSVInfo.builder()
					.pipeLineName(deploymentEnvironment.getName())
					.stepName(deploymentEnvironment.getStep())
					.buildInfo(buildInfo)
					.deployInfo(deployInfo)
					.commitInfo(commitInfo)
					.leadTimeInfo(new LeadTimeInfo(filteredLeadTime))
					.build();
			}).toList();
			pipelineCSVInfos.addAll(pipelineCSVInfoList);
		}
		return pipelineCSVInfos;
	}

	public InputStreamResource fetchCSVData(ExportCSVRequest request) {
		deleteOldCSV();
		return csvFileGenerator.getDataFromCSV(request.getDataType(), Long.parseLong(request.getCsvTimeStamp()));
	}

	private void deleteOldCSV() {
		File directory = new File("./csv/");
		File[] files = directory.listFiles();
		long currentTimeStamp = System.currentTimeMillis();
		for (File file : files) {
			String fileName = file.getName();
			String[] splitResult = fileName.split("\\s*\\-|\\.\\s*");
			String timeStamp = splitResult[1];
			if (Long.parseLong(timeStamp) < currentTimeStamp - 36000000) {
				file.delete();
			}
		}
	}

	private LeadTime getLeadTimeWithoutMergeDelayTime(DeployInfo deployInfo) {
		long jobFinishTime = Instant.parse(deployInfo.getJobFinishTime()).toEpochMilli();
		long jobStartTime = Instant.parse(deployInfo.getJobStartTime()).toEpochMilli();
		long pipelineCreateTime = Instant.parse(deployInfo.getPipelineCreateTime()).toEpochMilli();

		return LeadTime.builder()
			.commitId(deployInfo.getCommitId())
			.pipelineCreateTime(pipelineCreateTime)
			.jobFinishTime(jobFinishTime)
			.pipelineDelayTime(jobFinishTime - jobStartTime)
			.build();
	}

}
