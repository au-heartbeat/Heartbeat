package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Objects;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@EqualsAndHashCode
public class MetricsDataCompleted {

	private Boolean boardMetricsCompleted;

	private Boolean doraMetricsCompleted;

	private Boolean allMetricsCompleted;

	public Boolean boardMetricsCompleted() {
		return boardMetricsCompleted;
	}

	public Boolean doraMetricsCompleted() {
		return doraMetricsCompleted;
	}

	public Boolean allMetricsCompleted() {
		return allMetricsCompleted;
	}

	public Boolean isAllCompleted() {
		return (Objects.isNull(boardMetricsCompleted) || boardMetricsCompleted)
				&& (Objects.isNull(doraMetricsCompleted) || doraMetricsCompleted);
	}

}
