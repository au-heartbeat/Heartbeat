package heartbeat.client.graphql;

import com.apollographql.apollo3.ApolloCall;
import com.apollographql.apollo3.ApolloClient;
import com.apollographql.apollo3.api.ApolloResponse;
import com.apollographql.apollo3.api.Optional;
import com.apollographql.apollo3.api.Query;
import com.apollographql.apollo3.exception.ApolloHttpException;
import com.buildkite.GetPipelineInfoQuery;
import kotlin.Result;
import kotlin.coroutines.Continuation;
import kotlin.coroutines.CoroutineContext;
import kotlin.coroutines.EmptyCoroutineContext;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Setter
@Component
@Log4j2
public class GraphQLClient {

	@Getter
	public enum GraphQLServer {

		BUILDKITE("https://graphql.buildkite.com/v1"), GITHUB("https://api.github.com/graphql");

		private final String url;

		GraphQLServer(String url) {
			this.url = url;
		}

	}

	public ApolloClient apolloClient;

	private ApolloClient getApolloClient(String token, GraphQLServer server) {
		if (apolloClient == null) {
			this.apolloClient = new ApolloClient.Builder().addHttpHeader("Authorization", token)
				.serverUrl(server.getUrl())
				.build();
		}
		else {
			this.apolloClient = apolloClient.newBuilder()
				.serverUrl(server.getUrl())
				.addHttpHeader("Authorization", token)
				.build();
		}
		return apolloClient;
	}

	public <D extends Query.Data> CompletableFuture<ApolloResponse<D>> callWithQuery(Query<D> query, String token,
			GraphQLServer server) {
		ApolloCall<D> queryCall = this.getApolloClient(token, server).query(query);
		CompletableFuture<ApolloResponse<D>> responseCompletableFuture = new CompletableFuture<>();
		getApolloClient(token, server).query(query).execute(new Continuation<>() {
			@NotNull
			@Override
			public CoroutineContext getContext() {
				return EmptyCoroutineContext.INSTANCE;
			}

			@Override
			@SuppressWarnings("unchecked")
			public void resumeWith(@NotNull Object responseObject) {
				log.info("****resumeWith**{}", responseObject);
				if (responseObject instanceof ApolloResponse) {
					log.info("****resumeWithApolloResponse**{}", responseObject);
					responseCompletableFuture.complete((ApolloResponse<D>) responseObject);
				}
				if (responseObject instanceof Result.Failure) {
					log.info("****resumeWithFailure**", ((Result.Failure) responseObject).exception);
					responseCompletableFuture.completeExceptionally(((Result.Failure) responseObject).exception);
				}
			}
		});
		return responseCompletableFuture;
	}

	public List<GetPipelineInfoQuery.Node> fetchListOfPipeLineInfo(GraphQLServer serverType, String token, String slug,
			int perPage) {
		CompletableFuture<List<GetPipelineInfoQuery.Node>> nodeListFuture = new CompletableFuture<>();
		List<GetPipelineInfoQuery.Node> list = null;
		Query<GetPipelineInfoQuery.Data> query = new GetPipelineInfoQuery(Optional.present(slug),
				Optional.present(perPage));

		try {
			ApolloResponse<GetPipelineInfoQuery.Data> listCompletableFuture = callWithQuery(query, token, serverType)
				.get();
			if (listCompletableFuture.data != null) {
				list = listCompletableFuture.data.organization.pipelines.edges.stream().map(edge -> edge.node).toList();
			}
		}
		catch (ExecutionException | InterruptedException | ApolloHttpException e) {
			// TODO handle ApolloHttpException
		}
		return list;
	}

}
