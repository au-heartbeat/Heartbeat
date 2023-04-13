package heartbeat.client.dto.board.jira;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Item implements Serializable {

	private String fieldId;

	private To to;

}
