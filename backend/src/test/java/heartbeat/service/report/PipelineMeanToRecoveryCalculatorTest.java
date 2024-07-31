package heartbeat.service.report;

import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.AvgPipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecoveryOfPipeline;
import heartbeat.service.report.calculator.PipelineMeanToRecoveryCalculator;
import heartbeat.service.report.model.WorkInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PipelineMeanToRecoveryCalculatorTest {

	@InjectMocks
	private PipelineMeanToRecoveryCalculator calculator;

	@Mock
	private WorkDay workday;

	@Test
	void shouldReturnZeroAvgDevMeanTimeToRecoveryWhenDeployTimesIsEmpty() {
		List<DeployTimes> deployTimes = new ArrayList<>();

		GenerateReportRequest request = GenerateReportRequest.builder().build();

		PipelineMeanTimeToRecovery result = calculator.calculate(deployTimes, request);

		assertEquals(BigDecimal.ZERO, result.getAvgPipelineMeanTimeToRecovery().getTimeToRecovery());
		assertTrue(result.getPipelineMeanTimeToRecoveryOfPipelines().isEmpty());
	}

	@Test
	void shouldCalculateDevMeanTimeToRecoveryWhenDeployTimesIsNotEmpty() {
		DeployTimes deploy1 = createDeployTimes("Pipeline 1", "Step 1", 2, 3);

		DeployTimes deploy2 = createDeployTimes("Pipeline 2", "Step 2", 1, 2);

		DeployTimes deploy3 = createDeployTimes("Pipeline 3", "Step 3", 0, 3);

		List<DeployTimes> deployTimesList = new ArrayList<>();
		deployTimesList.add(deploy1);
		deployTimesList.add(deploy2);
		deployTimesList.add(deploy3);

		GenerateReportRequest request = GenerateReportRequest.builder().timezone("Asia/Shanghai").build();

		when(workday.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(), any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		PipelineMeanTimeToRecovery result = calculator.calculate(deployTimesList, request);

		AvgPipelineMeanTimeToRecovery avgPipelineMeanTimeToRecovery = result.getAvgPipelineMeanTimeToRecovery();
		assertEquals(1, avgPipelineMeanTimeToRecovery.getTimeToRecovery().compareTo(BigDecimal.valueOf(100000)));

		List<PipelineMeanTimeToRecoveryOfPipeline> pipelineMeanTimeToRecoveryOfPipelines = result
			.getPipelineMeanTimeToRecoveryOfPipelines();
		assertEquals(3, pipelineMeanTimeToRecoveryOfPipelines.size());

		PipelineMeanTimeToRecoveryOfPipeline deploy1Result = pipelineMeanTimeToRecoveryOfPipelines.get(0);
		assertEquals("Pipeline 1", deploy1Result.getName());
		assertEquals("Step 1", deploy1Result.getStep());
		assertEquals(0, deploy1Result.getTimeToRecovery().compareTo(BigDecimal.valueOf(180000)));

		PipelineMeanTimeToRecoveryOfPipeline deploy2Result = pipelineMeanTimeToRecoveryOfPipelines.get(1);
		assertEquals("Pipeline 2", deploy2Result.getName());
		assertEquals("Step 2", deploy2Result.getStep());
		assertEquals(0, deploy2Result.getTimeToRecovery().compareTo(BigDecimal.valueOf(120000)));

		PipelineMeanTimeToRecoveryOfPipeline deploy3Result = pipelineMeanTimeToRecoveryOfPipelines.get(2);
		assertEquals("Pipeline 3", deploy3Result.getName());
		assertEquals("Step 3", deploy3Result.getStep());
		assertEquals(BigDecimal.ZERO, deploy3Result.getTimeToRecovery());
	}

	@Test
	void shouldCalculateDevMeanTimeToRecoveryWhenDeployTimesIsNotEmptyAndHasCanceledJob() {
		DeployTimes deploy1 = createDeployTimes("Pipeline 1", "Step 1", 2, 3);
		deploy1.getPassed().get(0).setPipelineCanceled(true);

		DeployTimes deploy2 = createDeployTimes("Pipeline 2", "Step 2", 1, 2);
		deploy2.getFailed().get(0).setPipelineCanceled(true);

		DeployTimes deploy3 = createDeployTimes("Pipeline 3", "Step 3", 0, 3);

		List<DeployTimes> deployTimesList = new ArrayList<>();
		deployTimesList.add(deploy1);
		deployTimesList.add(deploy2);
		deployTimesList.add(deploy3);

		GenerateReportRequest request = GenerateReportRequest.builder().timezone("Asia/Shanghai").build();

		when(workday.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(), any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		PipelineMeanTimeToRecovery result = calculator.calculate(deployTimesList, request);

		AvgPipelineMeanTimeToRecovery avgPipelineMeanTimeToRecovery = result.getAvgPipelineMeanTimeToRecovery();
		assertEquals(1, avgPipelineMeanTimeToRecovery.getTimeToRecovery().compareTo(BigDecimal.valueOf(80000)));

		List<PipelineMeanTimeToRecoveryOfPipeline> pipelineMeanTimeToRecoveryOfPipelines = result
			.getPipelineMeanTimeToRecoveryOfPipelines();
		assertEquals(3, pipelineMeanTimeToRecoveryOfPipelines.size());

		PipelineMeanTimeToRecoveryOfPipeline deploy1Result = pipelineMeanTimeToRecoveryOfPipelines.get(0);
		assertEquals("Pipeline 1", deploy1Result.getName());
		assertEquals("Step 1", deploy1Result.getStep());
		assertEquals(0, deploy1Result.getTimeToRecovery().compareTo(BigDecimal.valueOf(240000)));

		PipelineMeanTimeToRecoveryOfPipeline deploy2Result = pipelineMeanTimeToRecoveryOfPipelines.get(1);
		assertEquals("Pipeline 2", deploy2Result.getName());
		assertEquals("Step 2", deploy2Result.getStep());
		assertEquals(BigDecimal.ZERO, deploy2Result.getTimeToRecovery());

		PipelineMeanTimeToRecoveryOfPipeline deploy3Result = pipelineMeanTimeToRecoveryOfPipelines.get(2);
		assertEquals("Pipeline 3", deploy3Result.getName());
		assertEquals("Step 3", deploy3Result.getStep());
		assertEquals(BigDecimal.ZERO, deploy3Result.getTimeToRecovery());
	}

	@Test
	void shouldReturnDevMeanTimeToRecoveryIsZeroWhenWorkdayIsNegative() {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		PrintStream printStream = new PrintStream(outputStream);
		System.setOut(printStream);

		DeployTimes deploy = createDeployTimes("Pipeline 1", "Step 1", 1, 1);
		DeployInfo originPassedDeploy = deploy.getPassed().get(0);
		originPassedDeploy.setJobFinishTime("2022-07-23T04:04:00.000+00:00");
		DeployInfo originFailedDeploy = deploy.getFailed().get(0);
		originFailedDeploy.setJobFinishTime("2022-07-24T04:04:00.000+00:00");
		deploy.getPassed().set(0, originPassedDeploy);
		deploy.getFailed().set(0, originFailedDeploy);

		List<DeployTimes> deployTimesList = new ArrayList<>();
		deployTimesList.add(deploy);

		GenerateReportRequest request = GenerateReportRequest.builder().timezone("Asia/Shanghai").build();

		when(workday.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(), any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		PipelineMeanTimeToRecovery result = calculator.calculate(deployTimesList, request);

		BigDecimal timeToRecovery = result.getAvgPipelineMeanTimeToRecovery().getTimeToRecovery();
		String logs = outputStream.toString();

		assertEquals(BigDecimal.ZERO, timeToRecovery);
		assertTrue(logs.contains("calculate work time error"));

		System.setOut(System.out);
	}

	private DeployTimes createDeployTimes(String pipelineName, String pipelineStep, int failedCount, int passedCount) {
		DeployTimes deployTimes = new DeployTimes();
		deployTimes.setPipelineName(pipelineName);
		deployTimes.setPipelineStep(pipelineStep);

		List<DeployInfo> failed = new ArrayList<>();
		List<DeployInfo> passed = new ArrayList<>();

		Instant baseTimestamp = Instant.parse("2023-06-25T18:28:54.981Z");
		long interval = 60 * 1000L;

		for (int i = 1; i <= failedCount; i++) {
			DeployInfo failedJob = new DeployInfo();
			failedJob.setState("failed");
			failedJob.setPipelineCanceled(false);
			failedJob.setJobFinishTime(DateTimeFormatter.ISO_INSTANT.format(baseTimestamp.minusMillis(i * interval)));
			failedJob
				.setPipelineCreateTime(DateTimeFormatter.ISO_INSTANT.format(baseTimestamp.minusMillis(i * interval)));
			failed.add(failedJob);
		}

		for (int i = 1; i <= passedCount; i++) {
			DeployInfo passedJob = new DeployInfo();
			passedJob.setPipelineCanceled(false);
			passedJob.setState("passed");
			passedJob.setJobFinishTime(DateTimeFormatter.ISO_INSTANT.format(baseTimestamp.plusMillis(i * interval)));
			passedJob
				.setPipelineCreateTime(DateTimeFormatter.ISO_INSTANT.format(baseTimestamp.plusMillis(i * interval)));
			passed.add(passedJob);
		}

		deployTimes.setFailed(failed);
		deployTimes.setPassed(passed);

		return deployTimes;
	}

}
