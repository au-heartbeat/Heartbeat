package heartbeat.controller.source.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SourceControlDTO {

	@NotNull(message = "Token cannot be empty.")
	private String token;

	private String site;

}
