package heartbeat.client.dto.codebase.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PullRequestInfoDTO implements Serializable {

	private int number;

	@JsonProperty("created_at")
	private String createdAt;

	@JsonProperty("merged_at")
	private String mergedAt;

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
