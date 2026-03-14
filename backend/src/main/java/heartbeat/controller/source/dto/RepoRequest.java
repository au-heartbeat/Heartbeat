package heartbeat.controller.source.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RepoRequest {

	@NotNull(message = "Token cannot be empty.")
	private String token;

	private String site;

	@NotBlank(message = "organization is required")
	private String organization;

	private long endTime;

}
