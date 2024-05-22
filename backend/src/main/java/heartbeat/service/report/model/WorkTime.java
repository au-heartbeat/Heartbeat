package heartbeat.service.report.model;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class WorkTime {

	private long workTime;

	private long holidays;

}
