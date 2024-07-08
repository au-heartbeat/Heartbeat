package heartbeat.repository;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum FileType {

	ERROR("error", "error/"), REPORT("report", "report/"), CSV("csv", "csv/"),
	METRICS_DATA_COMPLETED("metrics-data-completed", "metrics-data-completed/"), METRICS("metrics", "metrics/");

	private final String type;

	private final String path;

}
