package heartbeat.controller.report.dto.request;

import lombok.Getter;

@Getter
public enum MetricEnum {

	VELOCITY("velocity"), CYCLE_TIME("cycle time"), CLASSIFICATION("classification"),
	DEPLOYMENT_FREQUENCY("deployment frequency"), PIPELINE_CHANGE_FAILURE_RATE("pipeline change failure rate"),
	PIPELINE_MEAN_TIME_TO_RECOVERY("pipeline mean time to recovery"), LEAD_TIME_FOR_CHANGES("lead time for changes"),
	REWORK_TIMES("rework times");

	private final String value;

	MetricEnum(String value) {
		this.value = value;
	}

}
