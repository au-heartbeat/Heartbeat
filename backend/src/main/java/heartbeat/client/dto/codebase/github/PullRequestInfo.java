package heartbeat.client.dto.codebase.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class PullRequestInfo implements Serializable {

	private Integer number;

	private String url;

	@JsonProperty("created_at")
	private String createdAt;

	@JsonProperty("merged_at")
	private String mergedAt;

	@JsonProperty("merge_commit_sha")
	private String mergeCommitSha;

	private PullRequestUser user;

	@AllArgsConstructor
	@NoArgsConstructor
	@Builder
	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class PullRequestUser implements Serializable {

		private String login;

	}

}
