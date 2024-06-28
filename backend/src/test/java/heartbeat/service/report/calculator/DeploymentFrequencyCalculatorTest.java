package heartbeat.service.report.calculator;

import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.DailyDeploymentCount;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequencyOfPipeline;
import heartbeat.service.report.WorkDay;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeploymentFrequencyCalculatorTest {

	@Mock
	private WorkDay workDay;

	@InjectMocks
	private DeploymentFrequencyCalculator deploymentFrequencyCalculator;

	@Test
	void shouldCalculateSuccess() {
		List<DeployTimes> deployTimes = List.of(DeployTimes.builder()
			.pipelineId("deploy 1")
			.pipelineName("deploy name 1")
			.pipelineStep("deploy step 1")
			.passed(List.of(
					DeployInfo.builder().jobName("deploy step 1").jobFinishTime("2024-06-27T05:51:03.253Z").build(),
					DeployInfo.builder().jobName("deploy step 2").jobFinishTime("2024-06-27T05:51:03.253Z").build(),
					DeployInfo.builder().jobName("deploy step 2").jobFinishTime("2024-06-24T05:51:03.253Z").build(),
					DeployInfo.builder().jobName("deploy step 2").jobFinishTime("NaN").build(),
					DeployInfo.builder().jobName("deploy step 2").jobFinishTime("").build(),
					DeployInfo.builder().jobName("deploy step 2").build()))
			.build(),
				DeployTimes.builder()
					.pipelineId("deploy 2")
					.pipelineName("deploy name 2")
					.pipelineStep("deploy step 2")
					.passed(List.of())
					.build(),
				DeployTimes.builder()
					.pipelineId("deploy 3")
					.pipelineName("deploy name 3")
					.pipelineStep("deploy step 3")
					.build());
		long startTime = 1L;
		long endTime = 2L;
		ZoneId zoneId = ZoneId.of("Asia/Shanghai");

		when(workDay.calculateWorkDaysBetween(eq(startTime), eq(endTime), any(), eq(zoneId))).thenReturn(10L);

		DeploymentFrequency deploymentFrequency = deploymentFrequencyCalculator.calculate(deployTimes, startTime,
				endTime, CalendarTypeEnum.REGULAR, zoneId);
		assertEquals(1, deploymentFrequency.getTotalDeployTimes());

		AvgDeploymentFrequency avgDeploymentFrequency = deploymentFrequency.getAvgDeploymentFrequency();
		assertEquals(0.1, avgDeploymentFrequency.getDeploymentFrequency(), 0.001f);

		List<DeploymentFrequencyOfPipeline> deploymentFrequencyOfPipelines = deploymentFrequency
			.getDeploymentFrequencyOfPipelines();
		assertEquals(3, deploymentFrequencyOfPipelines.size());

		assertEquals("deploy name 1", deploymentFrequencyOfPipelines.get(0).getName());
		assertEquals("deploy step 1", deploymentFrequencyOfPipelines.get(0).getStep());
		assertEquals(0.1, deploymentFrequencyOfPipelines.get(0).getDeploymentFrequency(), 0.001f);
		assertEquals(1, deploymentFrequencyOfPipelines.get(0).getDeployTimes());
		List<DailyDeploymentCount> firstDailyDeploymentCounts = deploymentFrequencyOfPipelines.get(0)
			.getDailyDeploymentCounts();
		assertEquals(2, firstDailyDeploymentCounts.size());
		assertEquals("06/27/2024", firstDailyDeploymentCounts.get(0).getDate());
		assertEquals(2, firstDailyDeploymentCounts.get(0).getCount());
		assertEquals("06/24/2024", firstDailyDeploymentCounts.get(1).getDate());
		assertEquals(1, firstDailyDeploymentCounts.get(1).getCount());

		assertEquals("deploy name 2", deploymentFrequencyOfPipelines.get(1).getName());
		assertEquals("deploy step 2", deploymentFrequencyOfPipelines.get(1).getStep());
		assertEquals(0.0, deploymentFrequencyOfPipelines.get(1).getDeploymentFrequency(), 0.001f);
		assertEquals(0, deploymentFrequencyOfPipelines.get(1).getDeployTimes());
		assertEquals(0, deploymentFrequencyOfPipelines.get(1).getDailyDeploymentCounts().size());

		assertEquals("deploy name 3", deploymentFrequencyOfPipelines.get(2).getName());
		assertEquals("deploy step 3", deploymentFrequencyOfPipelines.get(2).getStep());
		assertEquals(0.0, deploymentFrequencyOfPipelines.get(2).getDeploymentFrequency(), 0.001f);
		assertEquals(0, deploymentFrequencyOfPipelines.get(2).getDeployTimes());
		assertEquals(0, deploymentFrequencyOfPipelines.get(2).getDailyDeploymentCounts().size());
	}

}
