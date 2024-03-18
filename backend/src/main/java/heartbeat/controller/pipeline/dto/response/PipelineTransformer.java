package heartbeat.controller.pipeline.dto.response;

import com.buildkite.GetPipelineInfoQuery.Node;
import heartbeat.client.dto.pipeline.buildkite.BuildKitePipelineDTO;
import heartbeat.client.dto.pipeline.buildkite.StepsDTO;
import org.yaml.snakeyaml.Yaml;

import java.util.List;
import java.util.Map;
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

	static Pipeline fromBuildKiteGraphQLQueryNode(Node node, String orgId, String orgName) {
		String yamlString = (String) node.steps.yaml;
		Yaml yaml = new Yaml();
		Map<String, List<Map<String, String>>> data = yaml.load(yamlString);
		List<Map<String, String>> steps = data.get("steps");
		List<String> labels = steps.stream().map(step -> step.get("label")).toList();
		return Pipeline.builder()
			.orgId(orgId)
			.orgName(orgName)
			.id(node.slug)
			.name(node.name)
			.repository(node.repository.url)
			.steps(labels)
			.build();
	}

}
