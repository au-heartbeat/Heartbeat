package heartbeat.service.board.jira;

import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.controller.board.dto.request.RequestJiraBoardColumnSetting;
import heartbeat.controller.board.dto.response.TargetField;
import lombok.Builder;
import lombok.Data;

import java.net.URI;
import java.util.List;

@Data
@Builder
public class JiraBoardInfo {

	private List<RequestJiraBoardColumnSetting> boardColumns;

	private List<String> users;

	private URI baseUrl;

	private List<JiraCard> allDoneCards;

	private List<TargetField> targetFields;

}
