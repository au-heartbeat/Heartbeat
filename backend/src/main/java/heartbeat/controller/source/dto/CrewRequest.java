package heartbeat.controller.source.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static heartbeat.controller.source.SourceController.TOKEN_PATTER;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewRequest {

	@NotNull(message = "Token cannot be empty.")
	@Pattern(regexp = TOKEN_PATTER, message = "token's pattern is incorrect")
	private String token;

	@NotBlank(message = "organization is required")
	private String organization;

	@NotBlank(message = "repo is required")
	private String repo;

	@NotBlank(message = "branch is required")
	private String branch;

	private long startTime;

	private long endTime;

}
