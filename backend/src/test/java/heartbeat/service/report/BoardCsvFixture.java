package heartbeat.service.report;

import com.google.gson.JsonElement;
import heartbeat.client.dto.board.jira.Assignee;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Sprint;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.controller.board.dto.request.CardStepsEnum;
import heartbeat.controller.board.dto.response.CardCycleTime;
import heartbeat.controller.board.dto.response.CardParent;
import heartbeat.controller.board.dto.response.Fields;
import heartbeat.controller.board.dto.response.IssueType;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraProject;
import heartbeat.controller.board.dto.response.Priority;
import heartbeat.controller.board.dto.response.Reporter;
import heartbeat.controller.board.dto.response.ReworkTimesInfo;
import heartbeat.controller.board.dto.response.StepsDay;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.util.JsonFileReader;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public class BoardCsvFixture {

	private static final BoardCSVConfig ISSUE_KEY_CONFIG = BoardCSVConfig.builder()
		.label("Issue key")
		.value("baseInfo.key")
		.originKey(null)
		.build();

	private static final BoardCSVConfig TO_DO_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Todo Days")
		.value("cardCycleTime.steps.todo")
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

	private static final BoardCSVConfig STATUS_DATE_CONFIG = BoardCSVConfig.builder()
		.label("Status Date")
		.value("baseInfo.fields.statuscategorychangedate")
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

	private static final BoardCSVConfig STORY_POINT_ESTIMATE_CONFIG = BoardCSVConfig.builder()
		.label("Story point estimate")
		.value("baseInfo.fields.customFields.customfield_1008")
		.originKey("customfield_1008")
		.build();

	private static final BoardCSVConfig CUSTOM_FIELD_1010_CONFIG = BoardCSVConfig.builder()
		.label("1010")
		.value("baseInfo.fields.customFields.customfield_1010")
		.originKey("customfield_1010")
		.build();

	private static final BoardCSVConfig CUSTOM_FIELD_1011_CONFIG = BoardCSVConfig.builder()
		.label("1011")
		.value("baseInfo.fields.customFields.customfield_1011")
		.originKey("customfield_1011")
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_BLOCKED_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: BLOCKED")
		.value("cycleTimeFlat.BLOCKED")
		.originKey(null)
		.build();

	private static final BoardCSVConfig FLAGGED = BoardCSVConfig.builder()
		.label("Flagged")
		.value("baseInfo.fields.customFields.customfield_1001")
		.originKey("customfield_1001")
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

	private static final BoardCSVConfig WAITING_FOR_TESTING_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Waiting For Testing Days")
		.value("cardCycleTime.steps.waitingForTesting")
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

	private static final BoardCSVConfig DESIGN_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Design Days")
		.value("cardCycleTime.steps.design")
		.originKey(null)
		.build();

	private static final BoardCSVConfig WAITING_FOR_DEPLOYMENT_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Waiting For Deployment Days")
		.value("cardCycleTime.steps.waitingForDeployment")
		.originKey(null)
		.build();

	private static final BoardCSVConfig REVIEW_DAYS_CONFIG = BoardCSVConfig.builder()
		.label("Review Days")
		.value("cardCycleTime.steps.review")
		.originKey(null)
		.build();

	private static final BoardCSVConfig ORIGIN_CYCLE_TIME_DOING_CONFIG = BoardCSVConfig.builder()
		.label("OriginCycleTime: DOING")
		.value("cycleTimeFlat.DOING")
		.originKey(null)
		.build();

	public static HashMap<String, JsonElement> CUSTOM_FIELDS = JsonFileReader
		.readJsonFile("./src/test/resources/fields.json");

	public static List<BoardCSVConfig> MOCK_EXTRA_FIELDS() {
		return List.of(STORY_POINT_ESTIMATE_CONFIG, FLAGGED, CUSTOM_FIELD_1010_CONFIG, CUSTOM_FIELD_1011_CONFIG);
	}

	public static List<BoardCSVConfig> MOCK_ALL_FIELDS() {
		return List.of(ISSUE_KEY_CONFIG, SUMMARY_CONFIG, ISSUE_TYPE_CONFIG, STATUS_CONFIG, STATUS_DATE_CONFIG,
				STORY_POINTS_CONFIG, ASSIGNEE_CONFIG, REPORTER_CONFIG, PROJECT_KEY_CONFIG, PROJECT_NAME_CONFIG,
				PRIORITY_CONFIG, PARENT_SUMMARY_CONFIG, SPRINT_CONFIG, LABELS_CONFIG, CYCLE_TIME_CONFIG,
				CYCLE_TIME_STORY_POINTS_CONFIG, TO_DO_DAYS_CONFIG, ANALYSIS_DAYS_CONFIG, DESIGN_DAYS_CONFIG,
				IN_DEV_DAYS_CONFIG, WAITING_FOR_TESTING_DAYS_CONFIG, TESTING_DAYS_CONFIG, BLOCK_DAYS_CONFIG,
				REVIEW_DAYS_CONFIG, WAITING_FOR_DEPLOYMENT_DAYS_CONFIG, ORIGIN_CYCLE_TIME_DOING_CONFIG,
				ORIGIN_CYCLE_BLOCKED_CONFIG);
	}

	public static List<JiraCardDTO> MOCK_JIRA_CARD_DTO() {
		JiraCardField jiraCardField = MOCK_JIRA_CARD();

		HashMap<String, Double> cycleTimeFlat = new HashMap<>();
		cycleTimeFlat.put("DOING", 9.8067E-5);
		cycleTimeFlat.put("BLOCKED", null);

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
		JiraCardDTO jiraCardDTOWithoutBaseInfo = JiraCardDTO.builder().build();
		JiraCardDTO jiraCardDTOWithoutFields = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().key("ADM-489").build())
			.build();
		return List.of(jiraCardDTO, jiraCardDTOWithoutBaseInfo, jiraCardDTOWithoutFields);
	}

	public static JiraCardField MOCK_JIRA_CARD() {
		return JiraCardField.builder()
			.summary("summary")
			.issuetype(IssueType.builder().name("issue type").build())
			.status(Status.builder().displayValue("done").build())
			.lastStatusChangeDate(1701151323000L)
			.storyPoints(2)
			.assignee(Assignee.builder().displayName("name").build())
			.reporter(Reporter.builder().displayName("name").build())
			.project(JiraProject.builder().id("10001").key("ADM").name("Auto Dora Metrics").build())
			.priority(Priority.builder().name("Medium").build())
			.parent(CardParent.builder().fields(Fields.builder().summary("parent").build()).build())
			.sprint(Sprint.builder().name("sprint 1").build())
			.labels(Collections.emptyList())
			.customFields(CUSTOM_FIELDS)
			.build();
	}

	public static List<ReworkTimesInfo> MOCK_REWORK_TIMES_INFO_LIST() {
		return List.of(ReworkTimesInfo.builder().state(CardStepsEnum.BLOCK).times(2).build(),
				ReworkTimesInfo.builder().state(CardStepsEnum.REVIEW).times(0).build(),
				ReworkTimesInfo.builder().state(CardStepsEnum.WAITING_FOR_TESTING).times(1).build(),
				ReworkTimesInfo.builder().state(CardStepsEnum.TESTING).times(0).build(),
				ReworkTimesInfo.builder().state(CardStepsEnum.DONE).times(0).build());
	}

}
