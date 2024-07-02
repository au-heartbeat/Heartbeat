package heartbeat.service.report;

public enum CSVFileNameEnum {

	METRIC("./app/output/csv/%s/metric"), BOARD("./app/output/csv/%s/board"), PIPELINE("./app/output/csv/%s/pipeline");

	private final String value;

	CSVFileNameEnum(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

}
