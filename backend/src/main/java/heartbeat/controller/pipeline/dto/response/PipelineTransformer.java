package heartbeat.controller.pipeline.dto.response;

import heartbeat.client.dto.pipeline.buildkite.BuildKitePipelineDTO;
import heartbeat.client.dto.pipeline.buildkite.StepsDTO;
import heartbeat.util.GithubUtil;

import java.util.stream.Collectors;

public interface PipelineTransformer {

	static Pipeline fromBuildKitePipelineDto(BuildKitePipelineDTO dto, String orgId, String orgName) {
		String repositoryFullName = dto.getRepository();
		String[] repositorySplitNames = GithubUtil.getGithubUrlFullName(repositoryFullName).split("/");
		String repoName = "";
		if (repositorySplitNames.length > 1) {
			repoName = repositorySplitNames[repositorySplitNames.length - 1];
		}
		return Pipeline.builder()
			.orgId(orgId)
			.orgName(orgName)
			.id(dto.getSlug())
			.name(dto.getName())
			.repository(repositoryFullName)
			.repoName(repoName)
			.steps(dto.getSteps()
				.stream()
				.map(StepsDTO::getName)
				.filter(name -> name != null && name.length() > 0)
				.collect(Collectors.toList()))
			.build();
	}

}
