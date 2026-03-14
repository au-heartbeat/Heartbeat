package heartbeat.controller.source.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewRequest {

	@NotNull(message = "Token cannot be empty.")
	private String token;

	private String site;

	@NotBlank(message = "organization is required")
	private String organization;

	@NotBlank(message = "repo is required")
	private String repo;

	@NotBlank(message = "branch is required")
	private String branch;

	private long startTime;

	private long endTime;

}
