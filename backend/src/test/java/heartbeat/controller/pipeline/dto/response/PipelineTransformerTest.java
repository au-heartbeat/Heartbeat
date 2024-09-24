package heartbeat.controller.pipeline.dto.response;

import heartbeat.client.dto.pipeline.buildkite.BuildKitePipelineDTO;
import heartbeat.client.dto.pipeline.buildkite.StepsDTO;
import heartbeat.util.GithubUtil;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mockStatic;

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

		try (MockedStatic<GithubUtil> githubUtilMockedStatic = mockStatic(GithubUtil.class)) {
			githubUtilMockedStatic.when(() -> GithubUtil.getGithubUrlFullName("repository")).thenReturn("repoName");

			Pipeline pipeline = PipelineTransformer.fromBuildKitePipelineDto(dto, orgId, orgName);

			assertEquals("SLUG", pipeline.id);
			assertEquals("Name", pipeline.name);
			assertEquals("repository", pipeline.repository);
			assertEquals(orgId, pipeline.orgId);
			assertEquals(orgName, pipeline.orgName);
			assertEquals("repoName", pipeline.repoName);
			assertEquals(1, pipeline.steps.size());
			assertEquals("Name1", pipeline.steps.get(0));
		}
	}

}
