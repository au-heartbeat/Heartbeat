package heartbeat.handler;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum FIleType {

	ERROR("error"), REPORT("report"), METRICS_DATA_COMPLETED("metrics-data-completed");

	private final String type;

}
