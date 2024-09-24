package heartbeat.service.report.calculator;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.ClassificationInfo;
import heartbeat.service.report.ClassificationFixture;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ClassificationCalculatorTest {

	@InjectMocks
	ClassificationCalculator classificationCalculator;

	@Test
	void shouldReturnClassificationFields() {
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("priority").name("Priority").flag(true).build(),
				TargetField.builder().key("timetracking").name("Time tracking").flag(false).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());
		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		assertEquals(1, classifications.size());

		Classification classification = classifications.get(0);
		assertEquals("Priority", classification.getFieldName());
		assertEquals(4, classification.getTotalCardCount());
		assertEquals(3, classification.getStoryPoints());
	}

	@Test
	void shouldReturnClassificationWithMapArrayFields() {
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("priority").name("Priority").flag(false).build(),
				TargetField.builder().key("fixVersions").name("Fix versions").flag(true).build(),
				TargetField.builder().key("customfield_10037").name("Partner").flag(false).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		assertEquals(1, classifications.size());
		assertEquals("Fix versions", classifications.get(0).getFieldName());
		assertEquals(3, classifications.get(0).getStoryPoints());

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(3, classificationList.size());

		assertEquals("sprint1", classificationList.get(0).getName());
		assertEquals(0.5, classificationList.get(0).getCardCountValue());
		assertEquals(2, classificationList.get(0).getCardCount());
		assertEquals(6, classificationList.get(0).getStoryPoints(), 0.0001);
		assertEquals(2, classificationList.get(0).getStoryPointsValue(), 0.0001);

		assertEquals("sprint2", classificationList.get(1).getName());
		assertEquals(0.5, classificationList.get(1).getCardCountValue());
		assertEquals(2, classificationList.get(1).getCardCount());
		assertEquals(6, classificationList.get(1).getStoryPoints(), 0.0001);
		assertEquals(2, classificationList.get(1).getStoryPointsValue(), 0.0001);

		assertEquals("None", classificationList.get(2).getName());
		assertEquals(0.5, classificationList.get(2).getCardCountValue());
		assertEquals(2, classificationList.get(2).getCardCount());
		assertEquals(0, classificationList.get(2).getStoryPoints(), 0.0001);
		assertEquals(0, classificationList.get(2).getStoryPointsValue(), 0.0001);
	}

	@Test
	void shouldReturnClassificationWithJsonArrayMapArrayFieldsWithPickName() {
		JsonArray jsonArray = new JsonArray();
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty("id", 23);
		jsonObject.addProperty("name", "Tool Sprint 6");
		jsonArray.add(jsonObject);
		jsonArray.add("123");
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10020", jsonArray);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(2)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10015").name("Partner").flag(false).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		assertEquals(1, classifications.size());
		assertEquals("Sprint", classifications.get(0).getFieldName());

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(2, classificationList.size());

		assertEquals("None", classificationList.get(0).getName());
		assertEquals(0.5, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
		assertEquals(3, classificationList.get(0).getStoryPoints(), 0.0001);

		assertEquals("Tool Sprint 6", classificationList.get(1).getName());
		assertEquals(0.5, classificationList.get(1).getCardCountValue());
		assertEquals(1, classificationList.get(1).getCardCount());
		assertEquals(0, classificationList.get(1).getStoryPoints(), 0.0001);
	}

	@Test
	void shouldReturnClassificationWithJsonArrayMapArrayFieldsWithPickDisplayName() {
		JsonArray jsonArray = new JsonArray();
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty("id", 23);
		jsonObject.addProperty("displayName", "Shawn");
		jsonArray.add(jsonObject);
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10037", jsonArray);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(2)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10037").name("Partner").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(1, classifications.size());
		assertEquals("Partner", classifications.get(0).getFieldName());
		assertEquals("Shawn", classificationList.get(0).getName());
		assertEquals(0.5, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
		assertEquals("None", classificationList.get(1).getName());
		assertEquals(0.5, classificationList.get(1).getCardCountValue());
		assertEquals(1, classificationList.get(1).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithJsonArrayMapArrayFieldsWithPickValueName() {
		JsonArray jsonArray = new JsonArray();
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty("id", 23);
		jsonObject.addProperty("value", "bug");
		jsonArray.add(jsonObject);
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10019", jsonArray);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(2)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10019").name("Rank").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(1, classifications.size());
		assertEquals("Rank", classifications.get(0).getFieldName());
		assertEquals("bug", classificationList.get(0).getName());
		assertEquals(0.5, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
		assertEquals("None", classificationList.get(1).getName());
		assertEquals(0.5, classificationList.get(1).getCardCountValue());
		assertEquals(1, classificationList.get(1).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithJsonArrayMapArrayFieldsWithNoneKey() {
		JsonArray jsonArray = new JsonArray();
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty("id", 23);
		jsonArray.add(jsonObject);
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10017", jsonArray);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(2)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10017").name("Issue Color").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(1, classifications.size());
		assertEquals("Issue Color", classifications.get(0).getFieldName());
		assertEquals("None", classificationList.get(0).getName());
		assertEquals(1, classificationList.get(0).getCardCountValue());
		assertEquals(2, classificationList.get(0).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithJsonNull() {
		JsonElement jsonNull = JsonNull.INSTANCE;
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10015", jsonNull);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(2)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10015").name("Start date").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(1, classifications.size());
		assertEquals("Start date", classifications.get(0).getFieldName());
		assertEquals("None", classificationList.get(0).getName());
		assertEquals(1, classificationList.get(0).getCardCountValue());
		assertEquals(2, classificationList.get(0).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithJsonPrimitive() {
		JsonPrimitive jsonPrimitive = new JsonPrimitive("test");
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10000", jsonPrimitive);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(2)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10000").name("development").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);
		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();
		assertEquals(1, classifications.size());
		assertEquals("development", classifications.get(0).getFieldName());
		assertEquals("test", classificationList.get(0).getName());
		assertEquals(0.5, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithPickRightDisplayName() {
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("assignee").name("Assignee").flag(true).build(),
				TargetField.builder().key("fixVersions").name("Fix versions").flag(false).build(),
				TargetField.builder().key("sprint").name("Sprint").flag(false).build(),
				TargetField.builder().key("reporter").name("Reporter").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		List<ClassificationInfo> classificationListForReporter = classifications.get(0).getClassificationInfos();
		List<ClassificationInfo> classificationListForAssignee = classifications.get(1).getClassificationInfos();

		assertEquals(2, classifications.size());
		assertEquals("Assignee", classifications.get(1).getFieldName());
		assertEquals("Shawn", classificationListForAssignee.get(0).getName());
		assertEquals(0.25, classificationListForAssignee.get(0).getCardCountValue());
		assertEquals(1, classificationListForAssignee.get(0).getCardCount());
		assertEquals("Tom", classificationListForAssignee.get(1).getName());
		assertEquals(0.25, classificationListForAssignee.get(1).getCardCountValue());
		assertEquals(1, classificationListForAssignee.get(1).getCardCount());
		assertEquals("Reporter", classifications.get(0).getFieldName());
		assertEquals("Jack", classificationListForReporter.get(0).getName());
		assertEquals(0.5, classificationListForReporter.get(0).getCardCountValue());
		assertEquals(2, classificationListForReporter.get(0).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithPickRightName() {
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("project").name("Project").flag(true).build(),
				TargetField.builder().key("issuetype").name("IssueType").flag(true).build(),
				TargetField.builder().key("fixVersions").name("Fix versions").flag(false).build(),
				TargetField.builder().key("parent").name("Card Parent").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		List<ClassificationInfo> classificationListForIssueType = classifications.get(0).getClassificationInfos();
		List<ClassificationInfo> classificationListForCardParent = classifications.get(1).getClassificationInfos();
		List<ClassificationInfo> classificationListForProject = classifications.get(2).getClassificationInfos();

		assertEquals(3, classifications.size());
		assertEquals("IssueType", classifications.get(0).getFieldName());
		assertEquals("Task", classificationListForIssueType.get(0).getName());
		assertEquals(0.5, classificationListForIssueType.get(0).getCardCountValue());
		assertEquals(2, classificationListForIssueType.get(0).getCardCount());
		assertEquals("Card Parent", classifications.get(1).getFieldName());
		assertEquals("test", classificationListForCardParent.get(0).getName());
		assertEquals(0.25, classificationListForCardParent.get(0).getCardCountValue());
		assertEquals(1, classificationListForCardParent.get(0).getCardCount());
		assertEquals("Project", classifications.get(2).getFieldName());
		assertEquals("heartBeat", classificationListForProject.get(0).getName());
		assertEquals(0.5, classificationListForProject.get(0).getCardCountValue());
		assertEquals(2, classificationListForProject.get(0).getCardCount());

	}

	@Test
	void shouldReturnClassificationWithPickRightDisplayValue() {
		List<TargetField> mockTargetFields = List
			.of(TargetField.builder().key("status").name("Status").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		assertEquals(1, classifications.size());
		assertEquals("Status", classifications.get(0).getFieldName());
		assertEquals(4, classifications.get(0).getTotalCardCount());
		assertEquals("Doing", classifications.get(0).getClassificationInfos().get(0).getName());
	}

	@Test
	void shouldReturnClassificationWithString() {
		List<TargetField> mockTargetFields = List
			.of(TargetField.builder().key("labels").name("Labels").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		List<ClassificationInfo> classificationListForLabels = classifications.get(0).getClassificationInfos();

		assertEquals(1, classifications.size());
		assertEquals("Labels", classifications.get(0).getFieldName());
		assertEquals(4, classifications.get(0).getTotalCardCount());
		assertEquals("backend", classifications.get(0).getClassificationInfos().get(0).getName());
		assertEquals(0.5, classificationListForLabels.get(0).getCardCountValue());
		assertEquals(2, classificationListForLabels.get(0).getCardCount());
		assertEquals("frontend", classificationListForLabels.get(2).getName());
		assertEquals(0.5, classificationListForLabels.get(2).getCardCountValue());
		assertEquals(2, classificationListForLabels.get(2).getCardCount());

	}

	@Test
	void shouldReturnNoneClassificationWithNoneTargetFields() {
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("project").name("Project").flag(false).build(),
				TargetField.builder().key("fixVersions").name("Fix versions").flag(false).build(),
				TargetField.builder().key("assignee").name("Assignee").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.GENERAL_CARD_COLLECTION);

		assertEquals(0, classifications.size());
	}

	@Test
	void shouldReturnNoneClassificationWithArrayObjIsNoneAndTargetFieldsIsNone() {
		List<TargetField> mockTargetFields = List
			.of(TargetField.builder().key("assignee").name("Assignee").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.EMPTY_FIELDS_CARD_COLLECTION);

		assertEquals(0, classifications.size());
	}

	@Test
	void shouldReturnNoneClassificationWithoutNoneKEY() {
		List<TargetField> mockTargetFields = List
			.of(TargetField.builder().key("assignee").name("Assignee").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.CARD_COLLECTION_WITHOUT_NONE_KEY);

		assertEquals(1, classifications.size());
		assertEquals("Assignee", classifications.get(0).getFieldName());
		assertEquals(2, classifications.get(0).getTotalCardCount());
	}

	@Test
	void shouldReturnClassificationWithMapArrayFieldSameContent() {
		List<TargetField> mockTargetFields = List
			.of(TargetField.builder().key("fixVersions").name("Fix Versions").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.SAME_CONTENT_CARD_COLLECTION);

		List<ClassificationInfo> classificationListForFixVersions = classifications.get(0).getClassificationInfos();

		assertEquals(1, classifications.size());
		assertEquals("Fix Versions", classifications.get(0).getFieldName());
		assertEquals(4, classifications.get(0).getTotalCardCount());
		assertEquals("sprint1", classificationListForFixVersions.get(0).getName());
		assertEquals(0.5, classificationListForFixVersions.get(0).getCardCountValue());
		assertEquals(2, classificationListForFixVersions.get(0).getCardCount());
		assertEquals("sprint2", classificationListForFixVersions.get(1).getName());
		assertEquals(0.5, classificationListForFixVersions.get(1).getCardCountValue());
		assertEquals(2, classificationListForFixVersions.get(1).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithMapArrayFieldEmptyContent() {
		List<TargetField> mockTargetFields = List
			.of(TargetField.builder().key("fixVersions").name("Fix Versions").flag(true).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				ClassificationFixture.CARD_COLLECTION_WITH_EMPTY_CONTENT);

		List<ClassificationInfo> classificationListForFixVersions = classifications.get(0).getClassificationInfos();

		assertEquals(1, classifications.size());
		assertEquals("Fix Versions", classifications.get(0).getFieldName());
		assertEquals(2, classifications.get(0).getTotalCardCount());
		assertEquals("None", classificationListForFixVersions.get(0).getName());
		assertEquals(1, classificationListForFixVersions.get(0).getCardCountValue());
		assertEquals(2, classificationListForFixVersions.get(0).getCardCount());
	}

	@Test
	void shouldReturnClassificationWithoutNoneKeyWhenCardCountsAndStoryPointAreZero() {
		JsonPrimitive jsonPrimitive = new JsonPrimitive("test");
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10000", jsonPrimitive);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(1)
			.storyPointSum(3)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().storyPoints(3).customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10000").name("development").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		assertEquals(1, classifications.size());
		assertEquals("development", classifications.get(0).getFieldName());

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();

		assertEquals(1, classificationList.size());

		assertEquals("test", classificationList.get(0).getName());
		assertEquals(1, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
		assertEquals(3, classificationList.get(0).getStoryPoints(), 0.0001);
	}

	@Test
	void shouldReturnClassificationWithNoneKeyWhenStoryPointIsNotZero() {
		JsonPrimitive jsonPrimitive = new JsonPrimitive("test");
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10000", jsonPrimitive);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(1)
			.storyPointSum(6)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().storyPoints(3).customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10000").name("development").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		assertEquals(1, classifications.size());
		assertEquals("development", classifications.get(0).getFieldName());

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();

		assertEquals(2, classificationList.size());

		assertEquals("test", classificationList.get(0).getName());
		assertEquals(1, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
		assertEquals(3, classificationList.get(0).getStoryPoints(), 0.0001);
		assertEquals(0.5, classificationList.get(0).getStoryPointsValue(), 0.0001);

		assertEquals("None", classificationList.get(1).getName());
		assertEquals(0, classificationList.get(1).getCardCountValue());
		assertEquals(0, classificationList.get(1).getCardCount());
		assertEquals(3, classificationList.get(1).getStoryPoints(), 0.0001);
		assertEquals(0.5, classificationList.get(0).getStoryPointsValue(), 0.0001);
	}

	@Test
	void shouldReturnClassificationWithNoneKeyWhenStoryPointSumIsZero() {
		JsonPrimitive jsonPrimitive = new JsonPrimitive("test");
		Map<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10000", jsonPrimitive);
		CardCollection cardCollectionWithJsonArray = CardCollection.builder()
			.cardsNumber(1)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder().customFields(customFields).build())
					.build())
				.build()))
			.build();
		List<TargetField> mockTargetFields = List.of(
				TargetField.builder().key("customfield_10000").name("development").flag(true).build(),
				TargetField.builder().key("customfield_10020").name("Sprint").flag(false).build());

		List<Classification> classifications = classificationCalculator.calculate(mockTargetFields,
				cardCollectionWithJsonArray);

		assertEquals(1, classifications.size());
		assertEquals("development", classifications.get(0).getFieldName());

		List<ClassificationInfo> classificationList = classifications.get(0).getClassificationInfos();

		assertEquals(1, classificationList.size());

		assertEquals("test", classificationList.get(0).getName());
		assertEquals(1, classificationList.get(0).getCardCountValue());
		assertEquals(1, classificationList.get(0).getCardCount());
		assertEquals(0, classificationList.get(0).getStoryPoints(), 0.0001);
		assertEquals(0, classificationList.get(0).getStoryPointsValue(), 0.0001);
	}

}
