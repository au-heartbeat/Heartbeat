package heartbeat.controller.source.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationRequest {

	@NotNull(message = "Token cannot be empty.")
	private String token;

	private String site;

}
