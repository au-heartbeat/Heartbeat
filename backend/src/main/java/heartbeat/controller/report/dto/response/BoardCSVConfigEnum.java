package heartbeat.controller.report.dto.response;

public enum BoardCSVConfigEnum {

	ISSUE_KEY("Issue key", "baseInfo.key"), SUMMARY("Summary", "baseInfo.fields.summary"),
	ISSUE_TYPE("Issue Type", "baseInfo.fields.issuetype.name"), STATUS("Status", "baseInfo.fields.status.name"),
	STATUS_DATE("Status Date", "baseInfo.fields.lastStatusChangeDate"),
	STORY_POINTS("Story Points", "baseInfo.fields.storyPoints"),
	ASSIGNEE("assignee", "baseInfo.fields.assignee.displayName"),
	REPORTER("Reporter", "baseInfo.fields.reporter.displayName"),
	PROJECT_KEY("Project Key", "baseInfo.fields.project.key"),
	PROJECT_NAME("Project Name", "baseInfo.fields.project.name"), PRIORITY("Priority", "baseInfo.fields.priority.name"),
	PARENT_SUMMARY("Parent Summary", "baseInfo.fields.parent.fields.summary"),
	SPRINT("Sprint", "baseInfo.fields.sprint.name"), LABELS("Labels", "baseInfo.fields.label"),
	CYCLE_TIME("Cycle Time", "cardCycleTime.total"),
	CYCLE_TIME_STORY_POINTS("Cycle Time / Story Points", "totalCycleTimeDivideStoryPoints"),
	TODO_DAYS("Todo Days", "cardCycleTime.steps.todo"), ANALYSIS_DAYS("Analysis Days", "cardCycleTime.steps.analyse"),
	DESIGN_DAYS("Design Days", "cardCycleTime.steps.design"),
	IN_DEV_DAYS("In Dev Days", "cardCycleTime.steps.development"),
	BLOCK_DAYS("Block Days", "cardCycleTime.steps.blocked"), REVIEW_DAYS("Review Days", "cardCycleTime.steps.review"),
	WAITING_FOR_TESTING_DAYS("Waiting For Testing Days", "cardCycleTime.steps.waitingForTesting"),
	TESTING_DAYS("Testing Days", "cardCycleTime.steps.testing"),
	WAITING_FOR_DEPLOYMENT_DAYS("Waiting For Deployment Days", "cardCycleTime.steps.waitingForDeployment");

	private final String label;

	private final String value;

	BoardCSVConfigEnum(String label, String value) {
		this.label = label;
		this.value = value;
	}

	public String getLabel() {
		return label;
	}

	public String getValue() {
		return value;
	}

}
