package heartbeat.service.report;

import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonPrimitive;
import heartbeat.client.dto.board.jira.Assignee;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Sprint;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.controller.board.dto.response.CardCycleTime;
import heartbeat.controller.board.dto.response.CardParent;
import heartbeat.controller.board.dto.response.Fields;
import heartbeat.controller.board.dto.response.IssueType;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraProject;
import heartbeat.controller.board.dto.response.Priority;
import heartbeat.controller.board.dto.response.Reporter;
import heartbeat.controller.board.dto.response.StepsDay;
import heartbeat.controller.report.dto.response.BoardCSVConfig;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public class BoardCsvFixture {

	private static final BoardCSVConfig ISSUE_KEY_CONFIG = BoardCSVConfig.builder()
		.label("Issue key")
		.value("baseInfo.key")
		.originKey(null)
		.build();

	private static final BoardCSVConfig SUMMARY_CONFIG = BoardCSVConfig.builder()
		.label("Summary")
		.value("baseInfo.fields.summary")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ISSUE_TYPE_CONFIG = BoardCSVConfig.builder()
		.label("Issue Type")
		.value("baseInfo.fields.issuetype.name")
		.originKey(null)
		.build();

	private static final BoardCSVConfig STATUS_CONFIG = BoardCSVConfig.builder()
		.label("Status")
		.value("baseInfo.fields.status.name")
		.originKey(null)
		.build();

	private static final BoardCSVConfig STORY_POINTS_CONFIG = BoardCSVConfig.builder()
		.label("Story Points")
		.value("baseInfo.fields.storyPoints")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ASSIGNEE_CONFIG = BoardCSVConfig.builder()
		.label("assignee")
		.value("baseInfo.fields.assignee.displayName")
		.originKey(null)
		.build();

	private static final BoardCSVConfig REPORTER_CONFIG = BoardCSVConfig.builder()
		.label("Reporter")
		.value("baseInfo.fields.reporter.displayName")
		.originKey(null)
		.build();

	private static final BoardCSVConfig PROJECT_KEY_CONFIG = BoardCSVConfig.builder()
		.label("Project Key")
		.value("baseInfo.fields.project.key")
		.originKey(null)
		.build();

	private static final BoardCSVConfig PROJECT_NAME_CONFIG = BoardCSVConfig.builder()
		.label("Project Name")
		.value("baseInfo.fields.project.name")
		.originKey(null)
		.build();

	private static final BoardCSVConfig PRIORITY_CONFIG = BoardCSVConfig.builder()
		.label("Priority")
		.value("baseInfo.fields.priority.name")
		.originKey(null)
		.build();

	private static final BoardCSVConfig PARENT_SUMMARY_CONFIG = BoardCSVConfig.builder()
		.label("Parent Summary")
		.value("baseInfo.fields.parent.fields.summary")
		.originKey(null)
		.build();

	private static final BoardCSVConfig SPRINT_CONFIG = BoardCSVConfig.builder()
		.label("Sprint")
		.value("baseInfo.fields.sprint.name")
		.originKey(null)
		.build();

	private static final BoardCSVConfig LABELS_CONFIG = BoardCSVConfig.builder()
		.label("Labels")
		.value("baseInfo.fields.label")
		.originKey(null)
		.build();

	private static final BoardCSVConfig CYCLE_TIME_CONFIG = BoardCSVConfig.builder()
		.label("Cycle Time")
		.value("cardCycleTime.total")
		.originKey(null)
		.build();

	private static final BoardCSVConfig FLAGGED_CONFIG = BoardCSVConfig.builder()
		.label("Flagged")
		.value("baseInfo.fields.customFields.customfield_10021")
		.originKey("customfield_10021")
		.build();

	private static final BoardCSVConfig FIX_VERSIONS_CONFIG = BoardCSVConfig.builder()
		.label("修复版本")
		.value("baseInfo.fields.customFields.fixVersions")
		.originKey("fixVersions")
		.build();

	private static final BoardCSVConfig DEVELOPMENT_CONFIG = BoardCSVConfig.builder()
		.label("Development")
		.value("baseInfo.fields.customFields.customfield_10000")
		.originKey("customfield_10000")
		.build();

	private static final BoardCSVConfig PARTNER_CONFIG = BoardCSVConfig.builder()
		.label("Partner")
		.value("baseInfo.fields.customFields.customfield_10037")
		.originKey("customfield_10037")
		.build();

	private static final BoardCSVConfig EXTRA_LABELS_CONFIG = BoardCSVConfig.builder()
		.label("标签")
		.value("baseInfo.fields.customFields.labels")
		.originKey("labels")
		.build();

	private static final BoardCSVConfig TIME_TRACKING_CONFIG = BoardCSVConfig.builder()
		.label("时间跟踪")
		.value("baseInfo.fields.customFields.timetracking")
		.originKey("timetracking")
		.build();

	private static final BoardCSVConfig START_DATE_CONFIG = BoardCSVConfig.builder()
		.label("Start date")
		.value("baseInfo.fields.customFields.customfield_10015")
		.originKey("customfield_10015")
		.build();

	private static final BoardCSVConfig STORY_POINT_ESTIMATE_CONFIG = BoardCSVConfig.builder()
		.label("Story point estimate")
		.value("baseInfo.fields.customFields.customfield_10016")
		.originKey("customfield_10016")
		.build();

	private static final BoardCSVConfig QA_CONFIG = BoardCSVConfig.builder()
		.label("QA")
		.value("baseInfo.fields.customFields.customfield_10038")
		.originKey("customfield_10038")
		.build();

	private static final BoardCSVConfig RANK_CONFIG = BoardCSVConfig.builder()
		.label("Rank")
		.value("baseInfo.fields.customFields.customfield_10019")
		.originKey("customfield_10019")
		.build();

	private static final BoardCSVConfig ISSUE_COLOR_CONFIG = BoardCSVConfig.builder()
		.label("Issue color")
		.value("baseInfo.fields.customFields.customfield_10017")
		.originKey("customfield_10017")
		.build();

	private static final BoardCSVConfig FEATURE_OPERATION_CONFIG = BoardCSVConfig.builder()
		.label("Feature/Operation")
		.value("baseInfo.fields.customFields.customfield_10027")
		.originKey("customfield_10027")
		.build();

	private static final BoardCSVConfig CYCLE_TIME_STORY_POINTS_CONFIG = BoardCSVConfig.builder()
		.label("Cycle Time / Story Points")
		.value("totalCycleTimeDivideStoryPoints")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ANALYSIS_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Analysis Days")
		.value("cardCycleTime.steps.analyse")
		.originKey(null)
		.build();

	private static final BoardCSVConfig IN_DEV_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("In Dev Days")
		.value("cardCycleTime.steps.development")
		.originKey(null)
		.build();

	private static final BoardCSVConfig WAITING_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Waiting Days")
		.value("cardCycleTime.steps.waiting")
		.originKey(null)
		.build();

	private static final BoardCSVConfig TESTING_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Testing Days")
		.value("cardCycleTime.steps.testing")
		.originKey(null)
		.build();

	private static final BoardCSVConfig BLOCK_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Block Days")
		.value("cardCycleTime.steps.blocked")
		.originKey(null)
		.build();

	private static final BoardCSVConfig REVIEW_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Review Days")
		.value("cardCycleTime.steps.review")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_TODO_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: TODO")
		.value("cycleTimeFlat.TODO")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_TESTING_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: TESTING")
		.value("cycleTimeFlat.TESTING")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_DONE_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: DONE")
		.value("cycleTimeFlat.DONE")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_DOING_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: DOING")
		.value("cycleTimeFlat.DOING")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_BLOCKED_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: BLOCKED")
		.value("cycleTimeFlat.BLOCKED")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_REVIEW_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: REVIEW")
		.value("cycleTimeFlat.REVIEW")
		.originKey(null)
		.build();

	public static List<BoardCSVConfig> MOCK_FIXED_FIELDS() {
		return List.of(ISSUE_KEY_CONFIG, SUMMARY_CONFIG, ISSUE_TYPE_CONFIG, STATUS_CONFIG, STORY_POINTS_CONFIG,
				ASSIGNEE_CONFIG, REPORTER_CONFIG, PROJECT_KEY_CONFIG, PROJECT_NAME_CONFIG, PRIORITY_CONFIG,
				PARENT_SUMMARY_CONFIG, SPRINT_CONFIG, LABELS_CONFIG, CYCLE_TIME_CONFIG, CYCLE_TIME_STORY_POINTS_CONFIG,
				ANALYSIS_DAYS_CONFIG, IN_DEV_DAYS_CONFIG, WAITING_DAYS_CONFIG, TESTING_DAYS_CONFIG, BLOCK_DAYS_CONFIG,
				REVIEW_DAYS_CONFIG, ORIGIN_CYCLE_TIME_DOING_CONFIG);
	}

	// public static List<BoardCSVConfig> MOCK_ALL_FIELDS() {
	// return List.of(ISSUE_KEY_CONFIG, SUMMARY_CONFIG, ISSUE_TYPE_CONFIG, STATUS_CONFIG,
	// STORY_POINTS_CONFIG,
	// ASSIGNEE_CONFIG, REPORTER_CONFIG, PROJECT_KEY_CONFIG, PROJECT_NAME_CONFIG,
	// PRIORITY_CONFIG,
	// PARENT_SUMMARY_CONFIG, SPRINT_CONFIG, LABELS_CONFIG, CYCLE_TIME_CONFIG,
	// FLAGGED_CONFIG,
	// FIX_VERSIONS_CONFIG, DEVELOPMENT_CONFIG, DEVELOPMENT_CONFIG, PARTNER_CONFIG,
	// EXTRA_LABELS_CONFIG,
	// TIME_TRACKING_CONFIG, START_DATE_CONFIG, STORY_POINT_ESTIMATE_CONFIG, QA_CONFIG,
	// RANK_CONFIG,
	// ISSUE_COLOR_CONFIG, FEATURE_OPERATION_CONFIG, CYCLE_TIME_STORY_POINTS_CONFIG,
	// ANALYSIS_DAYS_CONFIG,
	// IN_DEV_DAYS_CONFIG, WAITING_DAYS_CONFIG, TESTING_DAYS_CONFIG, BLOCK_DAYS_CONFIG,
	// REVIEW_DAYS_CONFIG,
	// ORIGIN_CYCLE_TIME_BLOCKED_CONFIG);
	// }

	public static List<BoardCSVConfig> MOCK_EXTRA_FIELDS() {
		return List.of(STORY_POINT_ESTIMATE_CONFIG);
	}

	public static List<BoardCSVConfig> MOCK_ALL_FIELDS() {
		List<BoardCSVConfig> allFields = new ArrayList<>(MOCK_FIXED_FIELDS());
		allFields.addAll(MOCK_EXTRA_FIELDS());
		return allFields;
	}

	public static List<JiraCardDTO> MOCK_JIRA_CARD_DTO() {
		HashMap<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10016", new JsonPrimitive(1.0));
		customFields.put("customfield_10021", new JsonPrimitive("null"));

		JiraCardField jiraCardField = JiraCardField.builder()
			.summary("summary")
			.issuetype(IssueType.builder().name("任务").build())
			.status(Status.builder().name("已完成").build())
			.storyPoints(2)
			.assignee(Assignee.builder().displayName("name").build())
			.reporter(Reporter.builder().displayName("name").build())
			.project(JiraProject.builder().id("10001").key("ADM").name("Auto Dora Metrics").build())
			.priority(Priority.builder().name("Medium").build())
			.parent(CardParent.builder().fields(Fields.builder().summary("parent").build()).build())
			.sprint(Sprint.builder().name("sprint 1").build())
			.labels(Collections.emptyList())
			.customFields(customFields)
			.build();

		HashMap<String, Double> cycleTimeFlat = new HashMap<>();
		cycleTimeFlat.put("DOING", 9.8067E-5);

		CardCycleTime cardCycleTime = CardCycleTime.builder()
			.name("ADM-489")
			.total(0.90)
			.steps(StepsDay.builder().development(0.90).build())
			.build();
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().key("ADM-489").fields(jiraCardField).build())
			.cardCycleTime(cardCycleTime)
			.cycleTimeFlat(cycleTimeFlat)
			.totalCycleTimeDivideStoryPoints("0.90")
			.build();
		return List.of(jiraCardDTO);
	}

	public static List<JiraCardDTO> MOCK_JIRA_CARD_DTO_WITH_EMPTY_BASE_INFO() {
		HashMap<String, JsonElement> customFields = new HashMap<>();
		customFields.put("customfield_10016", new JsonPrimitive(1.0));
		customFields.put("customfield_10021", JsonNull.INSTANCE);

		HashMap<String, Double> cycleTimeFlat = new HashMap<>();
		cycleTimeFlat.put("DONE", 16.0335);

		CardCycleTime cardCycleTime = CardCycleTime.builder()
			.name("ADM-489")
			.total(0.90)
			.steps(StepsDay.builder().development(0.90).build())
			.build();
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.cardCycleTime(cardCycleTime)
			.cycleTimeFlat(cycleTimeFlat)
			.totalCycleTimeDivideStoryPoints("0.90")
			.build();
		return List.of(jiraCardDTO);
	}

}
