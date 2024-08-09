package heartbeat.controller.board.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StepsDay {

	private double analyse;

	private double development;

	private double waitingForTesting;

	private double testing;

	private double blocked;

	private double review;

	private double todo;

	private double design;

	private double waitingForDeployment;

}
