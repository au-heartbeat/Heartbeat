package heartbeat.config;

public enum DayType {

	WORK_DAY(1),

	NON_WORK_DAY(0);

	private Integer value;

	DayType(Integer value) {
		this.value = value;
	}

	public Integer getValue() {
		return value;
	}

	public void setValue(Integer value) {
		this.value = value;
	}

}
