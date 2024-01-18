package heartbeat.controller.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.function.Function;

import static heartbeat.util.ValueUtil.getValueOrNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

	private Velocity velocity;

	private List<Classification> classificationList;

	private CycleTime cycleTime;

	private DeploymentFrequency deploymentFrequency;

	private ChangeFailureRate changeFailureRate;

	private MeanTimeToRecovery meanTimeToRecovery;

	private LeadTimeForChanges leadTimeForChanges;

	private ReportMetricsError reportMetricsError;

	private Long exportValidityTime;

	private Boolean boardMetricsCompleted;

	private Boolean pipelineMetricsCompleted;

	private Boolean sourceControlMetricsCompleted;

	private Boolean allMetricsCompleted;

	public ReportResponse(Long exportValidityTime) {
		this.exportValidityTime = exportValidityTime;
	}

	public ReportResponse(ReportResponse boardReportResponse, ReportResponse doraReportResponse,
			ReportResponse codebaseReportResponse, MetricsDataCompleted metricsDataCompleted, ReportResponse response,
			ReportMetricsError reportError, boolean isReportReady) {
		this.velocity = getValueOrNull(boardReportResponse, ReportResponse::getVelocity);
		this.classificationList = getValueOrNull(boardReportResponse, ReportResponse::getClassificationList);
		this.cycleTime = getValueOrNull(boardReportResponse, ReportResponse::getCycleTime);
		this.exportValidityTime = getValueOrNull(response, ReportResponse::getExportValidityTime);
		this.deploymentFrequency = getValueOrNull(doraReportResponse, ReportResponse::getDeploymentFrequency);
		this.changeFailureRate = getValueOrNull(doraReportResponse, ReportResponse::getChangeFailureRate);
		this.meanTimeToRecovery = getValueOrNull(doraReportResponse, ReportResponse::getMeanTimeToRecovery);
		this.leadTimeForChanges = getValueOrNull(codebaseReportResponse, ReportResponse::getLeadTimeForChanges);
		this.boardMetricsCompleted = getValueOrNull(metricsDataCompleted, MetricsDataCompleted::boardMetricsCompleted);
		this.pipelineMetricsCompleted = getValueOrNull(metricsDataCompleted,
				MetricsDataCompleted::pipelineMetricsCompleted);
		this.sourceControlMetricsCompleted = getValueOrNull(metricsDataCompleted,
				MetricsDataCompleted::sourceControlMetricsCompleted);
		this.allMetricsCompleted = isReportReady;
		this.reportMetricsError = reportError;
	}

}
