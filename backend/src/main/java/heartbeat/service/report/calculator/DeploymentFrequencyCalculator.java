package heartbeat.service.report.calculator;

import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.DailyDeploymentCount;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequencyOfPipeline;
import heartbeat.service.report.WorkDay;
import heartbeat.util.DecimalUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class DeploymentFrequencyCalculator {

	private final WorkDay workDay;

	public DeploymentFrequency calculate(List<DeployTimes> deployTimes, Long startTime, Long endTime,
			CalendarTypeEnum calendarTypeEnum, ZoneId timezone) {
		long timePeriod = workDay.calculateWorkDaysBetween(startTime, endTime, calendarTypeEnum, timezone);

		List<DeploymentFrequencyOfPipeline> deploymentFrequencyOfPipelines = deployTimes.stream().map((item) -> {
			int passedDeployInfosCount = Optional.ofNullable(item.getPassed())
				.map(it -> (int) it.stream()
					.filter(deployInfo -> deployInfo.getJobName().equals(item.getPipelineStep()))
					.count())
				.orElse(0);
			List<DailyDeploymentCount> dailyDeploymentCounts = mapDeploymentPassedItems(item.getPassed());
			float frequency = passedDeployInfosCount == 0 || timePeriod == 0 ? 0
					: (float) passedDeployInfosCount / timePeriod;
			return DeploymentFrequencyOfPipeline.builder()
				.name(item.getPipelineName())
				.step(item.getPipelineStep())
				.dailyDeploymentCounts(dailyDeploymentCounts)
				.deployTimes(passedDeployInfosCount)
				.deploymentFrequency(Float.parseFloat(DecimalUtil.formatDecimalTwo(frequency)))
				.build();
		}).collect(Collectors.toList());

		float deploymentFrequency = (float) deploymentFrequencyOfPipelines.stream()
			.mapToDouble(DeploymentFrequencyOfPipeline::getDeploymentFrequency)
			.sum();

		int totalDeployTimes = deploymentFrequencyOfPipelines.stream()
			.mapToInt(DeploymentFrequencyOfPipeline::getDeployTimes)
			.sum();

		return DeploymentFrequency.builder()
			.avgDeploymentFrequency(AvgDeploymentFrequency.builder()
				.deploymentFrequency(Float.parseFloat(DecimalUtil.formatDecimalTwo(deploymentFrequency)))
				.build())
			.deploymentFrequencyOfPipelines(deploymentFrequencyOfPipelines)
			.totalDeployTimes(totalDeployTimes)
			.build();
	}

	private List<DailyDeploymentCount> mapDeploymentPassedItems(List<DeployInfo> deployInfos) {
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		List<DailyDeploymentCount> dailyDeploymentCounts = new ArrayList<>();

		if (deployInfos == null || deployInfos.isEmpty()) {
			return Collections.emptyList();
		}

		deployInfos.forEach((item) -> {
			if (item.getJobFinishTime() != null && !item.getJobFinishTime().isEmpty()
					&& !item.getJobFinishTime().equals("NaN")) {
				String localDate = dateTimeFormatter
					.format(Instant.parse(item.getJobFinishTime()).atZone(ZoneId.of("UTC")));
				DailyDeploymentCount existingDateItem = dailyDeploymentCounts.stream()
					.filter((dateCountItem) -> dateCountItem.getDate().equals(localDate))
					.findFirst()
					.orElse(null);
				if (existingDateItem == null) {
					DailyDeploymentCount dateCountItem = new DailyDeploymentCount(localDate, 1);
					dailyDeploymentCounts.add(dateCountItem);
				}
				else {
					existingDateItem.setCount(existingDateItem.getCount() + 1);
				}
			}
		});
		return dailyDeploymentCounts;
	}

}
