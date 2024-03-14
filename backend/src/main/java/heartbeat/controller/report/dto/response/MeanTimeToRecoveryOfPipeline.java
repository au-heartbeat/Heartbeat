package heartbeat.controller.report.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeanTimeToRecoveryOfPipeline {

	@JsonProperty("name")
	private String pipelineName;

	private String step;

	private BigDecimal timeToRecovery;

}
