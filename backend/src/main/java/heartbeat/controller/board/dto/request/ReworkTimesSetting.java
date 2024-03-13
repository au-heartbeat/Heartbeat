package heartbeat.controller.board.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ReworkTimesSetting {

	private CardStepsEnum reworkState;

	private List<CardStepsEnum> excludeStates;

}
