package heartbeat.service.report;

public enum CSVFileNameEnum {

	METRIC("metric"), BOARD("board"), PIPELINE("pipeline");

	private final String value;

	CSVFileNameEnum(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

}
