package heartbeat.service.report;

import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.controller.board.dto.request.RequestJiraBoardColumnSetting;
import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.report.dto.request.JiraBoardSetting;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class KanbanFixture {

	public static JiraBoardSetting MOCK_JIRA_BOARD_SETTING() {
		return JiraBoardSetting.builder()
			.users(List.of("user1"))
			.token("token")
			.type("jira")
			.site("site")
			.projectKey("ADM")
			.boardId("2")
			.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().value("DONE").name("DONE").build()))
			.targetFields(List.of(TargetField.builder().key("customer").build()))
			.treatFlagCardAsBlock(true)
			.assigneeFilter("assignee")
			.build();
	}

	public static StoryPointsAndCycleTimeRequest MOCK_EXPECT_STORY_POINT_AND_CYCLE_TIME_REQUEST() {
		return StoryPointsAndCycleTimeRequest.builder()
			.token("token")
			.type("jira")
			.site("site")
			.project("ADM")
			.boardId("2")
			.targetFields(List.of(TargetField.builder().key("customer").build()))
			.treatFlagCardAsBlock(true)
			.startTime("startTime")
			.endTime("endTime")
			.build();
	}

	public static CardCollection MOCK_NONE_DONE_CARDS() {
		List<JiraCardDTO> jiraCardDTOS = new ArrayList<>();
		OffsetDateTime time = OffsetDateTime.of(2023, 11, 1, 1, 0, 0, 1, ZoneOffset.ofHours(8));
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
		for (int i = 0; i < 55; i++) {
			time = time.plusMinutes(1);
			jiraCardDTOS.add(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.fields(JiraCardField.builder().created(time.plusDays(1).format(formatter)).build())
					.build())
				.build());
		}

		return CardCollection.builder().cardsNumber(55).jiraCardDTOList(jiraCardDTOS).storyPointSum(100).build();
	}

}
