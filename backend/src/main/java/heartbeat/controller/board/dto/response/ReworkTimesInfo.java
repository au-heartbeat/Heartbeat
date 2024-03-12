package heartbeat.controller.board.dto.response;

import heartbeat.controller.board.dto.request.CardStepsEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReworkTimesInfo {

	private CardStepsEnum state;

	private Integer times;

}
