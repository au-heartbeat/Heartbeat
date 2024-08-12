package heartbeat.service.report;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.controller.board.dto.request.CardStepsEnum;
import heartbeat.controller.report.dto.response.PipelineChangeFailureRateOfPipeline;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecovery;
import heartbeat.repository.FilePrefixType;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.AvgPipelineChangeFailureRate;
import heartbeat.controller.report.dto.response.AvgPipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.AvgLeadTimeForChanges;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.BoardCSVConfigEnum;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.ClassificationInfo;
import heartbeat.controller.report.dto.response.CycleTime;
import heartbeat.controller.report.dto.response.CycleTimeForSelectedStepItem;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequencyOfPipeline;
import heartbeat.controller.report.dto.response.PipelineChangeFailureRate;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecoveryOfPipeline;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfPipelines;
import heartbeat.controller.report.dto.response.LeadTimeInfo;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.Rework;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.util.DecimalUtil;
import heartbeat.repository.FileRepository;
import io.micrometer.core.instrument.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static heartbeat.service.report.calculator.ClassificationCalculator.pickDisplayNameFromObj;
import static heartbeat.util.TimeUtil.convertToSimpleISOFormat;
import static java.util.Optional.ofNullable;
import static java.util.concurrent.TimeUnit.HOURS;

@RequiredArgsConstructor
@Component
@Log4j2
public class CSVFileGenerator {

	private static final String CANCELED_STATUS = "canceled";

	private static final String REWORK_FIELD = "Rework";

	private final FileRepository fileRepository;

	private static Map<String, JsonElement> getCustomFields(JiraCardDTO perRowCardDTO) {
		if (perRowCardDTO.getBaseInfo() != null && perRowCardDTO.getBaseInfo().getFields() != null) {
			return perRowCardDTO.getBaseInfo().getFields().getCustomFields();
		}
		else {
			return null;
		}
	}

	public void convertPipelineDataToCSV(String uuid, List<PipelineCSVInfo> leadTimeData, String csvTimeStamp) {
		String[] headers = { "Organization", "Pipeline Name", "Pipeline Step", "Valid", "Build Number",
				"Code Committer", "Build Creator", "First Code Committed Time In PR", "PR Created Time",
				"PR Merged Time", "No PR Committed Time", "Job Start Time", "Pipeline Start Time",
				"Pipeline Finish Time", "Non-Workdays (Hours)", "Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)",
				"Pipeline Lead Time (HH:mm:ss)", "Status", "Branch", "Revert" };

		List<String[]> pipelineData = new ArrayList<>();
		pipelineData.add(headers);
		pipelineData.addAll(leadTimeData.stream().map(this::getRowData).toList());
		String[][] data = pipelineData.toArray(new String[0][0]);

		fileRepository.createCSVFileByType(uuid, csvTimeStamp, data, FilePrefixType.PIPELINE_REPORT_PREFIX);
	}

