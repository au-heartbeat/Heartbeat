package heartbeat.controller.source.dto;

import heartbeat.client.dto.codebase.github.OrganizationsInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {

	private List<String> name;

}
