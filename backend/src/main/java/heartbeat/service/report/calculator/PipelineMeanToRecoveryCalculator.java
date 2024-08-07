package heartbeat.service.report.calculator;

import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.AvgPipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecoveryOfPipeline;
import heartbeat.controller.report.dto.response.TotalTimeAndRecoveryTimes;
import heartbeat.service.report.WorkDay;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
@Log4j2
public class PipelineMeanToRecoveryCalculator {

	private final WorkDay workDay;

	public PipelineMeanTimeToRecovery calculate(List<DeployTimes> deployTimes, GenerateReportRequest request) {
		if (deployTimes.isEmpty()) {
			return new PipelineMeanTimeToRecovery(
					AvgPipelineMeanTimeToRecovery.builder().timeToRecovery(stripTrailingZeros(BigDecimal.ZERO)).build(),
					Collections.emptyList());
		}
		List<PipelineMeanTimeToRecoveryOfPipeline> pipelineMeanTimeToRecoveryOfPipelines = deployTimes.stream()
			.map(it -> convertToDevMeanTimeToRecoveryOfPipeline(it, request))
			.toList();

		BigDecimal avgDevMeanTimeToRecovery = pipelineMeanTimeToRecoveryOfPipelines.stream()
			.map(PipelineMeanTimeToRecoveryOfPipeline::getTimeToRecovery)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
		AvgPipelineMeanTimeToRecovery avgPipelineMeanTimeToRecoveryObj = AvgPipelineMeanTimeToRecovery.builder()
			.timeToRecovery(stripTrailingZeros(avgDevMeanTimeToRecovery))
			.build();

		return new PipelineMeanTimeToRecovery(avgPipelineMeanTimeToRecoveryObj, pipelineMeanTimeToRecoveryOfPipelines);
	}

	private PipelineMeanTimeToRecoveryOfPipeline convertToDevMeanTimeToRecoveryOfPipeline(DeployTimes deploy,
			GenerateReportRequest request) {
		if (deploy.getFailed().isEmpty()) {
			return new PipelineMeanTimeToRecoveryOfPipeline(deploy.getPipelineName(), deploy.getPipelineStep(),
					BigDecimal.ZERO);
		}
		else {
			TotalTimeAndRecoveryTimes result = getTotalRecoveryTimeAndRecoveryTimes(deploy, request);
			BigDecimal devMeanTimeToRecovery = BigDecimal.ZERO;
			if (result.getRecoveryTimes() != 0) {
				devMeanTimeToRecovery = stripTrailingZeros(new BigDecimal(result.getTotalTimeToRecovery())
					.divide(new BigDecimal(result.getRecoveryTimes()), 8, RoundingMode.HALF_UP));
			}
			return new PipelineMeanTimeToRecoveryOfPipeline(deploy.getPipelineName(), deploy.getPipelineStep(),
					devMeanTimeToRecovery);
		}
	}

	private BigDecimal stripTrailingZeros(BigDecimal timeToRecovery) {
		return timeToRecovery.stripTrailingZeros();
	}

	private TotalTimeAndRecoveryTimes getTotalRecoveryTimeAndRecoveryTimes(DeployTimes deploy,
			GenerateReportRequest request) {
		List<DeployInfo> sortedJobs = new ArrayList<>(deploy.getFailed());
		sortedJobs.addAll(deploy.getPassed());
		sortedJobs.sort(Comparator.comparing(DeployInfo::getPipelineCreateTime));
		sortedJobs = sortedJobs.stream().filter(deployInfo -> !deployInfo.isPipelineCanceled()).toList();

		long totalTimeToRecovery = 0;
		long failedJobFinishedTime = 0;
		int recoveryTimes = 0;

		for (DeployInfo job : sortedJobs) {
			long currentJobFinishTime = Instant.parse(job.getJobFinishTime()).toEpochMilli();
			if ("passed".equals(job.getState()) && failedJobFinishedTime != 0) {
				long timeToRecovery = workDay
					.calculateWorkTimeAndHolidayBetween(failedJobFinishedTime, currentJobFinishTime,
							request.getCalendarType(), request.getTimezoneByZoneId())
					.getWorkTime();
				if (timeToRecovery < 0) {
					log.error(
							"calculate work time error, because the work time is negative, request start time: {}, "
									+ "request end time: {}, failed time: {}, succeed time: {}, pipeline id: {},"
									+ " pipeline name: {}, commit id: {}",
							request.getStartTime(), request.getEndTime(), failedJobFinishedTime, currentJobFinishTime,
							deploy.getPipelineId(), deploy.getPipelineName(), job.getCommitId());
					timeToRecovery = 0;
				}
				totalTimeToRecovery += timeToRecovery;
				failedJobFinishedTime = 0;
				recoveryTimes++;
			}
			if ("failed".equals(job.getState()) && failedJobFinishedTime == 0) {
				failedJobFinishedTime = currentJobFinishTime;
			}
		}
		return new TotalTimeAndRecoveryTimes(totalTimeToRecovery, recoveryTimes);
	}

}
