package heartbeat.service.source.github.model;

import heartbeat.client.dto.codebase.github.PullRequestInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PullRequestFinishedInfo {

	private boolean isGetNextPage;

	private List<PullRequestInfoDTO> pullRequestInfoDTOList;

}
