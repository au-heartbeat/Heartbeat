package heartbeat.service.report;

import com.google.gson.*;
import heartbeat.client.component.JiraUriGenerator;
import heartbeat.client.dto.board.jira.JiraBoardConfigDTO;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.controller.board.dto.request.BoardRequestParam;
import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.board.dto.response.*;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.BoardCSVConfigEnum;
import heartbeat.service.board.jira.JiraColumnResult;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.util.DecimalUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@Log4j2
@RequiredArgsConstructor
public class KanbanCsvService {

	private static final String[] FIELD_NAMES = { "assignee", "summary", "status", "issuetype", "reporter",
			"timetracking", "statusCategoryChangeData", "storyPoints", "fixVersions", "project", "parent", "priority",
			"labels" };

	private final CSVFileGenerator csvFileGenerator;

	private final JiraService jiraService;

	private final JiraUriGenerator urlGenerator;

	public void generateCsvInfo(GenerateReportRequest request, CardCollection realDoneCardCollection,
			CardCollection nonDoneCardCollection) {
		JiraBoardSetting jiraBoardSetting = request.getJiraBoardSetting();
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

		this.generateCSVForBoard(realDoneCardCollection.getJiraCardDTOList(),
				nonDoneCardCollection.getJiraCardDTOList(), jiraColumns.getJiraColumnResponse(),
				jiraBoardSetting.getTargetFields(), request.getCsvTimeStamp());
	}

	private void generateCSVForBoard(List<JiraCardDTO> allDoneCards, List<JiraCardDTO> nonDoneCards,
			List<JiraColumnDTO> jiraColumns, List<TargetField> targetFields, String csvTimeStamp) {
		List<JiraCardDTO> cardDTOList = new ArrayList<>();
		List<JiraCardDTO> emptyJiraCard = List.of(JiraCardDTO.builder().build());
		cardDTOList.addAll(allDoneCards);
		cardDTOList.addAll(emptyJiraCard);

		if (nonDoneCards != null) {
			if (nonDoneCards.size() > 1) {
				nonDoneCards.sort((preCard, nextCard) -> {
					Status preStatus = preCard.getBaseInfo().getFields().getStatus();
					Status nextStatus = nextCard.getBaseInfo().getFields().getStatus();
					if (preStatus == null || nextStatus == null) {
						return jiraColumns.size() + 1;
					}
					else {
						String preCardName = preStatus.getName();
						String nextCardName = nextStatus.getName();
						return getIndexForStatus(jiraColumns, nextCardName)
								- getIndexForStatus(jiraColumns, preCardName);
					}
				});
			}
			cardDTOList.addAll(nonDoneCards);
		}
		List<String> columns = cardDTOList.stream().flatMap(cardDTO -> {
			if (cardDTO.getOriginCycleTime() != null) {
				return cardDTO.getOriginCycleTime().stream();
			}
			else {
				return Stream.empty();
			}
		}).map(CycleTimeInfo::getColumn).distinct().toList();

		List<TargetField> activeTargetFields = targetFields.stream().filter(TargetField::isFlag).toList();

		List<BoardCSVConfig> fields = getFixedBoardFields();
		List<BoardCSVConfig> extraFields = getExtraFields(activeTargetFields, fields);

		List<BoardCSVConfig> newExtraFields = updateExtraFields(extraFields, cardDTOList);
		List<BoardCSVConfig> allBoardFields = insertExtraFields(newExtraFields, fields);

		columns.forEach(column -> allBoardFields.add(
				BoardCSVConfig.builder().label("OriginCycleTime: " + column).value("cycleTimeFlat." + column).build()));

		cardDTOList.forEach(card -> {
			card.setCycleTimeFlat(card.buildCycleTimeFlatObject());
			card.setTotalCycleTimeDivideStoryPoints(card.getTotalCycleTimeDivideStoryPoints());
		});
		// csvFileGenerator.test(cardDTOList, allBoardFields, newExtraFields,
		// csvTimeStamp);
		csvFileGenerator.convertBoardDataToCSV(cardDTOList, allBoardFields, newExtraFields, csvTimeStamp);
	}

	private List<BoardCSVConfig> insertExtraFields(List<BoardCSVConfig> extraFields,
			List<BoardCSVConfig> currentFields) {
		List<BoardCSVConfig> modifiedFields = new ArrayList<>(currentFields);
		int insertIndex = 0;
		for (int i = 0; i < modifiedFields.size(); i++) {
			BoardCSVConfig currentField = modifiedFields.get(i);
			if (currentField.getLabel().equals("Cycle Time")) {
				insertIndex = i + 1;
				break;
			}
		}
		modifiedFields.addAll(insertIndex, extraFields);
		return modifiedFields;
	}

	private List<BoardCSVConfig> updateExtraFields(List<BoardCSVConfig> extraFields, List<JiraCardDTO> cardDTOList) {
		List<BoardCSVConfig> updatedFields = new ArrayList<>();
		for (BoardCSVConfig field : extraFields) {
			boolean hasUpdated = false;
			for (JiraCardDTO card : cardDTOList) {
				if (card.getBaseInfo() != null) {
					Map<String, Object> tempFields = extractFields(card.getBaseInfo().getFields());
					if (!hasUpdated && field.getOriginKey() != null) {
						Object object = tempFields.get(field.getOriginKey());
						String extendField = getFieldDisplayValue(object);
						if (extendField != null) {
							field.setValue(field.getValue() + extendField);
							hasUpdated = true;
						}
					}
				}
			}
			updatedFields.add(field);
		}
		return updatedFields;
	}

