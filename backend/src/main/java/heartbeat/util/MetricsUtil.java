package heartbeat.util;

import heartbeat.controller.report.dto.request.MetricEnum;

import java.util.List;
import java.util.stream.Stream;

public final class MetricsUtil {

	private MetricsUtil() {
	}

	public static final List<String> KANBAN_METRICS = Stream
		.of(MetricEnum.VELOCITY, MetricEnum.CYCLE_TIME, MetricEnum.CLASSIFICATION)
		.map(MetricEnum::getValue)
		.toList();

	public static final List<String> BUILDKITE_METRICS = Stream
		.of(MetricEnum.CHANGE_FAILURE_RATE, MetricEnum.DEPLOYMENT_FREQUENCY, MetricEnum.MEAN_TIME_TO_RECOVERY)
		.map(MetricEnum::getValue)
		.toList();

	public static final List<String> CODEBASE_METRICS = Stream.of(MetricEnum.LEAD_TIME_FOR_CHANGES)
		.map(MetricEnum::getValue)
		.toList();

}
