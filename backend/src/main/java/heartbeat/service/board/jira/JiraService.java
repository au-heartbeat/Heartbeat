package heartbeat.service.board.jira;

import static java.util.Objects.isNull;
import static org.springframework.http.HttpMethod.GET;

import feign.FeignException;
import heartbeat.client.JiraFeignClient;
import heartbeat.client.dto.JiraBoardConfigDTO;
import heartbeat.client.dto.JiraColumn;
import heartbeat.controller.board.vo.request.BoardRequest;
import heartbeat.controller.board.vo.response.BoardConfigResponse;
import heartbeat.controller.board.vo.response.ColumnResponse;
import heartbeat.controller.board.vo.response.ColumnValue;
import heartbeat.controller.board.vo.response.StatusSelf;
import heartbeat.exception.RequestFailedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class JiraService {

	private final JiraFeignClient jiraFeignClient;

	private final RestTemplate restTemplate;

	public BoardConfigResponse getJiraConfiguration(BoardRequest boardRequest) {
		String url = "https://" + boardRequest.getSite() + ".atlassian.net";
		JiraBoardConfigDTO jiraBoardConfigDTO;
		try {
			jiraBoardConfigDTO = jiraFeignClient.getJiraBoardConfiguration(URI.create(url), boardRequest.getBoardId(),
				boardRequest.getToken());

			return BoardConfigResponse.builder().jiraColumns(
				jiraBoardConfigDTO.getColumnConfig().getColumns().stream()
					.map(jiraColumn -> getColumnNameAndStatus(jiraColumn, boardRequest.getToken())).toList()
			).build();
		} catch (FeignException e) {
			log.error("Failed when call Jira to get board config", e);
			throw new RequestFailedException(e);
		}
	}

	private ColumnResponse getColumnNameAndStatus(JiraColumn jiraColumn, String token) {
		List<StatusSelf> statusSelfList = jiraColumn.getStatuses().stream()
			.map(jiraColumnStatus -> getColumnStatusCategory(jiraColumnStatus.getSelf(), token)).toList();

		List<String> statusKey = statusSelfList.stream().map(statusSelf -> statusSelf.getStatusCategory().getKey()).toList();
		String key = statusKey.contains("done") ? "done" : statusKey.get(statusKey.size() - 1);

		return ColumnResponse.builder()
			.key(key)
			.value(ColumnValue.builder()
				.name(jiraColumn.getName())
				.statuses(statusSelfList.stream().map(statusSelf -> statusSelf.getUntranslatedName().toUpperCase()).toList())
				.build())
			.build();
	}

	private StatusSelf getColumnStatusCategory(String url, String token) {
		ResponseEntity<StatusSelf> exchange = restTemplate.exchange(
			url,
			GET,
			new HttpEntity<>(buildHttpHeaders(token)),
			StatusSelf.class
		);
		if (isNull(exchange.getBody())) {
			throw new RequestFailedException(exchange.getStatusCode().value(), "Failed when call Jira to get colum body is null");
		}
		return exchange.getBody();
	}

	public HttpHeaders buildHttpHeaders(String token) {
		var headers = new HttpHeaders();
		headers.add("Authorization", token);
		return headers;
	}
}
