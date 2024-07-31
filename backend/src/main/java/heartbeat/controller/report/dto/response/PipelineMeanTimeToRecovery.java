package heartbeat.controller.report.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PipelineMeanTimeToRecovery {

	private AvgPipelineMeanTimeToRecovery avgPipelineMeanTimeToRecovery;

	private List<PipelineMeanTimeToRecoveryOfPipeline> pipelineMeanTimeToRecoveryOfPipelines;

}
