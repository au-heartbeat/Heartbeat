package heartbeat.client.dto.board.jira;

import java.io.Serializable;

import heartbeat.client.dto.board.jira.Assignee;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoneCardFields implements Serializable {

	private Assignee assignee;

}
