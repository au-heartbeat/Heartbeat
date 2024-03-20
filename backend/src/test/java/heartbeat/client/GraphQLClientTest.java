package heartbeat.client;

import com.apollographql.apollo3.ApolloClient;
import com.apollographql.apollo3.api.Optional;
import com.apollographql.apollo3.api.Query;
import com.buildkite.GetPipelineInfoQuery;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import heartbeat.client.graphql.GraphQLClient;
import lombok.extern.log4j.Log4j2;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.io.FileReader;
import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@Log4j2
public class GraphQLClientTest {

	@Mock
	private GraphQLClient graphQLClient;

	private MockWebServer mockServer;

	@BeforeEach
	void setUp() throws IOException {
		mockServer = new MockWebServer();
		mockServer.start();
	}

	@AfterEach
	void tearDown() throws IOException {
		mockServer.shutdown();
	}

	@Test
	void graphQLServerEnumShouldReturnExpectedResult() {
		String httpUrl = mockServer.url("/").toString();
		GraphQLClient.GraphQLServer mockedEnum = mock(GraphQLClient.GraphQLServer.class);
		when(mockedEnum.getUrl()).thenReturn(httpUrl);
		assertEquals(httpUrl, mockedEnum.getUrl());
	}

	@Test
	public void callWithFetchListOfPipeLineInfoExpectedResult() throws Exception {
		JsonReader reader = new JsonReader(
				new FileReader("src/test/java/heartbeat/controller/pipeline/buildKitePipelineInfoDataGraphQL.json"));
		Gson gson = new Gson();
		Object obj = gson.fromJson(reader, Object.class);
		reader.close();
		String json = gson.toJson(obj);
		mockServer.enqueue(new MockResponse().setBody(json).setResponseCode(200));

		String httpUrl = mockServer.url("/").toString();
		GraphQLClient.GraphQLServer mockedEnum = mock(GraphQLClient.GraphQLServer.class);
		when(mockedEnum.getUrl()).thenReturn(httpUrl);

		GraphQLClient mockGraphQLClient = new GraphQLClient();
		Query<GetPipelineInfoQuery.Data> mockQuery = new GetPipelineInfoQuery(Optional.present("slug"),
				Optional.present(10));

		List<GetPipelineInfoQuery.Node> response = mockGraphQLClient.fetchListOfPipeLineInfo(mockedEnum, "token",
				"slug", 100);
		assertEquals(1, response.size());
		assertEquals("Heartbeat", response.get(0).name);
		assertEquals("heartbeat", response.get(0).slug);
		assertEquals("git@github.com:au-heartbeat/Heartbeat.git", response.get(0).repository.url);

		Thread.sleep(100);

	}

	private GetPipelineInfoQuery.Data mockData() {
		GetPipelineInfoQuery.Repository repository = new GetPipelineInfoQuery.Repository(
				"git@github.com:au-heartbeat/Heartbeat.git");
		GetPipelineInfoQuery.Steps steps = new GetPipelineInfoQuery.Steps(
				"steps:\n  - label: \":pipeline: Upload pipeline.yml\"\n    command: |\n      if [[ \"${BUILDKITE_BRANCH}\" == \"main\" ]]; then\n        buildkite-agent pipeline upload\n      else\n        echo \"Skipping pipeline upload for branch ${BUILDKITE_BRANCH}\"\n      fi\n");
		GetPipelineInfoQuery.Node node = new GetPipelineInfoQuery.Node("heartbeat", "Heartbeat", repository, steps);
		GetPipelineInfoQuery.Edge edge = new GetPipelineInfoQuery.Edge(node);
		GetPipelineInfoQuery.Pipelines pipelines = new GetPipelineInfoQuery.Pipelines(List.of(edge));
		GetPipelineInfoQuery.Organization organization = new GetPipelineInfoQuery.Organization(pipelines);
		return new GetPipelineInfoQuery.Data(organization);
	}

}
