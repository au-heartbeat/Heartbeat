package heartbeat.controller.report.dto.request;

public enum CalendarTypeEnum {

	REGULAR("REGULAR"), CN("CN"), VN("VN");

	private final String value;

	CalendarTypeEnum(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

}
