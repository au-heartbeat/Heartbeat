package heartbeat.service.report;

import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.CodeBase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SavedRequestInfo {

	private List<String> metrics;

	private List<DeploymentEnvironment> pipelines;

	private List<CodeBase> sourceControl;

	private List<String> classificationNames;

}
