package heartbeat.service.report.model;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class WorkInfo {

	private long workTime;

	private long holidays;

	private long totalDays;

	public long getWorkDays() {
		return totalDays - holidays;
	}

}
