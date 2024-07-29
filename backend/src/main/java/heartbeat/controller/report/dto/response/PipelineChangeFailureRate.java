package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineChangeFailureRate {

	private AvgPipelineChangeFailureRate avgPipelineChangeFailureRate;

	private List<PipelineChangeFailureRateOfPipeline> pipelineChangeFailureRateOfPipelines;

}