	private String[] getRowData(PipelineCSVInfo csvInfo) {
		String committerName = ofNullable(csvInfo.getBuildInfo().getAuthor())
			.map(BuildKiteBuildInfo.Author::getUsername)
			.orElse(null);

		String creatorName = ofNullable(csvInfo.getBuildInfo().getCreator()).map(BuildKiteBuildInfo.Creator::getName)
			.orElse(null);

		String organization = csvInfo.getOrganizationName();
		String pipelineName = csvInfo.getPipeLineName();
		String stepName = csvInfo.getStepName();
		String valid = String.valueOf(csvInfo.getValid()).toLowerCase();
		String buildNumber = String.valueOf(csvInfo.getBuildInfo().getNumber());

		String state = csvInfo.getPiplineStatus().equals(CANCELED_STATUS) ? CANCELED_STATUS
				: csvInfo.getDeployInfo().getState();
		String branch = csvInfo.getBuildInfo().getBranch();

		LeadTimeInfo leadTimeInfo = csvInfo.getLeadTimeInfo();
		String firstCommitTimeInPr = leadTimeInfo.getFirstCommitTimeInPr();
		String prCreatedTime = leadTimeInfo.getPrCreatedTime();
		String prMergedTime = leadTimeInfo.getPrMergedTime();
		String noPRCommitTime = leadTimeInfo.getNoPRCommitTime();
		String jobStartTime = leadTimeInfo.getJobStartTime();
		String pipelineStartTime = leadTimeInfo.getFirstCommitTime();
		String pipelineFinishTime = csvInfo.getDeployInfo().getJobFinishTime();
		String nonWorkdays = String.valueOf(leadTimeInfo.getNonWorkdays() * 24);
		String totalTime = leadTimeInfo.getTotalTime();
		String prLeadTime = leadTimeInfo.getPrLeadTime();
		String pipelineLeadTime = leadTimeInfo.getPipelineLeadTime();
		String isRevert = leadTimeInfo.getIsRevert() == null ? "" : String.valueOf(leadTimeInfo.getIsRevert());

		return new String[] { organization, pipelineName, stepName, valid, buildNumber, committerName, creatorName,
				firstCommitTimeInPr, prCreatedTime, prMergedTime, noPRCommitTime, jobStartTime, pipelineStartTime,
				pipelineFinishTime, nonWorkdays, totalTime, prLeadTime, pipelineLeadTime, state, branch, isRevert };
	}

