package heartbeat.client;

import com.apollographql.apollo3.api.Optional;
import com.apollographql.apollo3.api.Query;
import com.buildkite.GetPipelineBuildsQuery;
import com.buildkite.GetPipelineInfoQuery;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import heartbeat.client.graphql.GraphQLClient;
import heartbeat.exception.PermissionDenyException;
import heartbeat.exception.UnauthorizedException;
import lombok.extern.log4j.Log4j2;
import lombok.val;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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
	void shouldThrowPermissionDenyExceptionGivenOtherPermissionWhenTokenLimited() {
		mockServer.enqueue(
				new MockResponse()
					.setBody("{\n" + "  \"errors\": [\n" + "    {\n"
							+ "      \"message\": \"Your access token doesn't have the graphql scope\"\n" + "    }\n"
							+ "  ]\n" + "}")
					.setResponseCode(403));

		String httpUrl = mockServer.url("/").toString();
		GraphQLClient.GraphQLServer mockedEnum = mock(GraphQLClient.GraphQLServer.class);
		when(mockedEnum.getUrl()).thenReturn(httpUrl);

		GraphQLClient mockGraphQLClient = new GraphQLClient();
		Query<GetPipelineInfoQuery.Data> mockQuery = new GetPipelineInfoQuery(Optional.present("slug"),
				Optional.present(10));

		assertThatThrownBy(() -> mockGraphQLClient.fetchListOfPipeLineInfo(mockedEnum, "mock token", "mock slug", 1))
			.isInstanceOf(PermissionDenyException.class)
			.hasMessageContaining("Your access token doesn't have the graphql scope");
	}

	@Test
	void shouldThrowUnauthorizedExceptionWhenTokenInvalid() {
		mockServer.enqueue(new MockResponse()
			.setBody("{\n" + "  \"errors\": [\n" + "    {\n"
					+ "      \"message\": \"Please supply a valid API Access Token\"\n" + "    }\n" + "  ]\n" + "}")
			.setResponseCode(401));

		String httpUrl = mockServer.url("/").toString();
		GraphQLClient.GraphQLServer mockedEnum = mock(GraphQLClient.GraphQLServer.class);
		when(mockedEnum.getUrl()).thenReturn(httpUrl);

		GraphQLClient mockGraphQLClient = new GraphQLClient();
		Query<GetPipelineInfoQuery.Data> mockQuery = new GetPipelineInfoQuery(Optional.present("slug"),
				Optional.present(10));

		assertThatThrownBy(() -> mockGraphQLClient.fetchListOfPipeLineInfo(mockedEnum, "mock token", "mock slug", 1))
			.isInstanceOf(UnauthorizedException.class)
			.hasMessageContaining("Please supply a valid API Access Token");
	}

	@Test
	void shouldReturnNullWhenApolloResponseDataIsNull() throws InterruptedException {
		mockServer.enqueue(
				new MockResponse()
					.setBody("{\n" + "  \"errors\": [\n" + "    {\n"
							+ "      \"message\": \"Your access token doesn't have the graphql scope\"\n" + "    }\n"
							+ "  ]\n" + "}")
					.setResponseCode(200));

		String httpUrl = mockServer.url("/").toString();
		GraphQLClient.GraphQLServer mockedEnum = mock(GraphQLClient.GraphQLServer.class);
		when(mockedEnum.getUrl()).thenReturn(httpUrl);

		GraphQLClient mockGraphQLClient = new GraphQLClient();
		Query<GetPipelineInfoQuery.Data> mockQuery = new GetPipelineInfoQuery(Optional.present("slug"),
				Optional.present(10));

		GetPipelineInfoQuery.Data data = mockGraphQLClient.wrapAndThrowExceptionWith(mockQuery, "token", mockedEnum);
		assertNull(data);

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

	@Test
	public void callWithFetchListOfBuildsInfoExpectedResult() throws Exception {
		JsonReader reader = new JsonReader(
				new FileReader("src/test/java/heartbeat/controller/pipeline/buildKiteBuildsDataGraphQL.json"));
		Gson gson = new Gson();
		Object obj = gson.fromJson(reader, Object.class);
		reader.close();
		String json = gson.toJson(obj);
		mockServer.enqueue(new MockResponse().setBody(json).setResponseCode(200));

		String httpUrl = mockServer.url("/").toString();
		GraphQLClient.GraphQLServer mockedEnum = mock(GraphQLClient.GraphQLServer.class);
		when(mockedEnum.getUrl()).thenReturn(httpUrl);

		GraphQLClient mockGraphQLClient = new GraphQLClient();
		String mockJobStartTime = "2022-09-09T03:57:09.545Z";
		String mockJobFinishTime = "2022-09-09T04:57:09.545Z";
		GetPipelineBuildsQuery.Builds builds = mockGraphQLClient.fetchListOfBuildsWith(mockedEnum, "token", "slug",
				mockJobStartTime, mockJobFinishTime, List.of("branch_main"), 1);

		assertEquals(389, builds.count);

		Thread.sleep(100);

	}

}
