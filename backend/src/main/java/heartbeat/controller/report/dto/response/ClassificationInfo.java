package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassificationInfo {

	private String name;

	private Double cardCountValue;

	private Double storyPointsValue;

	private int cardCount;

	private double storyPoints;

}
