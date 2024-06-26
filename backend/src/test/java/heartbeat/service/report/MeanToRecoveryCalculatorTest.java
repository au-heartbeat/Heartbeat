package heartbeat.service.report;

import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.AvgDevMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.DevMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.DevMeanTimeToRecoveryOfPipeline;
import heartbeat.service.report.calculator.MeanToRecoveryCalculator;
import heartbeat.service.report.model.WorkInfo;
import org.junit.jupiter.api.Assertions;
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
class MeanToRecoveryCalculatorTest {

	@InjectMocks
	private MeanToRecoveryCalculator calculator;

	@Mock
	private WorkDay workday;

	@Test
	void shouldReturnZeroAvgDevMeanTimeToRecoveryWhenDeployTimesIsEmpty() {
		List<DeployTimes> deployTimes = new ArrayList<>();

		GenerateReportRequest request = GenerateReportRequest.builder().build();

		DevMeanTimeToRecovery result = calculator.calculate(deployTimes, request);

		Assertions.assertEquals(BigDecimal.ZERO, result.getAvgDevMeanTimeToRecovery().getTimeToRecovery());
		Assertions.assertTrue(result.getDevMeanTimeToRecoveryOfPipelines().isEmpty());
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

		when(workday.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any() , any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		DevMeanTimeToRecovery result = calculator.calculate(deployTimesList, request);

		AvgDevMeanTimeToRecovery avgDevMeanTimeToRecovery = result.getAvgDevMeanTimeToRecovery();
		Assertions.assertEquals(0, avgDevMeanTimeToRecovery.getTimeToRecovery().compareTo(BigDecimal.valueOf(100000)));

		List<DevMeanTimeToRecoveryOfPipeline> devMeanTimeToRecoveryOfPipelines = result
			.getDevMeanTimeToRecoveryOfPipelines();
		Assertions.assertEquals(3, devMeanTimeToRecoveryOfPipelines.size());

		DevMeanTimeToRecoveryOfPipeline deploy1Result = devMeanTimeToRecoveryOfPipelines.get(0);
		Assertions.assertEquals("Pipeline 1", deploy1Result.getName());
		Assertions.assertEquals("Step 1", deploy1Result.getStep());
		Assertions.assertEquals(0, deploy1Result.getTimeToRecovery().compareTo(BigDecimal.valueOf(180000)));

		DevMeanTimeToRecoveryOfPipeline deploy2Result = devMeanTimeToRecoveryOfPipelines.get(1);
		Assertions.assertEquals("Pipeline 2", deploy2Result.getName());
		Assertions.assertEquals("Step 2", deploy2Result.getStep());
		Assertions.assertEquals(0, deploy2Result.getTimeToRecovery().compareTo(BigDecimal.valueOf(120000)));

		DevMeanTimeToRecoveryOfPipeline deploy3Result = devMeanTimeToRecoveryOfPipelines.get(2);
		Assertions.assertEquals("Pipeline 3", deploy3Result.getName());
		Assertions.assertEquals("Step 3", deploy3Result.getStep());
		Assertions.assertEquals(BigDecimal.ZERO, deploy3Result.getTimeToRecovery());
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

		when(workday.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any() , any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		DevMeanTimeToRecovery result = calculator.calculate(deployTimesList, request);

		AvgDevMeanTimeToRecovery avgDevMeanTimeToRecovery = result.getAvgDevMeanTimeToRecovery();
		Assertions.assertEquals(0, avgDevMeanTimeToRecovery.getTimeToRecovery().compareTo(BigDecimal.valueOf(80000)));

		List<DevMeanTimeToRecoveryOfPipeline> devMeanTimeToRecoveryOfPipelines = result
			.getDevMeanTimeToRecoveryOfPipelines();
		Assertions.assertEquals(3, devMeanTimeToRecoveryOfPipelines.size());

		DevMeanTimeToRecoveryOfPipeline deploy1Result = devMeanTimeToRecoveryOfPipelines.get(0);
		Assertions.assertEquals("Pipeline 1", deploy1Result.getName());
		Assertions.assertEquals("Step 1", deploy1Result.getStep());
		Assertions.assertEquals(0, deploy1Result.getTimeToRecovery().compareTo(BigDecimal.valueOf(240000)));

		DevMeanTimeToRecoveryOfPipeline deploy2Result = devMeanTimeToRecoveryOfPipelines.get(1);
		Assertions.assertEquals("Pipeline 2", deploy2Result.getName());
		Assertions.assertEquals("Step 2", deploy2Result.getStep());
		Assertions.assertEquals(BigDecimal.ZERO, deploy2Result.getTimeToRecovery());

		DevMeanTimeToRecoveryOfPipeline deploy3Result = devMeanTimeToRecoveryOfPipelines.get(2);
		Assertions.assertEquals("Pipeline 3", deploy3Result.getName());
		Assertions.assertEquals("Step 3", deploy3Result.getStep());
		Assertions.assertEquals(BigDecimal.ZERO, deploy3Result.getTimeToRecovery());
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

		DevMeanTimeToRecovery result = calculator.calculate(deployTimesList, request);

		BigDecimal timeToRecovery = result.getAvgDevMeanTimeToRecovery().getTimeToRecovery();
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
