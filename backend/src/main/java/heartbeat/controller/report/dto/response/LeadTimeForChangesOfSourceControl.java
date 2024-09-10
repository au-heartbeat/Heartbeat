package heartbeat.controller.report.dto.response;

import heartbeat.util.DecimalUtil;
import io.micrometer.core.instrument.util.TimeUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import static java.util.concurrent.TimeUnit.HOURS;

@AllArgsConstructor
@Builder
@NoArgsConstructor
@Data
public class LeadTimeForChangesOfSourceControl {

	private String organization;

	private String repo;

	private Double prLeadTime;

	private Double pipelineLeadTime;

	private Double totalDelayTime;

	public List<String[]> getMetricsCsvRowData(String leadTimeForChangesTitle) {
		List<String[]> rows = new ArrayList<>();
		rows.add(new String[] { leadTimeForChangesTitle, organization + " / " + repo + " / PR Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(prLeadTime, HOURS)) });
		rows.add(new String[] { leadTimeForChangesTitle, organization + " / " + repo + " / Pipeline Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(pipelineLeadTime, HOURS)) });
		rows.add(new String[] { leadTimeForChangesTitle, organization + " / " + repo + " / Total Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(totalDelayTime, HOURS)) });
		return rows;
	}

}
