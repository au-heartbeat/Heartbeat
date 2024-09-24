package heartbeat.service.report.calculator;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.ClassificationInfo;
import heartbeat.service.report.ICardFieldDisplayName;
import heartbeat.service.report.calculator.model.CardCountAndStoryPointsPairInClassification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ClassificationCalculator {

	private static final String NONE_KEY = "None";

	private static final String[] FIELD_NAMES = { "assignee", "summary", "status", "issuetype", "reporter",
			"timetracking", "statusCategoryChangeData", "storyPoints", "fixVersions", "project", "parent", "priority",
			"labels" };

	public List<Classification> calculate(List<TargetField> targetFields, CardCollection cards) {
		List<Classification> classificationFields = new ArrayList<>();
		Map<String, Map<String, CardCountAndStoryPointsPairInClassification>> resultMap = new HashMap<>();
		Map<String, String> nameMap = new HashMap<>();

		targetFields.stream().filter(TargetField::isFlag).forEach(targetField -> {
			Map<String, CardCountAndStoryPointsPairInClassification> innerMap = new HashMap<>();
			innerMap.put(NONE_KEY,
					CardCountAndStoryPointsPairInClassification.builder()
						.cardCount(cards.getCardsNumber())
						.storyPoints(cards.getStoryPointSum())
						.build());
			resultMap.put(targetField.getKey(), innerMap);
			nameMap.put(targetField.getKey(), targetField.getName());
		});

		for (JiraCardDTO jiraCardResponse : cards.getJiraCardDTOList()) {
			JiraCardField jiraCardFields = jiraCardResponse.getBaseInfo().getFields();
			Map<String, Object> tempFields = extractFields(jiraCardFields);

			mapFields(jiraCardFields.getStoryPoints(), tempFields, resultMap);
		}

		resultMap.forEach((fieldName, valueMap) -> {
			List<ClassificationInfo> classificationInfo = new ArrayList<>();

			if (valueMap.get(NONE_KEY).getCardCount() == 0 && valueMap.get(NONE_KEY).getStoryPoints() == 0) {
				valueMap.remove(NONE_KEY);
			}

			valueMap.forEach((displayName, count) -> classificationInfo
				.add(new ClassificationInfo(displayName, (double) count.getCardCount() / cards.getCardsNumber(),
						cards.getStoryPointSum() != 0 ? count.getStoryPoints() / cards.getStoryPointSum() : 0,
						count.getCardCount(), count.getStoryPoints())));

			classificationFields.add(new Classification(nameMap.get(fieldName), cards.getCardsNumber(),
					cards.getStoryPointSum(), classificationInfo));
		});

		return classificationFields;
	}

	private void mapFields(double storyPoints, Map<String, Object> tempFields,
			Map<String, Map<String, CardCountAndStoryPointsPairInClassification>> resultMap) {
		tempFields.forEach((tempFieldsKey, object) -> {
			if (object instanceof JsonArray objectArray) {
				List<JsonObject> objectList = new ArrayList<>();
				objectArray.forEach(element -> {
					if (element.isJsonObject()) {
						JsonObject jsonObject = element.getAsJsonObject();
						objectList.add(jsonObject);
					}
				});
				mapArrayField(storyPoints, resultMap, tempFieldsKey, List.of(objectList));
			}
			else if (object instanceof List) {
				mapArrayField(storyPoints, resultMap, tempFieldsKey, List.of(object));
			}
			else if (object != null) {
				Map<String, CardCountAndStoryPointsPairInClassification> countMap = resultMap.get(tempFieldsKey);
				if (countMap != null) {
					String displayName = pickDisplayNameFromObj(object);
					CardCountAndStoryPointsPairInClassification count = countMap.getOrDefault(displayName,
							CardCountAndStoryPointsPairInClassification.of());
					count.addCardCount();
					count.addStoryPoints(storyPoints);
					countMap.put(displayName, count);
					CardCountAndStoryPointsPairInClassification noneCount = countMap.get(NONE_KEY);
					noneCount.reduceCardCount();
					noneCount.reduceStoryPoints(storyPoints);
					countMap.put(NONE_KEY, noneCount);
				}
			}
		});
	}

	private void mapArrayField(double storyPoints,
			Map<String, Map<String, CardCountAndStoryPointsPairInClassification>> resultMap, String fieldsKey,
			List<Object> objects) {
		Map<String, CardCountAndStoryPointsPairInClassification> countMap = resultMap.get(fieldsKey);
		if (countMap != null) {
			for (Object object : (List) objects.get(0)) {
				String displayName = pickDisplayNameFromObj(object);
				CardCountAndStoryPointsPairInClassification count = countMap.getOrDefault(displayName,
						CardCountAndStoryPointsPairInClassification.of());
				count.addCardCount();
				count.addStoryPoints(storyPoints);
				countMap.put(displayName, count);
			}
			if (((List<?>) objects.get(0)).isEmpty()) {
				countMap.put(NONE_KEY, countMap.get(NONE_KEY));
			}
			else {
				CardCountAndStoryPointsPairInClassification noneCount = countMap.get(NONE_KEY);
				noneCount.reduceCardCount();
				noneCount.reduceStoryPoints(storyPoints);
				countMap.put(NONE_KEY, noneCount);
			}
		}
	}

	public static String pickDisplayNameFromObj(Object object) {
		if (object instanceof ICardFieldDisplayName) {
			return ((ICardFieldDisplayName) object).getDisplayName();
		}

		if (object instanceof JsonObject jsonObject) {
			JsonElement nameValue = jsonObject.get("name");
			if (nameValue != null) {
				return removeQuotes(nameValue.getAsString());
			}
			JsonElement displayNameValue = jsonObject.get("displayName");
			if (displayNameValue != null) {
				return removeQuotes(displayNameValue.getAsString());
			}
			JsonElement valueName = jsonObject.get("value");
			if (valueName != null) {
				return removeQuotes(valueName.getAsString());
			}
			return NONE_KEY;
		}

		if (object instanceof JsonNull) {
			return NONE_KEY;
		}

		if (object instanceof JsonPrimitive) {
			return removeQuotes(((JsonPrimitive) object).getAsString());
		}

		return object.toString();
	}

	private static String removeQuotes(String value) {
		return value.replace("\"", "");
	}

	public Map<String, Object> extractFields(JiraCardField jiraCardFields) {
		Map<String, Object> tempFields = new HashMap<>();
		for (Map.Entry<String, JsonElement> entry : jiraCardFields.getCustomFields().entrySet()) {
			String key = entry.getKey();
			JsonElement jsonElement = entry.getValue();
			tempFields.put(key, jsonElement);
		}

		for (String fieldName : ClassificationCalculator.FIELD_NAMES) {
			switch (fieldName) {
				case "assignee" -> tempFields.put(fieldName, jiraCardFields.getAssignee());
				case "summary" -> tempFields.put(fieldName, jiraCardFields.getSummary());
				case "status" -> tempFields.put(fieldName, jiraCardFields.getStatus());
				case "issuetype" -> tempFields.put(fieldName, jiraCardFields.getIssuetype());
				case "reporter" -> tempFields.put(fieldName, jiraCardFields.getReporter());
				case "statusCategoryChangeData" -> tempFields.put(fieldName, jiraCardFields.getLastStatusChangeDate());
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

}
