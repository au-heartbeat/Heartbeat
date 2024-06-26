package heartbeat.service.board.jira;

import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.controller.board.dto.request.RequestJiraBoardColumnSetting;
import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import lombok.Builder;
import lombok.Data;

import java.net.URI;
import java.time.ZoneId;
import java.util.List;

@Data
@Builder
public class GetMatchedNonDoneCardsParams {

	private StoryPointsAndCycleTimeRequest request;

	private List<RequestJiraBoardColumnSetting> boardColumns;

	private List<String> users;

	private URI baseUrl;

	private List<JiraCard> allNonDoneCards;

	private List<TargetField> targetFields;

	private CalendarTypeEnum calendarTypeEnum;

	private ZoneId timezone;

}
