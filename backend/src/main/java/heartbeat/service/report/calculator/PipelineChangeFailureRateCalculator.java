package heartbeat.service.report.calculator;

import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.response.AvgPipelineChangeFailureRate;
import heartbeat.controller.report.dto.response.PipelineChangeFailureRate;
import heartbeat.controller.report.dto.response.PipelineChangeFailureRateOfPipeline;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.DecimalFormat;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RequiredArgsConstructor
@Component
public class PipelineChangeFailureRateCalculator {

	private static final String FORMAT_4_DECIMALS = "0.0000";

	public PipelineChangeFailureRate calculate(List<DeployTimes> deployTimesList) {
		DecimalFormat decimalFormat = new DecimalFormat(FORMAT_4_DECIMALS);
		AtomicInteger totalCountAtomic = new AtomicInteger(0);
		AtomicInteger totalFailureCountAtomic = new AtomicInteger(0);

		List<PipelineChangeFailureRateOfPipeline> pipelineChangeFailureRateOfPipelines = deployTimesList.stream()
			.map(item -> {
				int failedTimesOfPipeline = item.getFailed().size();
				int validPassedTimesOfPipeline = (int) item.getPassed()
					.stream()
					.filter(deployInfo -> item.getPipelineStep().equals(deployInfo.getJobName()))
					.count();
				int totalTimesOfPipeline = failedTimesOfPipeline + validPassedTimesOfPipeline;

				float failureRateOfPipeline = totalTimesOfPipeline == 0 ? 0
						: (float) failedTimesOfPipeline / totalTimesOfPipeline;

				totalCountAtomic.addAndGet(totalTimesOfPipeline);
				totalFailureCountAtomic.addAndGet(failedTimesOfPipeline);

				return PipelineChangeFailureRateOfPipeline.builder()
					.name(item.getPipelineName())
					.step(item.getPipelineStep())
					.failedTimesOfPipeline(failedTimesOfPipeline)
					.totalTimesOfPipeline(totalTimesOfPipeline)
					.failureRate(Float.parseFloat(decimalFormat.format(failureRateOfPipeline)))
					.build();
			})
			.toList();

		int totalCount = totalCountAtomic.get();
		int totalFailureCount = totalFailureCountAtomic.get();

		float avgFailureRate = totalCount == 0 ? 0 : (float) totalFailureCount / totalCount;
		AvgPipelineChangeFailureRate avgPipelineChangeFailureRate = AvgPipelineChangeFailureRate.builder()
			.totalTimes(totalCount)
			.totalFailedTimes(totalFailureCount)
			.failureRate(Float.parseFloat(decimalFormat.format(avgFailureRate)))
			.build();

		return PipelineChangeFailureRate.builder()
			.avgPipelineChangeFailureRate(avgPipelineChangeFailureRate)
			.pipelineChangeFailureRateOfPipelines(pipelineChangeFailureRateOfPipelines)
			.build();
	}

}
