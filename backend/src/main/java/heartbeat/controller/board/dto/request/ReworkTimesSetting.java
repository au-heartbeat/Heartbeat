package heartbeat.controller.board.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReworkTimesSetting {

	private String reworkState;

	private List<String> excludeStates;

}
