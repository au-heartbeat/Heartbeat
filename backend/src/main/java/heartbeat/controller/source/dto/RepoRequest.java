package heartbeat.controller.source.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static heartbeat.controller.source.SourceController.TOKEN_PATTER;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RepoRequest {

	@NotNull(message = "Token cannot be empty.")
	@Pattern(regexp = TOKEN_PATTER, message = "token's pattern is incorrect")
	private String token;

	private String organization;

}
