package heartbeat.controller.pipeline.dto.response;

import com.buildkite.GetPipelineInfoQuery;
import heartbeat.client.dto.pipeline.buildkite.BuildKitePipelineDTO;
import heartbeat.client.dto.pipeline.buildkite.StepsDTO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PipelineTransformerTest {

	@Test
	void shouldTransformToPipeline() {
		String orgId = "ORG_ID";
		String orgName = "ORG_NAME";
		List<StepsDTO> steps = List.of(StepsDTO.builder().name("Name1").build(), StepsDTO.builder().name("").build(),
				StepsDTO.builder().build());
		BuildKitePipelineDTO dto = BuildKitePipelineDTO.builder()
			.slug("SLUG")
			.name("Name")
			.repository("repository")
			.steps(steps)
			.build();

		Pipeline pipeline = PipelineTransformer.fromBuildKitePipelineDto(dto, orgId, orgName);

		assertEquals(pipeline.id, "SLUG");
		assertEquals(pipeline.name, "Name");
		assertEquals(pipeline.repository, "repository");
		assertEquals(pipeline.orgId, orgId);
		assertEquals(pipeline.orgName, orgName);
		assertEquals(pipeline.steps.size(), 1);
		assertEquals(pipeline.steps.get(0), "Name1");

	}

	@Test
	void shouldTransformToPipelineWithGraphQLQueryNode() {
		String orgId = "ORG_ID";
		String orgName = "ORG_NAME";
		GetPipelineInfoQuery.Node node = new GetPipelineInfoQuery.Node("MOCK_PIPELINE_ID", "MOCK_PIPELINE_NAME",
				new GetPipelineInfoQuery.Repository("MOCK_REPOSITORY"),
				new GetPipelineInfoQuery.Steps("steps:\n" + "  - label: \":step1\"\n" + "    command: |\n"
						+ "      if [[ \"${BUILDKITE_BRANCH}\" == \"main\" ]]; then\n"
						+ "        buildkite-agent pipeline upload\n" + "      else\n"
						+ "        echo \"Skipping pipeline upload for branch ${BUILDKITE_BRANCH}\"\n" + "      fi\n"
						+ "  - label: \":step2\"\n" + "    command: |\n"
						+ "      if [[ \"${BUILDKITE_BRANCH}\" == \"main\" ]]; then\n"
						+ "        buildkite-agent pipeline upload\n" + "      else\n"
						+ "        echo \"Skipping pipeline upload for branch ${BUILDKITE_BRANCH}\"\n" + "      fi\n"));

		Pipeline pipeline = PipelineTransformer.fromBuildKiteGraphQLQueryNode(node, orgId, orgName);

		assertEquals(pipeline.id, "MOCK_PIPELINE_ID");
		assertEquals(pipeline.name, "MOCK_PIPELINE_NAME");
		assertEquals(pipeline.repository, "MOCK_REPOSITORY");
		assertEquals(pipeline.orgId, orgId);
		assertEquals(pipeline.orgName, orgName);
		assertEquals(pipeline.steps.size(), 2);
		assertEquals(pipeline.steps.get(0), ":step1");
		assertEquals(pipeline.steps.get(1), ":step2");

	}

}
