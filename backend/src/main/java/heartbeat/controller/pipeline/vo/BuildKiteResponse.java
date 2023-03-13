package heartbeat.controller.pipeline.vo;

import heartbeat.client.dto.BuildKiteOrganizationsInfo;
import heartbeat.client.dto.PipelineDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BuildKiteResponse {

	private List<BuildKiteOrganizationsInfo> buildKiteOrganizationsInfoList;

	private List<PipelineDTO> pipelineList;

}
