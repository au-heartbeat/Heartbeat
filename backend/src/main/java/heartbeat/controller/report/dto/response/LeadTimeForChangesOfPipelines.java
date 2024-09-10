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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadTimeForChangesOfPipelines {

	private String name;

	private String step;

	private Double prLeadTime;

	private Double pipelineLeadTime;

	private Double totalDelayTime;

	private String extractPipelineStep(String step) {
		return step.replaceAll(":\\w+: ", "");
	}

	public List<String[]> getMetricsCsvRowData(String leadTimeForChangesTitle) {
		List<String[]> rows = new ArrayList<>();
		String pipelineStep = extractPipelineStep(this.step);
		rows.add(new String[] { leadTimeForChangesTitle, this.name + " / " + pipelineStep + " / PR Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(prLeadTime, HOURS)) });
		rows.add(new String[] { leadTimeForChangesTitle, this.name + " / " + pipelineStep + " / Pipeline Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(pipelineLeadTime, HOURS)) });
		rows.add(new String[] { leadTimeForChangesTitle, this.name + " / " + pipelineStep + " / Total Lead Time",
				DecimalUtil.formatDecimalTwo(TimeUtils.minutesToUnit(totalDelayTime, HOURS)) });
		return rows;
	}

}