	private Map<String, Object> extractFields(JiraCardField jiraCardFields) {
		Map<String, Object> tempFields = new HashMap<>(jiraCardFields.getCustomFields());

		for (String fieldName : FIELD_NAMES) {
			switch (fieldName) {
				case "assignee" -> tempFields.put(fieldName, jiraCardFields.getAssignee());
				case "summary" -> tempFields.put(fieldName, jiraCardFields.getSummary());
				case "status" -> tempFields.put(fieldName, jiraCardFields.getStatus());
				case "issuetype" -> tempFields.put(fieldName, jiraCardFields.getIssuetype());
				case "reporter" -> tempFields.put(fieldName, jiraCardFields.getReporter());
				case "statusCategoryChangeData" ->
					tempFields.put(fieldName, jiraCardFields.getStatusCategoryChangeDate());
				case "storyPoints" -> tempFields.put(fieldName, jiraCardFields.getStoryPoints());
				case "fixVersions" -> tempFields.put(fieldName, jiraCardFields.getFixVersions());
				case "project" -> tempFields.put(fieldName, jiraCardFields.getProject());
				case "parent" -> tempFields.put(fieldName, jiraCardFields.getParent());
				case "priority" -> tempFields.put(fieldName, jiraCardFields.getPriority());
				case "labels" -> tempFields.put(fieldName, jiraCardFields.getLabels());
				default -> {
				}
			}
		}
		return tempFields;
	}

	private int getIndexForStatus(List<JiraColumnDTO> jiraColumns, String name) {
		for (int index = 0; index < jiraColumns.size(); index++) {
			List<String> statuses = jiraColumns.get(index).getValue().getStatuses();
			if (statuses.contains(name.toUpperCase())) {
				return index;
			}
		}
		return jiraColumns.size();
	}

	private List<BoardCSVConfig> getExtraFields(List<TargetField> targetFields, List<BoardCSVConfig> currentFields) {
		List<BoardCSVConfig> extraFields = new ArrayList<>();
		for (TargetField targetField : targetFields) {
			boolean isInCurrentFields = false;
			for (BoardCSVConfig currentField : currentFields) {
				if (currentField.getLabel().equalsIgnoreCase(targetField.getName())
						|| currentField.getValue().contains(targetField.getKey())) {
					isInCurrentFields = true;
					break;
				}
			}
			if (!isInCurrentFields) {
				BoardCSVConfig extraField = new BoardCSVConfig();
				extraField.setLabel(targetField.getName());
				extraField.setValue("baseInfo.fields.customFields." + targetField.getKey());
				extraField.setOriginKey(targetField.getKey());
				extraFields.add(extraField);
			}
		}
		return extraFields;
	}

	private List<BoardCSVConfig> getFixedBoardFields() {
		List<BoardCSVConfig> fields = new ArrayList<>();
		for (BoardCSVConfigEnum field : BoardCSVConfigEnum.values()) {
			fields.add(BoardCSVConfig.builder().label(field.getLabel()).value(field.getValue()).build());
		}
		return fields;
	}

	private String getFieldDisplayValue(Object object) {
		Gson gson = new Gson();
		String result = "";
		if (object == null || object instanceof JsonNull || object instanceof Double || object instanceof String
				|| object instanceof JsonPrimitive) {
			return result;
		}

		Object tempObject = object;

		if (tempObject instanceof List<?> list && !list.isEmpty()) {
			tempObject = list.get(0);
			result = "[0]";
		}
		else if (tempObject instanceof JsonArray jsonArray && !jsonArray.isEmpty()) {
			tempObject = jsonArray.get(0);
			result = "[0]";
		}
		else {
			return result;
		}

		JsonObject jsonObject = gson.toJsonTree(tempObject).getAsJsonObject();
		if (jsonObject.has("name")) {
			result += ".name";
		}
		else if (jsonObject.has("displayName")) {
			result += ".displayName";
		}
		else if (jsonObject.has("value")) {
			result += ".value";
		}
		else if (jsonObject.has("key")) {
			result += ".key";
		}

		return result;
	}

	private static StoryPointsAndCycleTimeRequest buildStoryPointsAndCycleTimeRequest(JiraBoardSetting jiraBoardSetting,
			String startTime, String endTime) {
		return StoryPointsAndCycleTimeRequest.builder()
			.token(jiraBoardSetting.getToken())
			.type(jiraBoardSetting.getType())
			.site(jiraBoardSetting.getSite())
			.project(jiraBoardSetting.getProjectKey())
			.boardId(jiraBoardSetting.getBoardId())
			.status(jiraBoardSetting.getDoneColumn())
			.startTime(startTime)
			.endTime(endTime)
			.targetFields(jiraBoardSetting.getTargetFields())
			.treatFlagCardAsBlock(jiraBoardSetting.getTreatFlagCardAsBlock())
			.build();
	}

}
