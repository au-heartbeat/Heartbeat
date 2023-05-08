package heartbeat.service.report;

import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.service.pipeline.buildkite.builder.DeployTimesBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CalculateDeploymentFrequencyTest {

	@InjectMocks
	private CalculateDeploymentFrequency calculateDeploymentFrequency;

	@Mock
	private WorkDay workDay;

	@Test
	public void testCalculateDeploymentFrequency() {
		DeployTimes mockedDeployTimes = DeployTimesBuilder.withDefault()
			.withPassed(List.of(DeployInfo.builder().jobFinishTime("2022-09-08T22:45:33.981Z").state("passed").build(),
					DeployInfo.builder().jobFinishTime("2023-09-08T22:45:33.981Z").state("passed").build()))
			.build();
		DeploymentFrequency expectedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency(0.1))
			.build();

		when(workDay.calculateWorkDaysBetween(anyLong(), anyLong())).thenReturn(10);

		DeploymentFrequency deploymentFrequency = calculateDeploymentFrequency.calculateDeploymentFrequency(
				List.of(mockedDeployTimes), Long.parseLong("0000000000000"), Long.parseLong("1662739199000"));

		assertThat(deploymentFrequency.getAvgDeploymentFrequency())
			.isEqualTo(expectedDeploymentFrequency.getAvgDeploymentFrequency());
	}

	@Test
	public void testCalculateDeploymentFrequencyWhenWorkDayIsZero() {
		DeployTimes mockedDeployTimes = DeployTimesBuilder.withDefault()
			.withPassed(List.of(DeployInfo.builder().jobFinishTime("2022-09-08T22:45:33.981Z").state("passed").build()))
			.build();
		DeploymentFrequency expectedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency(0.0))
			.build();

		when(workDay.calculateWorkDaysBetween(anyLong(), anyLong())).thenReturn(0);

		DeploymentFrequency deploymentFrequency = calculateDeploymentFrequency.calculateDeploymentFrequency(
				List.of(mockedDeployTimes), Long.parseLong("0000000000000"), Long.parseLong("0000000000000"));

		assertThat(deploymentFrequency.getAvgDeploymentFrequency())
			.isEqualTo(expectedDeploymentFrequency.getAvgDeploymentFrequency());
	}

	@Test
	public void testCalculateDeploymentFrequencyWhenPassedDeployInfoIsEmpty() {
		DeployTimes mockedDeployTimes = DeployTimesBuilder.withDefault().withPassed(Collections.emptyList()).build();
		DeploymentFrequency expectedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency(0.0))
			.build();

		when(workDay.calculateWorkDaysBetween(anyLong(), anyLong())).thenReturn(10);

		DeploymentFrequency deploymentFrequency = calculateDeploymentFrequency.calculateDeploymentFrequency(
				List.of(mockedDeployTimes), Long.parseLong("0000000000000"), Long.parseLong("1662739199000"));

		assertThat(deploymentFrequency.getAvgDeploymentFrequency())
			.isEqualTo(expectedDeploymentFrequency.getAvgDeploymentFrequency());
	}

	@Test
	public void testCalculateDeploymentFrequencyWhenHaveTwoDeployInfo() {
		DeployTimes mockedDeployTimes = DeployTimesBuilder.withDefault()
			.withPassed(List.of(DeployInfo.builder().jobFinishTime("2022-09-08T22:45:33.981Z").state("passed").build(),
					DeployInfo.builder().jobFinishTime("2022-09-08T22:45:33.981Z").state("passed").build()))
			.build();
		DeploymentFrequency expectedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency(0.2))
			.build();

		when(workDay.calculateWorkDaysBetween(anyLong(), anyLong())).thenReturn(10);

		DeploymentFrequency deploymentFrequency = calculateDeploymentFrequency.calculateDeploymentFrequency(
				List.of(mockedDeployTimes), Long.parseLong("0000000000000"), Long.parseLong("1662739199000"));

		assertThat(deploymentFrequency.getAvgDeploymentFrequency())
			.isEqualTo(expectedDeploymentFrequency.getAvgDeploymentFrequency());
	}

	@Test
	public void testCalculateDeploymentFrequencyWhenDeployTimesIsEmpty() {
		DeploymentFrequency expectedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency(0.0))
			.build();
		when(workDay.calculateWorkDaysBetween(anyLong(), anyLong())).thenReturn(10);

		DeploymentFrequency deploymentFrequency = calculateDeploymentFrequency.calculateDeploymentFrequency(
				Collections.emptyList(), Long.parseLong("0000000000000"), Long.parseLong("1662739199000"));

		assertThat(deploymentFrequency.getAvgDeploymentFrequency())
			.isEqualTo(expectedDeploymentFrequency.getAvgDeploymentFrequency());
	}

}
