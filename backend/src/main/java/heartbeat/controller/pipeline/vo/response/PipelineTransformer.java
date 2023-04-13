package heartbeat.controller.pipeline.vo.response;

import heartbeat.client.dto.pipeline.buildKite.BuildKitePipelineDTO;
import heartbeat.client.dto.pipeline.buildKite.StepsDTO;

import java.util.stream.Collectors;

public interface PipelineTransformer {

	static Pipeline fromBuildKitePipelineDto(BuildKitePipelineDTO dto, String orgId, String orgName) {
		return Pipeline.builder()
			.orgId(orgId)
			.orgName(orgName)
			.id(dto.getSlug())
			.name(dto.getName())
			.repository(dto.getRepository())
			.steps(dto.getSteps()
				.stream()
				.map(StepsDTO::getName)
				.filter(name -> name != null && name.length() > 0)
				.collect(Collectors.toList()))
			.build();
	}

}
