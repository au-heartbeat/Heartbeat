package heartbeat.repository;

import lombok.Getter;

@Getter
public enum FilePrefixType {

	BOARD_REPORT_PREFIX("board-"), METRIC_REPORT_PREFIX("metric-"), PIPELINE_REPORT_PREFIX("pipeline-"),
	SOURCE_CONTROL_PREFIX("sourceControl-"), DATA_COMPLETED_PREFIX("dataCompleted-");

	private final String prefix;

	FilePrefixType(String prefix) {
		this.prefix = prefix;
	}

}
