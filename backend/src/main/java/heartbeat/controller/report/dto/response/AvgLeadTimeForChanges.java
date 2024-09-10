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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvgLeadTimeForChanges {

	@Builder.Default
	private String name = "Average";

	private Double prLeadTime;

	private Double pipelineLeadTime;

	private Double totalDelayTime;

	public List<String[]> getMetricsCsvRowData(String leadTimeForChangesTitle) {
		List<String[]> rows = new ArrayList<>();
		rows.add(new String[] { leadTimeForChangesTitle, name + " / PR Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(prLeadTime, HOURS)) });
		rows.add(new String[] { leadTimeForChangesTitle, name + " / Pipeline Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(pipelineLeadTime, HOURS)) });
		rows.add(new String[] { leadTimeForChangesTitle, name + " / Total Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(totalDelayTime, HOURS)) });
		return rows;
	}

}
