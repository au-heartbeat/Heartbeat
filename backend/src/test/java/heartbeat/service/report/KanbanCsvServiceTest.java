package heartbeat.service.report;

import heartbeat.client.component.JiraUriGenerator;
import heartbeat.client.dto.board.jira.JiraBoardConfigDTO;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.service.board.jira.JiraColumnResult;
import heartbeat.service.board.jira.JiraService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class KanbanCsvServiceTest {

	@InjectMocks
	private KanbanCsvService kanbanCsvService;

	@Mock
	private CSVFileGenerator csvFileGenerator;

	@Mock
	private JiraService jiraService;

	@Mock
	private JiraUriGenerator urlGenerator;

	@Captor
	private ArgumentCaptor<List<JiraCardDTO>> jiraCardDTOCaptor;

	@Test
	void shouldSaveCsvWithoutNonDoneCardsWhenNonDoneCardIsNull() throws URISyntaxException {

		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder().build());
		kanbanCsvService.generateCsvInfo(
				GenerateReportRequest.builder()
					.jiraBoardSetting(JiraBoardSetting.builder()
						.targetFields(List.of(TargetField.builder().name("Doing").build(),
								TargetField.builder().name("Done").build()))
						.build())
					.build(),
				CardCollection.builder().jiraCardDTOList(List.of(JiraCardDTO.builder().build())).build(),
				CardCollection.builder().build());

		verify(csvFileGenerator).convertBoardDataToCSV(jiraCardDTOCaptor.capture(), anyList(), any(), any());
		assertEquals(2, jiraCardDTOCaptor.getValue().size());
	}

}
