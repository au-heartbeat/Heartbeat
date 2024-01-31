package heartbeat.service.report;

public enum CSVFileNameEnum {

	METRIC("./output/csv/metric"), BOARD("./output/csv/board"), PIPELINE("./output/csv/pipeline");

	private final String value;

	CSVFileNameEnum(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

}