	public InputStreamResource getDataFromCSV(ReportType reportDataType, String uuid, String timeRangeAndTimeStamp) {
		if (timeRangeAndTimeStamp.contains("..") || timeRangeAndTimeStamp.contains("/")
				|| timeRangeAndTimeStamp.contains("\\")) {
			throw new IllegalArgumentException("Invalid time range time stamp");
		}
		return switch (reportDataType) {
			case METRIC ->
				fileRepository.readStringFromCsvFile(uuid, timeRangeAndTimeStamp, FilePrefixType.METRIC_REPORT_PREFIX);
			case PIPELINE -> fileRepository.readStringFromCsvFile(uuid, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			default ->
				fileRepository.readStringFromCsvFile(uuid, timeRangeAndTimeStamp, FilePrefixType.BOARD_REPORT_PREFIX);
		};
	}

	public String[][] assembleBoardData(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> fields,
			List<BoardCSVConfig> extraFields) {
		List<BoardCSVConfig> fixedFields = new ArrayList<>(fields);
		fixedFields.removeAll(extraFields);

		String[][] fixedFieldsData = getFixedFieldsData(cardDTOList, fixedFields);
		String[][] extraFieldsData = getExtraFieldsData(cardDTOList, extraFields);

		String[] fixedFieldsRow = fixedFieldsData[0];
		String targetElement = "Cycle Time";
		List<String> fixedFieldsRowList = Arrays.asList(fixedFieldsRow);
		int targetIndex = fixedFieldsRowList.indexOf(targetElement) + 1;

		return mergeArrays(fixedFieldsData, extraFieldsData, targetIndex);
	}

	private String[][] mergeArrays(String[][] fixedFieldsData, String[][] extraFieldsData, int fixedColumnCount) {
		int mergedColumnLength = fixedFieldsData[0].length + extraFieldsData[0].length;
		String[][] mergedArray = new String[fixedFieldsData.length][mergedColumnLength];
		for (int i = 0; i < fixedFieldsData.length; i++) {
			String[] mergedPerRowArray = new String[mergedColumnLength];
			System.arraycopy(fixedFieldsData[i], 0, mergedPerRowArray, 0, fixedColumnCount);
			System.arraycopy(extraFieldsData[i], 0, mergedPerRowArray, fixedColumnCount, extraFieldsData[i].length);
			System.arraycopy(fixedFieldsData[i], fixedColumnCount, mergedPerRowArray,
					fixedColumnCount + extraFieldsData[i].length, fixedFieldsData[i].length - fixedColumnCount);
			mergedArray[i] = mergedPerRowArray;
		}

		return mergedArray;
	}

	private String[][] getExtraFieldsData(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> extraFields) {
		int rowCount = cardDTOList.size() + 1;
		int columnCount = extraFields.size();
		String[][] data = new String[rowCount][columnCount];

		for (int column = 0; column < columnCount; column++) {
			data[0][column] = extraFields.get(column).getLabel();
		}
		for (int row = 0; row < cardDTOList.size(); row++) {
			JiraCardDTO perRowCardDTO = cardDTOList.get(row);
			Map<String, JsonElement> customFields = getCustomFields(perRowCardDTO);
			for (int column = 0; column < columnCount; column++) {
				data[row + 1][column] = getExtraDataPerRow(customFields, extraFields.get(column));
			}
		}
		return data;
	}

	private String[][] getFixedFieldsData(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> fixedFields) {

		int rowCount = cardDTOList.size() + 1;
		int columnCount = fixedFields.size();
		List<BoardCSVConfig> originCycleTimeFields = getOriginCycleTimeFields(fixedFields);
		int fixedFieldColumnCount = columnCount - originCycleTimeFields.size();

		String[][] data = new String[rowCount][columnCount];

		for (int column = 0; column < columnCount; column++) {
			data[0][column] = fixedFields.get(column).getLabel();
		}
		for (int row = 0; row < cardDTOList.size(); row++) {
			JiraCardDTO cardDTO = cardDTOList.get(row);

			String[] fixedDataPerRow = getFixedDataPerRow(cardDTO, fixedFieldColumnCount);
			String[] originCycleTimePerRow = getOriginCycleTimePerRow(cardDTO, originCycleTimeFields);
			data[row + 1] = Stream.concat(Arrays.stream(fixedDataPerRow), Arrays.stream(originCycleTimePerRow))
				.toArray(String[]::new);
		}
		return data;
	}

	private String[] getOriginCycleTimePerRow(JiraCardDTO cardDTO, List<BoardCSVConfig> originCycleTimeFields) {

		int columnCount = originCycleTimeFields.size();
		String[] data = new String[columnCount];

		for (int column = 0; column < columnCount; column++) {
			data[column] = getExtraDataPerRow(cardDTO.getCycleTimeFlat(), originCycleTimeFields.get(column));
		}
		return data;

	}

	private List<BoardCSVConfig> getOriginCycleTimeFields(List<BoardCSVConfig> fixedFields) {
		BoardCSVConfigEnum[] values = BoardCSVConfigEnum.values();
		List<String> fixedLabels = new ArrayList<>();
		List<BoardCSVConfig> originCycleTimeFields = new ArrayList<>(fixedFields);

		for (BoardCSVConfigEnum value : values) {
			fixedLabels.add(value.getLabel());
		}

		originCycleTimeFields.removeIf(config -> fixedLabels.contains(config.getLabel()));

		return originCycleTimeFields;
	}

	private String[] getFixedDataPerRow(JiraCardDTO cardDTO, int columnCount) {
		String[] rowData = new String[columnCount];
		if (cardDTO.getBaseInfo() != null) {
			rowData[0] = cardDTO.getBaseInfo().getKey();

			if (cardDTO.getBaseInfo().getFields() != null) {
				fixDataWithFields(cardDTO, rowData);
			}

		}
		if (cardDTO.getCardCycleTime() != null) {
			rowData[14] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getTotal());
			rowData[15] = cardDTO.getTotalCycleTimeDivideStoryPoints();
			rowData[16] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getTodo());
			rowData[17] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getAnalyse());
			rowData[18] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getDesign());
			rowData[19] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getDevelopment());
			rowData[20] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getBlocked());
			rowData[21] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getReview());
			rowData[22] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getWaitingForTesting());
			rowData[23] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getTesting());
			rowData[24] = DecimalUtil.formatDecimalTwo(cardDTO.getCardCycleTime().getSteps().getWaitingForDeployment());
		}
		return rowData;
	}

	private void fixDataWithFields(JiraCardDTO cardDTO, String[] rowData) {
		rowData[1] = cardDTO.getBaseInfo().getFields().getSummary();
		rowData[2] = cardDTO.getBaseInfo().getFields().getIssuetype().getName();
		rowData[3] = cardDTO.getBaseInfo().getFields().getStatus().getName();
		if (cardDTO.getBaseInfo().getFields().getLastStatusChangeDate() != null) {
			rowData[4] = convertToSimpleISOFormat(cardDTO.getBaseInfo().getFields().getLastStatusChangeDate());
		}
		rowData[5] = String.valueOf(cardDTO.getBaseInfo().getFields().getStoryPoints());
		if (cardDTO.getBaseInfo().getFields().getAssignee() != null) {
			rowData[6] = cardDTO.getBaseInfo().getFields().getAssignee().getDisplayName();
		}
		if (cardDTO.getBaseInfo().getFields().getReporter() != null) {
			rowData[7] = cardDTO.getBaseInfo().getFields().getReporter().getDisplayName();
		}

		rowData[8] = cardDTO.getBaseInfo().getFields().getProject().getKey();
		rowData[9] = cardDTO.getBaseInfo().getFields().getProject().getName();
		rowData[10] = cardDTO.getBaseInfo().getFields().getPriority().getName();

		if (cardDTO.getBaseInfo().getFields().getParent() != null) {
			rowData[11] = cardDTO.getBaseInfo().getFields().getParent().getFields().getSummary();
		}

		if (cardDTO.getBaseInfo().getFields().getSprint() != null) {
			rowData[12] = cardDTO.getBaseInfo().getFields().getSprint().getName();
		}

		rowData[13] = String.join(",", cardDTO.getBaseInfo().getFields().getLabels());
	}

	public String getExtraDataPerRow(Object object, BoardCSVConfig extraField) {
		Map<String, JsonElement> elementMap = (Map<String, JsonElement>) object;
		if (elementMap == null) {
			return null;
		}
		String[] values = extraField.getValue().split("\\.");
		String extraFieldValue = values[values.length - 1];
		Object fieldValue = elementMap.get(extraFieldValue);

		if (fieldValue == null) {
			if (extraField.getLabel().contains("OriginCycleTime")) {
				return "0";
			}
			return "";
		}
		else if (fieldValue instanceof Double) {
			return DecimalUtil.formatDecimalTwo((Double) fieldValue);
		}
		else if (fieldValue.toString().equals("null")) {
			return "";
		}
		else if (fieldValue instanceof JsonArray objectArray) {
			List<String> objectList = new ArrayList<>();
			for (JsonElement element : objectArray) {
				if (element.isJsonObject()) {
					objectList.add(pickDisplayNameFromObj(element.getAsJsonObject()));
				}
			}
			return StringUtils.join(objectList, ",");
		}
		return pickDisplayNameFromObj(fieldValue);
	}

	public void convertMetricDataToCSV(String uuid, ReportResponse reportResponse, String csvTimeStamp) {
		String[] headers = { "Group", "Metrics", "Value" };

		List<String[]> pipelineData = new ArrayList<>();
		pipelineData.add(headers);
		pipelineData.addAll(convertReportResponseToCSVRows(reportResponse));
		String[][] data = pipelineData.toArray(new String[0][0]);

		fileRepository.createCSVFileByType(uuid, csvTimeStamp, data, FilePrefixType.METRIC_REPORT_PREFIX);
	}

	private List<String[]> convertReportResponseToCSVRows(ReportResponse reportResponse) {
		List<String[]> rows = new ArrayList<>();

		Velocity velocity = reportResponse.getVelocity();
		if (velocity != null)
			rows.addAll(getRowsFormVelocity(velocity));

		CycleTime cycleTime = reportResponse.getCycleTime();
		if (cycleTime != null)
			rows.addAll(getRowsFromCycleTime(cycleTime));

		List<Classification> classificationList = reportResponse.getClassificationList();
		if (classificationList != null)
			classificationList.forEach(classification -> rows.addAll(getRowsFormClassification(classification)));

		Rework rework = reportResponse.getRework();
		if (rework != null) {
			rows.addAll(getRowFromRework(rework));
		}

		DeploymentFrequency deploymentFrequency = reportResponse.getDeploymentFrequency();
		if (deploymentFrequency != null)
			rows.addAll(getRowsFromDeploymentFrequency(deploymentFrequency));

		LeadTimeForChanges leadTimeForChanges = reportResponse.getLeadTimeForChanges();
		if (leadTimeForChanges != null)
			rows.addAll(getRowsFromLeadTimeForChanges(leadTimeForChanges));

		PipelineChangeFailureRate pipelineChangeFailureRate = reportResponse.getPipelineChangeFailureRate();
		if (pipelineChangeFailureRate != null)
			rows.addAll(getRowsFromPipelineChangeFailureRate(pipelineChangeFailureRate));

		PipelineMeanTimeToRecovery pipelineMeanTimeToRecovery = reportResponse.getPipelineMeanTimeToRecovery();
		if (pipelineMeanTimeToRecovery != null)
			rows.addAll(getRowsFromPipelineMeanTimeToRecovery(pipelineMeanTimeToRecovery));

		return rows;
	}

	private List<String[]> getRowsFormVelocity(Velocity velocity) {
		List<String[]> rows = new ArrayList<>();
		rows.add(new String[] { "Velocity", "Velocity(Story Point)", String.valueOf(velocity.getVelocityForSP()) });
		rows.add(
				new String[] { "Velocity", "Throughput(Cards Count)", String.valueOf(velocity.getVelocityForCards()) });
		return rows;
	}

	private List<String[]> getRowsFromCycleTime(CycleTime cycleTime) {
		String cycleTimeTitle = "Cycle time";
		List<String[]> rows = new ArrayList<>();
		List<String[]> rowsForSelectedStepItemAverageTime = new ArrayList<>();
		rows.add(new String[] { cycleTimeTitle, "Average cycle time(days/storyPoint)",
				String.valueOf(cycleTime.getAverageCycleTimePerSP()) });
		rows.add(new String[] { cycleTimeTitle, "Average cycle time(days/card)",
				String.valueOf(cycleTime.getAverageCycleTimePerCard()) });
		List<CycleTimeForSelectedStepItem> swimlaneList = cycleTime.getSwimlaneList();

		List<CycleTimeForSelectedStepItem> sortedSwimlaneList = swimlaneList.stream()
			.map(it -> Pair.of(it, CardStepsEnum.fromValue(it.getOptionalItemName()).getOrder()))
			.sorted(Comparator.comparing(Pair::getRight))
			.map(Pair::getLeft)
			.toList();

		sortedSwimlaneList.forEach(cycleTimeForSelectedStepItem -> {
			String stepName = formatStepName(cycleTimeForSelectedStepItem);
			double proportion = cycleTimeForSelectedStepItem.getTotalTime() / cycleTime.getTotalTimeForCards();
			rows.add(new String[] { cycleTimeTitle, "Total " + stepName + " time / Total cycle time(%)",
					DecimalUtil.formatDecimalTwo(proportion * 100) });
			rowsForSelectedStepItemAverageTime
				.add(new String[] { cycleTimeTitle, "Average " + stepName + " time(days/storyPoint)",
						DecimalUtil.formatDecimalTwo(cycleTimeForSelectedStepItem.getAverageTimeForSP()) });
			rowsForSelectedStepItemAverageTime
				.add(new String[] { cycleTimeTitle, "Average " + stepName + " time(days/card)",
						DecimalUtil.formatDecimalTwo(cycleTimeForSelectedStepItem.getAverageTimeForCards()) });
		});
		rows.addAll(rowsForSelectedStepItemAverageTime);

		return rows;
	}

	private List<String[]> getRowFromRework(Rework rework) {
		List<String[]> rows = new ArrayList<>();
		rows.add(new String[] { REWORK_FIELD, "Total rework times", String.valueOf(rework.getTotalReworkTimes()) });
		rows.add(new String[] { REWORK_FIELD, "Total rework cards", String.valueOf(rework.getTotalReworkCards()) });
		rows.add(new String[] { REWORK_FIELD, "Rework cards ratio(Total rework cards/Throughput%)",
				DecimalUtil.formatDecimalTwo(rework.getReworkCardsRatio() * 100) });
		return rows;
	}

	private String formatStepName(CycleTimeForSelectedStepItem cycleTimeForSelectedStepItem) {
		return switch (cycleTimeForSelectedStepItem.getOptionalItemName()) {
			case "In Dev" -> "development";
			case "Block" -> "block";
			case "Review" -> "review";
			case "Testing" -> "testing";
			case "Analysis" -> "analysis";
			case "Waiting for testing" -> "waiting for testing";
			case "Design" -> "design";
			case "Waiting for deployment" -> "waiting for deployment";
			default -> "";
		};
	}

	private List<String[]> getRowsFormClassification(Classification classificationList) {
		List<String[]> rows = new ArrayList<>();
		String fieldName = String.valueOf((classificationList.getFieldName()));
		List<ClassificationInfo> pairList = classificationList.getClassificationInfos();
		pairList.forEach(nameValuePair -> {
			rows.add(new String[] { "Classifications",
					fieldName + " / " + nameValuePair.getName() + "(Value/Cards count%)",
					DecimalUtil.formatDecimalTwo(nameValuePair.getCardCountValue() * 100) });
			rows.add(new String[] { "Classifications",
					fieldName + " / " + nameValuePair.getName() + "(Value/Story point%)",
					DecimalUtil.formatDecimalTwo(nameValuePair.getStoryPointsValue() * 100) });
		});
		return rows;
	}

	private List<String[]> getRowsFromDeploymentFrequency(DeploymentFrequency deploymentFrequency) {
		List<String[]> rows = new ArrayList<>();
		List<DeploymentFrequencyOfPipeline> deploymentFrequencyOfPipelines = deploymentFrequency
			.getDeploymentFrequencyOfPipelines();
		String deploymentFrequencyTitle = "Deployment frequency";
		deploymentFrequencyOfPipelines.forEach(pipeline -> {
			rows.add(new String[] { deploymentFrequencyTitle,
					pipeline.getName() + " / " + extractPipelineStep(pipeline.getStep())
							+ " / Deployment frequency(Deployments/Day)",
					DecimalUtil.formatDecimalTwo(pipeline.getDeploymentFrequency()) });
			rows.add(
					new String[] { deploymentFrequencyTitle,
							pipeline.getName() + " / " + extractPipelineStep(pipeline.getStep())
									+ " / Deployment frequency(Deployment times)",
							String.valueOf(pipeline.getDeployTimes()) });
		});

		AvgDeploymentFrequency avgDeploymentFrequency = deploymentFrequency.getAvgDeploymentFrequency();
		if (deploymentFrequencyOfPipelines.size() > 1) {
			rows.add(new String[] { deploymentFrequencyTitle, "Total / Deployment frequency(Deployments/Day)",
					DecimalUtil.formatDecimalTwo(avgDeploymentFrequency.getDeploymentFrequency()) });
			rows.add(new String[] { deploymentFrequencyTitle, "Total / Deployment frequency(Deployment times)",
					String.valueOf(deploymentFrequency.getTotalDeployTimes()) });
		}

		return rows;
	}

	private String extractPipelineStep(String step) {
		return step.replaceAll(":\\w+: ", "");
	}

	private List<String[]> getRowsFromLeadTimeForChanges(LeadTimeForChanges leadTimeForChanges) {
		List<String[]> rows = new ArrayList<>();

		List<LeadTimeForChangesOfPipelines> leadTimeForChangesOfPipelines = leadTimeForChanges
			.getLeadTimeForChangesOfPipelines();
		String leadTimeForChangesTitle = "Lead time for changes";
		leadTimeForChangesOfPipelines.forEach(pipeline -> {
			String pipelineStep = extractPipelineStep(pipeline.getStep());
			rows.add(new String[] { leadTimeForChangesTitle,
					pipeline.getName() + " / " + pipelineStep + " / PR Lead Time",
					DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(pipeline.getPrLeadTime(), HOURS)) });
			rows.add(new String[] { leadTimeForChangesTitle,
					pipeline.getName() + " / " + pipelineStep + " / Pipeline Lead Time",
					DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(pipeline.getPipelineLeadTime(), HOURS)) });
			rows.add(new String[] { leadTimeForChangesTitle,
					pipeline.getName() + " / " + pipelineStep + " / Total Lead Time",
					DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(pipeline.getTotalDelayTime(), HOURS)) });
		});

		AvgLeadTimeForChanges avgLeadTimeForChanges = leadTimeForChanges.getAvgLeadTimeForChanges();
		if (leadTimeForChangesOfPipelines.size() > 1) {
			rows.add(new String[] { leadTimeForChangesTitle, avgLeadTimeForChanges.getName() + " / PR Lead Time",
					DecimalUtil
						.formatDecimalTwo(TimeUtils.minutesToUnit(avgLeadTimeForChanges.getPrLeadTime(), HOURS)) });
			rows.add(new String[] { leadTimeForChangesTitle, avgLeadTimeForChanges.getName() + " / Pipeline Lead Time",
					DecimalUtil.formatDecimalTwo(
							TimeUtils.minutesToUnit(avgLeadTimeForChanges.getPipelineLeadTime(), HOURS)) });
			rows.add(new String[] { leadTimeForChangesTitle, avgLeadTimeForChanges.getName() + " / Total Lead Time",
					DecimalUtil
						.formatDecimalTwo(TimeUtils.minutesToUnit(avgLeadTimeForChanges.getTotalDelayTime(), HOURS)) });
		}

		return rows;
	}

	private List<String[]> getRowsFromPipelineChangeFailureRate(PipelineChangeFailureRate pipelineChangeFailureRate) {
		List<String[]> rows = new ArrayList<>();
		List<PipelineChangeFailureRateOfPipeline> pipelineChangeFailureRateOfPipelines = pipelineChangeFailureRate
			.getPipelineChangeFailureRateOfPipelines();
		pipelineChangeFailureRateOfPipelines.forEach(pipeline -> rows.add(new String[] { "Pipeline change failure rate",
				pipeline.getName() + " / " + extractPipelineStep(pipeline.getStep())
						+ " / Pipeline change failure rate(%)",
				DecimalUtil.formatDecimalTwo(pipeline.getFailureRate() * 100) }));

		AvgPipelineChangeFailureRate avgPipelineChangeFailureRate = pipelineChangeFailureRate
			.getAvgPipelineChangeFailureRate();
		if (pipelineChangeFailureRateOfPipelines.size() > 1)
			rows.add(new String[] { "Pipeline change failure rate",
					avgPipelineChangeFailureRate.getName() + " / Pipeline change failure rate(%)",
					DecimalUtil.formatDecimalTwo(avgPipelineChangeFailureRate.getFailureRate() * 100) });

		return rows;
	}

	private List<String[]> getRowsFromPipelineMeanTimeToRecovery(
			PipelineMeanTimeToRecovery pipelineMeanTimeToRecovery) {
		List<String[]> rows = new ArrayList<>();
		List<PipelineMeanTimeToRecoveryOfPipeline> pipelineMeanTimeToRecoveryOfPipelines = pipelineMeanTimeToRecovery
			.getPipelineMeanTimeToRecoveryOfPipelines();
		pipelineMeanTimeToRecoveryOfPipelines
			.forEach(pipeline -> rows.add(new String[] { "Pipeline mean time to recovery",
					pipeline.getName() + " / " + extractPipelineStep(pipeline.getStep())
							+ " / Pipeline mean time to recovery",
					DecimalUtil.formatDecimalTwo(
							TimeUtils.millisToUnit(pipeline.getTimeToRecovery().doubleValue(), HOURS)) }));

		AvgPipelineMeanTimeToRecovery avgPipelineMeanTimeToRecovery = pipelineMeanTimeToRecovery
			.getAvgPipelineMeanTimeToRecovery();
		if (pipelineMeanTimeToRecoveryOfPipelines.size() > 1)
			rows.add(new String[] { "Pipeline mean time to recovery",
					avgPipelineMeanTimeToRecovery.getName() + " / Pipeline mean time to recovery",
					DecimalUtil.formatDecimalTwo(TimeUtils
						.millisToUnit(avgPipelineMeanTimeToRecovery.getTimeToRecovery().doubleValue(), HOURS)) });

		return rows;
	}

}
