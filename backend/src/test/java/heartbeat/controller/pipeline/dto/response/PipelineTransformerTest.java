package heartbeat.controller.pipeline.dto.response;

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

		assertEquals("SLUG", pipeline.id);
		assertEquals("Name", pipeline.name);
		assertEquals("repository", pipeline.repository);
		assertEquals(orgId, pipeline.orgId);
		assertEquals(orgName, pipeline.orgName);
		assertEquals("repository", pipeline.repoName);
		assertEquals(1, pipeline.steps.size());
		assertEquals("Name1", pipeline.steps.get(0));
	}

	@Test
	void shouldTransformToPipelineWhenRepositoryContainsSlash() {
		String orgId = "ORG_ID";
		String orgName = "ORG_NAME";
		List<StepsDTO> steps = List.of(StepsDTO.builder().name("Name1").build(), StepsDTO.builder().name("").build(),
				StepsDTO.builder().build());
		BuildKitePipelineDTO dto = BuildKitePipelineDTO.builder()
			.slug("SLUG")
			.name("Name")
			.repository("organization/repository")
			.steps(steps)
			.build();

		Pipeline pipeline = PipelineTransformer.fromBuildKitePipelineDto(dto, orgId, orgName);

		assertEquals("SLUG", pipeline.id);
		assertEquals("Name", pipeline.name);
		assertEquals("organization/repository", pipeline.repository);
		assertEquals(orgId, pipeline.orgId);
		assertEquals(orgName, pipeline.orgName);
		assertEquals("organization/repository", pipeline.repoName);
		assertEquals(1, pipeline.steps.size());
		assertEquals("Name1", pipeline.steps.get(0));
	}

}
