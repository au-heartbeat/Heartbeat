package heartbeat.service.report.calculator.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AverageLeadTime {

	private double avgPrLeadTime;

	private double avgPipelineLeadTime;

}
