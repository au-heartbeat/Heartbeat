package heartbeat.client.dto.codebase.github;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PageReposInfoDTO implements Serializable {

	private int totalPage;

	private List<ReposInfoDTO> pageInfo;

}
