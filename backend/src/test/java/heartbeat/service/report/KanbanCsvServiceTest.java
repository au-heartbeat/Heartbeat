package heartbeat.service.report;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import heartbeat.client.component.JiraUriGenerator;
import heartbeat.client.dto.board.jira.JiraBoardConfigDTO;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.controller.board.dto.request.RequestJiraBoardColumnSetting;
import heartbeat.controller.board.dto.request.ReworkTimesSetting;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.ColumnValue;
import heartbeat.controller.board.dto.response.CycleTimeInfo;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraColumnDTO;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.BoardCSVConfigEnum;
import heartbeat.repository.FilePrefixType;
import heartbeat.repository.FileRepository;
import heartbeat.service.board.jira.JiraColumnResult;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.report.calculator.model.FetchedData;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static heartbeat.controller.report.dto.response.BoardCSVConfigEnum.ISSUE_KEY;
import static heartbeat.controller.report.dto.response.BoardCSVConfigEnum.REVIEW_DAYS;
import static heartbeat.controller.report.dto.response.BoardCSVConfigEnum.SUMMARY;
import static heartbeat.service.jira.JiraBoardConfigDTOFixture.MOCK_JIRA_BOARD_COLUMN_SETTING_LIST;
import static heartbeat.service.report.BoardCsvFixture.MOCK_JIRA_CARD;
import static heartbeat.service.report.BoardCsvFixture.MOCK_REWORK_TIMES_INFO_LIST;
import static heartbeat.tools.TimeUtils.mockTimeStamp;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
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

	@Mock
	private FileRepository fileRepository;

	@Captor
	private ArgumentCaptor<List<JiraCardDTO>> jiraCardDTOCaptor;

	@Captor
	private ArgumentCaptor<List<BoardCSVConfig>> csvFieldsCaptor;

	@Captor
	private ArgumentCaptor<String[][]> csvSheetCaptor;

	@Captor
	private ArgumentCaptor<List<BoardCSVConfig>> csvNewFieldsCaptor;

	public static final String CSV_TIME_STAMP = String.valueOf(mockTimeStamp(2024, 7, 3, 17, 45, 50));

	public static final String START_TIME = String.valueOf(mockTimeStamp(2024, 3, 10, 0, 0, 0));

	public static final String END_TIME = String.valueOf(mockTimeStamp(2024, 4, 9, 0, 0, 0));

	public static final String TEST_UUID = "test-uuid";

	@ParameterizedTest
	@MethodSource("generateReportRequest")
	void shouldSaveCsvWithoutNonDoneCardsWhenPartCards(GenerateReportRequest generateReportRequest)
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder().build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().build())
			.build();

		kanbanCsvService.generateCsvInfo(TEST_UUID, generateReportRequest, cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(2, jiraCardDTOCaptor.getValue().size());
		assertTrue(jiraCardDTOCaptor.getValue().contains(jiraCardDTO));
	}

	@Test
	void shouldSaveCsvWithoutAllDoneCards() throws URISyntaxException {
		GenerateReportRequest generateReportRequest = GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Doing").build(),
						TargetField.builder().name("Done").build(),
						TargetField.builder().name("Done").key("cardCycleTime.steps.blocked").flag(true).build(),
						TargetField.builder().name("otherName").key("otherKey").flag(true).build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build();
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder().build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.build();

		kanbanCsvService.generateCsvInfo(TEST_UUID, generateReportRequest, cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(2, jiraCardDTOCaptor.getValue().size());
		assertTrue(jiraCardDTOCaptor.getValue().contains(jiraCardDTO));
	}

	@Test
	void shouldSaveCsvWithOrderedNonDoneCardsByJiraColumnDescendingWhenNonDoneCardIsNotEmpty()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List.of(
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DOING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("TESTING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("blockedCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Blocked").build())
					.build())
				.build())
			.build();
		JiraCardDTO doingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("doingCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Doing").build())
					.build())
				.build())
			.build();
		JiraCardDTO testingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("testingCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Testing").build())
					.build())
				.build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
				add(doingJiraCard);
				add(testingJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Doing").build(),
						TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(5, jiraCardDTOCaptor.getValue().size());
		assertEquals(testingJiraCard, jiraCardDTOCaptor.getValue().get(2));
		assertEquals(blockedJiraCard, jiraCardDTOCaptor.getValue().get(3));
		assertEquals(doingJiraCard, jiraCardDTOCaptor.getValue().get(4));
	}

	@Test
	void shouldSaveCsvWithOrderedNonDoneCardsByJiraColumnDescendingWhenNonDoneCardIsNotEmptySortByStatusDate()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List.of(
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DOING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("TESTING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO preWaitingForTestingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("preWaitingForTestingJiraCard")
				.fields(JiraCardField.builder().status(Status.builder().name("WAITING FOR TESTING").build()).build())
				.build())
			.build();
		JiraCardDTO nextWaitingForTestingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("nextWaitingForTestingJiraCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("WAITING FOR TESTING").build())
					.build())
				.build())
			.build();
		JiraCardDTO preDoingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("preDoingJiraCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Doing").build())
					.build())
				.build())
			.build();
		JiraCardDTO nextDoingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("nextDoingJiraCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Doing").build())
					.build())
				.build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(preDoingJiraCard);
				add(nextDoingJiraCard);
				add(preWaitingForTestingJiraCard);
				add(nextWaitingForTestingJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Doing").build(),
						TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(6, jiraCardDTOCaptor.getValue().size());
		assertEquals(preWaitingForTestingJiraCard, jiraCardDTOCaptor.getValue().get(2));
		assertEquals(nextWaitingForTestingJiraCard, jiraCardDTOCaptor.getValue().get(3));
		assertEquals(preDoingJiraCard, jiraCardDTOCaptor.getValue().get(4));
		assertEquals(nextDoingJiraCard, jiraCardDTOCaptor.getValue().get(5));
	}

	@Test
	void shouldSaveCsvWithOrderedDoneCardsByJiraColumnDescendingWhenDoneCardIsNotEmptyAndStatusIsNull()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List.of(
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DOING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("TESTING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO preDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder().status(Status.builder().name("Blocked").build()).build())
				.build())
			.build();
		JiraCardDTO nextDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(JiraCardField.builder().build()).build())
			.build();
		List<JiraCardDTO> doneJiraCardDTOList = new ArrayList<>() {
			{
				add(preDoneJiraCard);
				add(nextDoneJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(doneJiraCardDTOList).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Doing").build(),
						TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(4, jiraCardDTOCaptor.getValue().size());
		assertEquals(preDoneJiraCard, jiraCardDTOCaptor.getValue().get(0));
		assertEquals(nextDoneJiraCard, jiraCardDTOCaptor.getValue().get(1));
	}

	@Test
	void shouldSaveCsvWithOrderedDoneCardsByJiraColumnDescendingWhenNonDoneCardIsNotEmptySortByStatusDate()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO preDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Done").build())
					.build())
				.build())
			.build();
		JiraCardDTO nextDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Done").build())
					.build())
				.build())
			.build();
		List<JiraCardDTO> doneJiraCardDTOList = new ArrayList<>() {
			{
				add(preDoneJiraCard);
				add(nextDoneJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(doneJiraCardDTOList).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(4, jiraCardDTOCaptor.getValue().size());
		assertEquals(preDoneJiraCard, jiraCardDTOCaptor.getValue().get(1));
		assertEquals(nextDoneJiraCard, jiraCardDTOCaptor.getValue().get(0));
	}

	@Test
	void shouldSaveCsvWithOrderedDoneCardsByJiraColumnDescendingWhenNextStatusIsNull() throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO preDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("preDoneJiraCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Done").build())
					.build())
				.build())
			.build();
		JiraCardDTO nextDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("nextDoneJiraCard")
				.fields(JiraCardField.builder().lastStatusChangeDate(1701151323000L).build())
				.build())
			.build();
		List<JiraCardDTO> doneJiraCardDTOList = new ArrayList<>() {
			{
				add(nextDoneJiraCard);
				add(preDoneJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(doneJiraCardDTOList).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(4, jiraCardDTOCaptor.getValue().size());
		assertEquals(preDoneJiraCard, jiraCardDTOCaptor.getValue().get(1));
		assertEquals(nextDoneJiraCard, jiraCardDTOCaptor.getValue().get(0));
	}

	@Test
	void shouldSaveCsvWithOrderedDoneCardsByJiraColumnDescendingWhenPreLastStatusChangeDateIsNull()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO preDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("preDoneJiraCard")
				.fields(JiraCardField.builder().status(Status.builder().name("Done").build()).build())
				.build())
			.build();
		JiraCardDTO nextDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("nextDoneJiraCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Done").build())
					.build())
				.build())
			.build();
		List<JiraCardDTO> doneJiraCardDTOList = new ArrayList<>() {
			{
				add(nextDoneJiraCard);
				add(preDoneJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(doneJiraCardDTOList).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(4, jiraCardDTOCaptor.getValue().size());
		assertEquals(preDoneJiraCard, jiraCardDTOCaptor.getValue().get(1));
		assertEquals(nextDoneJiraCard, jiraCardDTOCaptor.getValue().get(0));
	}

	@Test
	void shouldSaveCsvWithOrderedDoneCardsByJiraColumnDescendingWhenNextLastStatusChangeDateIsNull()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO preDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("preDoneJiraCard")
				.fields(JiraCardField.builder()
					.lastStatusChangeDate(1701151323000L)
					.status(Status.builder().name("Done").build())
					.build())
				.build())
			.build();
		JiraCardDTO nextDoneJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.key("nextDoneJiraCard")
				.fields(JiraCardField.builder().status(Status.builder().name("Done").build()).build())
				.build())
			.build();
		List<JiraCardDTO> doneJiraCardDTOList = new ArrayList<>() {
			{
				add(nextDoneJiraCard);
				add(preDoneJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(doneJiraCardDTOList).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(4, jiraCardDTOCaptor.getValue().size());
		assertEquals(preDoneJiraCard, jiraCardDTOCaptor.getValue().get(1));
		assertEquals(nextDoneJiraCard, jiraCardDTOCaptor.getValue().get(0));
	}

	@Test
	void shouldSaveCsvWithoutOrderedNonDoneCardsByJiraColumnWhenNonDoneCardIsNotEmpty() throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List.of(
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("Doing")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("Blocked")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("Testing")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder().status(Status.builder().name("Blocked").build()).build())
				.build())
			.build();
		JiraCardDTO doingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder().status(Status.builder().name("Doing").build()).build())
				.build())
			.build();
		JiraCardDTO testingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder().status(Status.builder().name("Testing").build()).build())
				.build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
				add(doingJiraCard);
				add(testingJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Doing").build(),
						TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(5, jiraCardDTOCaptor.getValue().size());
		assertEquals(blockedJiraCard, jiraCardDTOCaptor.getValue().get(2));
		assertEquals(doingJiraCard, jiraCardDTOCaptor.getValue().get(3));
		assertEquals(testingJiraCard, jiraCardDTOCaptor.getValue().get(4));
	}

	@Test
	void shouldSaveCsvWithOrderedNonDoneCardsByJiraColumnDescendingWhenNonDoneCardIsNotEmptyAndStatusIsNull()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List.of(
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DOING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("TESTING")).build()).build(),
					JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("DONE")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder().build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder()
				.fields(JiraCardField.builder().status(Status.builder().name("Blocked").build()).build())
				.build())
			.build();
		JiraCardDTO doingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(JiraCardField.builder().build()).build())
			.build();
		JiraCardDTO testingJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(JiraCardField.builder().build()).build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(doingJiraCard);
				add(blockedJiraCard);
				add(testingJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("Doing").build(),
						TargetField.builder().name("Done").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(jiraCardDTOCaptor.capture(), anyList(), any());
		assertEquals(5, jiraCardDTOCaptor.getValue().size());
		assertEquals(doingJiraCard, jiraCardDTOCaptor.getValue().get(2));
		assertEquals(blockedJiraCard, jiraCardDTOCaptor.getValue().get(3));
		assertEquals(testingJiraCard, jiraCardDTOCaptor.getValue().get(4));
	}

	@Test
	void shouldAddFixedFieldsWhenItIsNotInSettingsFields() throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("key-target1").build(),
						TargetField.builder().name("fake-target2").flag(false).key("key-target2").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), csvNewFieldsCaptor.capture());
		assertEquals(24, csvFieldsCaptor.getValue().size());
		BoardCSVConfig targetValue = csvNewFieldsCaptor.getValue().get(0);
		assertEquals("baseInfo.fields.customFields.key-target1", targetValue.getValue());
		assertEquals("fake-target1", targetValue.getLabel());
		assertEquals("key-target1", targetValue.getOriginKey());
	}

	@Test
	void shouldAddFixedFieldsWhenItIsNotInSettingsFieldsAndCardHasOriginCycleTime() throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.originCycleTime(List.of(CycleTimeInfo.builder().column("BLOCKED").day(30.7859).build()))
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("key-target1").build(),
						TargetField.builder().name("fake-target2").flag(false).key("key-target2").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), anyList());
		assertEquals(25, csvFieldsCaptor.getValue().size());
		BoardCSVConfig targetValue = csvFieldsCaptor.getValue().get(23);
		assertEquals("cardCycleTime.steps.review", targetValue.getValue());
		assertEquals("Review Days", targetValue.getLabel());
		assertNull(targetValue.getOriginKey());
	}

	@Test
	void shouldAddFixedFieldsWhenBaseInfoExistOriginKey() throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.originCycleTime(List.of(CycleTimeInfo.builder().column("BLOCKED").day(30.7859).build()))
			.build();
		Map<String, JsonElement> customFields = blockedJiraCard.getBaseInfo().getFields().getCustomFields();
		customFields.put("customfield_1001", JsonNull.INSTANCE);
		customFields.put("customfield_1010", new JsonPrimitive(true));
		customFields.put("customfield_1234", new JsonArray());

		List<JiraCardDTO> nonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(nonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(
						TargetField.builder().name("fake-issuetype").flag(true).key("customfield_1001").build(),
						TargetField.builder().name("fake-issuetype2").flag(true).key("customfield_1002").build(),
						TargetField.builder().name("fake-issuetype3").flag(true).key("customfield_1008").build(),
						TargetField.builder().name("fake-issuetype4").flag(true).key("customfield_1010").build(),
						TargetField.builder().name("fake-issuetype5").flag(true).key("customfield_1003").build(),
						TargetField.builder().name("fake-issuetype6").flag(true).key("customfield_1234").build(),
						TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("key-target1").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), anyList());
		List<BoardCSVConfig> value = csvFieldsCaptor.getValue();

		assertEquals(31, value.size());

		BoardCSVConfig issueTypeValue = value.get(15);
		assertEquals("fake-issuetype", issueTypeValue.getLabel());
		assertEquals("baseInfo.fields.customFields.customfield_1001", issueTypeValue.getValue());
		assertEquals("customfield_1001", issueTypeValue.getOriginKey());

		BoardCSVConfig issueType2Value = value.get(16);
		assertEquals("fake-issuetype2", issueType2Value.getLabel());
		assertEquals("baseInfo.fields.customFields.customfield_1002", issueType2Value.getValue());
		assertEquals("customfield_1002", issueType2Value.getOriginKey());

		BoardCSVConfig issueType3Value = value.get(17);
		assertEquals("fake-issuetype3", issueType3Value.getLabel());
		assertEquals("baseInfo.fields.customFields.customfield_1008", issueType3Value.getValue());
		assertEquals("customfield_1008", issueType3Value.getOriginKey());

		BoardCSVConfig issueType4Value = value.get(18);
		assertEquals("fake-issuetype4", issueType4Value.getLabel());
		assertEquals("baseInfo.fields.customFields.customfield_1010", issueType4Value.getValue());
		assertEquals("customfield_1010", issueType4Value.getOriginKey());

		BoardCSVConfig issueType5Value = value.get(19);
		assertEquals("fake-issuetype5", issueType5Value.getLabel());
		assertEquals("baseInfo.fields.customFields.customfield_1003", issueType5Value.getValue());
		assertEquals("customfield_1003", issueType5Value.getOriginKey());

		BoardCSVConfig issueType6Value = value.get(20);
		assertEquals("fake-issuetype6", issueType6Value.getLabel());
		assertEquals("baseInfo.fields.customFields.customfield_1234", issueType6Value.getValue());
		assertEquals("customfield_1234", issueType6Value.getOriginKey());

		BoardCSVConfig reworkValue = value.get(29);
		assertEquals("cardCycleTime.steps.review", reworkValue.getValue());
		assertEquals("Review Days", reworkValue.getLabel());
		assertNull(reworkValue.getOriginKey());
	}

	@Test
	void shouldAddFixedFieldsWhenItIsNotInSettingsFieldsAndCardHasOriginCycleTimeAndColumnIsDone()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.originCycleTime(List.of(CycleTimeInfo.builder().column("DONE").day(30.7859).build()))
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("key-target1").build(),
						TargetField.builder().name("fake-target2").flag(false).key("key-target2").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), anyList());
		assertEquals(24, csvFieldsCaptor.getValue().size());
		BoardCSVConfig targetValue = csvFieldsCaptor.getValue().get(23);
		assertEquals("cardCycleTime.steps.review", targetValue.getValue());
		assertEquals("Review Days", targetValue.getLabel());
		assertNull(targetValue.getOriginKey());
	}

	@Test
	void shouldAddFixedFieldsWithCorrectValueFormatWhenCustomFieldValueInstanceOfListAndContainsStringKeyOrValueOrNameOrDisplayName()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		JsonArray jsonArray = new JsonArray();
		jsonArray.add(new JsonObject());
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCardField fields = MOCK_JIRA_CARD();
		fields.getCustomFields().put("json-array", jsonArray);
		fields.getCustomFields().put("json-obj", new JsonObject());
		JiraCardDTO doneJiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder().baseInfo(JiraCard.builder().fields(fields).build()).build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(doneJiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("customfield_1012").build(),
						TargetField.builder().name("fake-target2").flag(true).key("customfield_1013").build(),
						TargetField.builder().name("fake-target3").flag(true).key("customfield_1014").build(),
						TargetField.builder().name("fake-target4").flag(true).key("customfield_1015").build(),
						TargetField.builder().name("fake-target5").flag(false).key("key-target2").build(),
						TargetField.builder().name("fake-target6").flag(true).key("json-array").build(),
						TargetField.builder().name("fake-target7").flag(true).key("json-obj").build()))
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), csvNewFieldsCaptor.capture());

		assertEquals(29, csvFieldsCaptor.getValue().size());
		BoardCSVConfig targetValue1 = csvNewFieldsCaptor.getValue().get(0);
		BoardCSVConfig targetValue2 = csvNewFieldsCaptor.getValue().get(1);
		BoardCSVConfig targetValue3 = csvNewFieldsCaptor.getValue().get(2);
		BoardCSVConfig targetValue4 = csvNewFieldsCaptor.getValue().get(3);
		BoardCSVConfig targetValue5 = csvNewFieldsCaptor.getValue().get(4);
		assertEquals("baseInfo.fields.customFields.customfield_1012[0].name", targetValue1.getValue());
		assertEquals("fake-target1", targetValue1.getLabel());
		assertEquals("customfield_1012", targetValue1.getOriginKey());
		assertEquals("baseInfo.fields.customFields.customfield_1013[0].value", targetValue2.getValue());
		assertEquals("baseInfo.fields.customFields.customfield_1014[0].key", targetValue3.getValue());
		assertEquals("baseInfo.fields.customFields.customfield_1015[0].displayName", targetValue4.getValue());
		assertEquals("baseInfo.fields.customFields.json-array[0]", targetValue5.getValue());
	}

	@Test
	void shouldAddReworkFieldsWhenGenerateSheetGivenReworkStateAndExcludedStatesAndConsiderFlagAsBlock()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCard jiraCard = JiraCard.builder().fields(MOCK_JIRA_CARD()).build();
		JiraCard jiraCard2 = JiraCard.builder().fields(MOCK_JIRA_CARD()).build();
		jiraCard2.getFields().setLastStatusChangeDate(1701251323000L);
		List<JiraCardDTO> jiraCardDTOS = new ArrayList<>(List.of(
				JiraCardDTO.builder()
					.baseInfo(jiraCard)
					.reworkTimesInfos(MOCK_REWORK_TIMES_INFO_LIST())
					.totalReworkTimes(3)
					.build(),
				JiraCardDTO.builder()
					.baseInfo(jiraCard2)
					.reworkTimesInfos(MOCK_REWORK_TIMES_INFO_LIST())
					.totalReworkTimes(3)
					.build()));
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		String[][] fakeSringArray = new String[][] { { "cycle time" }, { "1" }, { "2" }, { "3" }, { "4" } };
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(jiraCardDTOS).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		when(csvFileGenerator.assembleBoardData(anyList(), anyList(), anyList())).thenReturn(fakeSringArray);
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("key-target1").build(),
						TargetField.builder().name("fake-target2").flag(false).key("key-target2").build()))
				.reworkTimesSetting(
						ReworkTimesSetting.builder().reworkState("In Dev").excludedStates(List.of("Review")).build())
				.boardColumns(MOCK_JIRA_BOARD_COLUMN_SETTING_LIST())
				.treatFlagCardAsBlock(Boolean.TRUE)
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), anyList());
		verify(fileRepository).createCSVFileByType(eq(TEST_UUID), anyString(), csvSheetCaptor.capture(),
				eq(FilePrefixType.BOARD_REPORT_PREFIX));

		assertEquals(24, csvFieldsCaptor.getValue().size());
		BoardCSVConfig targetValue = csvFieldsCaptor.getValue().get(23);
		assertEquals("cardCycleTime.steps.review", targetValue.getValue());
		assertEquals("Review Days", targetValue.getLabel());
		assertNull(targetValue.getOriginKey());

		assertEquals(5, csvSheetCaptor.getValue().length);
		assertEquals("cycle time", csvSheetCaptor.getValue()[0][0]);
		assertEquals("Rework: total - In dev", csvSheetCaptor.getValue()[0][1]);
		assertEquals("Rework: from Block", csvSheetCaptor.getValue()[0][2]);
		assertEquals("Rework: from Waiting for testing", csvSheetCaptor.getValue()[0][3]);
		assertEquals("Rework: from Testing", csvSheetCaptor.getValue()[0][4]);
		assertEquals("Rework: from Done", csvSheetCaptor.getValue()[0][5]);
	}

	@Test
	void shouldAddReworkFieldsWhenGenerateSheetGivenReworkStateAndExcludedStatesAndNotConsiderFlagAsBlock()
			throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCard jiraCard = JiraCard.builder().fields(MOCK_JIRA_CARD()).build();
		JiraCard jiraCard2 = JiraCard.builder().fields(MOCK_JIRA_CARD()).build();
		jiraCard2.getFields().setLastStatusChangeDate(1701251323000L);
		List<JiraCardDTO> jiraCardDTOS = new ArrayList<>(List.of(
				JiraCardDTO.builder()
					.baseInfo(jiraCard)
					.reworkTimesInfos(MOCK_REWORK_TIMES_INFO_LIST())
					.totalReworkTimes(3)
					.build(),
				JiraCardDTO.builder()
					.baseInfo(jiraCard2)
					.reworkTimesInfos(MOCK_REWORK_TIMES_INFO_LIST())
					.totalReworkTimes(3)
					.build()));
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		List<JiraCardDTO> NonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(jiraCardDTOS).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(NonDoneJiraCardDTOList).build())
			.build();
		String[][] fakeSringArray = new String[][] { { "cycle time" }, { "1" }, { "2" }, { "3" }, { "4" } };
		when(csvFileGenerator.assembleBoardData(anyList(), anyList(), anyList())).thenReturn(fakeSringArray);
		kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
			.jiraBoardSetting(JiraBoardSetting.builder()
				.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
						RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
				.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
						TargetField.builder().name("fake-target1").flag(true).key("key-target1").build(),
						TargetField.builder().name("fake-target2").flag(false).key("key-target2").build()))
				.reworkTimesSetting(
						ReworkTimesSetting.builder().reworkState("In Dev").excludedStates(List.of("Review")).build())
				.boardColumns(MOCK_JIRA_BOARD_COLUMN_SETTING_LIST())
				.treatFlagCardAsBlock(Boolean.FALSE)
				.build())
			.csvTimeStamp(CSV_TIME_STAMP)
			.startTime(START_TIME)
			.endTime(END_TIME)
			.timezone("Asia/Shanghai")
			.build(), cardCollectionInfo);

		verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), anyList());
		verify(fileRepository).createCSVFileByType(eq(TEST_UUID), anyString(), csvSheetCaptor.capture(),
				eq(FilePrefixType.BOARD_REPORT_PREFIX));

		assertEquals(24, csvFieldsCaptor.getValue().size());
		BoardCSVConfig targetValue = csvFieldsCaptor.getValue().get(23);
		assertEquals("cardCycleTime.steps.review", targetValue.getValue());
		assertEquals("Review Days", targetValue.getLabel());
		assertNull(targetValue.getOriginKey());

		assertEquals(5, csvSheetCaptor.getValue().length);
		assertEquals("cycle time", csvSheetCaptor.getValue()[0][0]);
		assertEquals("Rework: total - In dev", csvSheetCaptor.getValue()[0][1]);
		assertEquals("Rework: from Block", csvSheetCaptor.getValue()[0][2]);
		assertEquals("Rework: from Waiting for testing", csvSheetCaptor.getValue()[0][3]);
		assertEquals("Rework: from Testing", csvSheetCaptor.getValue()[0][4]);
		assertEquals("Rework: from Done", csvSheetCaptor.getValue()[0][5]);
	}

	private static Stream<GenerateReportRequest> generateReportRequest() {
		return Stream.of(
				GenerateReportRequest.builder()
					.jiraBoardSetting(
							JiraBoardSetting.builder()
								.boardColumns(List.of(
										RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
										RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
								.targetFields(List.of(TargetField.builder().name("Doing").build(),
										TargetField.builder().name("Done").build()))
								.build())
					.csvTimeStamp(CSV_TIME_STAMP)
					.startTime(START_TIME)
					.endTime(END_TIME)
					.timezone("Asia/Shanghai")
					.build(),
				GenerateReportRequest.builder()
					.jiraBoardSetting(JiraBoardSetting.builder()
						.boardColumns(List.of(
								RequestJiraBoardColumnSetting.builder().name("ANALYSIS").value("Analysis").build(),
								RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
						.targetFields(List.of(TargetField.builder().name("Doing").build(),
								TargetField.builder().name("Done").build()))
						.build())
					.csvTimeStamp(CSV_TIME_STAMP)
					.startTime(START_TIME)
					.endTime(END_TIME)
					.timezone("Asia/Shanghai")
					.build(),
				GenerateReportRequest.builder()
					.jiraBoardSetting(
							JiraBoardSetting.builder()
								.boardColumns(List.of(
										RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
										RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
								.targetFields(List.of(TargetField.builder().name("Doing").build(),
										TargetField.builder().name("Done").build()))
								.build())
					.csvTimeStamp(CSV_TIME_STAMP)
					.startTime(START_TIME)
					.endTime(END_TIME)
					.timezone("Asia/Shanghai")
					.build());
	}

	@Test
	void shouldAddFixedFieldsToFirstWhenCycleTimeDontExist() throws URISyntaxException {
		URI uri = new URI("site-uri");
		when(urlGenerator.getUri(any())).thenReturn(uri);
		when(jiraService.getJiraBoardConfig(any(), any(), any())).thenReturn(JiraBoardConfigDTO.builder().build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(List
				.of(JiraColumnDTO.builder().value(ColumnValue.builder().statuses(List.of("BLOCKED")).build()).build()))
			.build());
		JiraCardDTO jiraCardDTO = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.build();
		JiraCardDTO blockedJiraCard = JiraCardDTO.builder()
			.baseInfo(JiraCard.builder().fields(MOCK_JIRA_CARD()).build())
			.originCycleTime(List.of(CycleTimeInfo.builder().column("BLOCKED").day(30.7859).build()))
			.build();

		List<JiraCardDTO> nonDoneJiraCardDTOList = new ArrayList<>() {
			{
				add(blockedJiraCard);
			}
		};
		FetchedData.CardCollectionInfo cardCollectionInfo = FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(CardCollection.builder().jiraCardDTOList(List.of(jiraCardDTO)).build())
			.nonDoneCardCollection(CardCollection.builder().jiraCardDTOList(nonDoneJiraCardDTOList).build())
			.build();

		try (MockedStatic<BoardCSVConfigEnum> mockStatic = mockStatic(BoardCSVConfigEnum.class)) {
			BoardCSVConfigEnum[] boardCSVConfigEnumArray = new BoardCSVConfigEnum[] { ISSUE_KEY, SUMMARY, REVIEW_DAYS };
			mockStatic.when(BoardCSVConfigEnum::values).thenReturn(boardCSVConfigEnumArray);
			kanbanCsvService.generateCsvInfo(TEST_UUID, GenerateReportRequest.builder()
				.jiraBoardSetting(JiraBoardSetting.builder()
					.boardColumns(List.of(RequestJiraBoardColumnSetting.builder().name("TODO").value("To do").build(),
							RequestJiraBoardColumnSetting.builder().name("DOING").value("In dev").build()))
					.targetFields(List.of(TargetField.builder().name("assignee").flag(true).key("key-assignee").build(),
							TargetField.builder().name("fake-target1").flag(true).key("key-target1").build()))
					.build())
				.csvTimeStamp(CSV_TIME_STAMP)
				.startTime(START_TIME)
				.endTime(END_TIME)
				.timezone("Asia/Shanghai")
				.build(), cardCollectionInfo);

			verify(csvFileGenerator).assembleBoardData(anyList(), csvFieldsCaptor.capture(), anyList());
			List<BoardCSVConfig> value = csvFieldsCaptor.getValue();

			assertEquals(6, value.size());

			BoardCSVConfig assigneeValue = value.get(0);
			assertEquals("baseInfo.fields.customFields.key-assignee", assigneeValue.getValue());
			assertEquals("assignee", assigneeValue.getLabel());
			assertNotNull(assigneeValue.getOriginKey());

			BoardCSVConfig targetValue = value.get(1);
			assertEquals("baseInfo.fields.customFields.key-target1", targetValue.getValue());
			assertEquals("fake-target1", targetValue.getLabel());
			assertNotNull(targetValue.getOriginKey());

			BoardCSVConfig issueValue = value.get(2);
			assertEquals("baseInfo.key", issueValue.getValue());
			assertEquals("Issue key", issueValue.getLabel());
			assertNull(issueValue.getOriginKey());

			BoardCSVConfig summaryValue = value.get(3);
			assertEquals("baseInfo.fields.summary", summaryValue.getValue());
			assertEquals("Summary", summaryValue.getLabel());
			assertNull(summaryValue.getOriginKey());

			BoardCSVConfig reworkValue = value.get(4);
			assertEquals("cardCycleTime.steps.review", reworkValue.getValue());
			assertEquals("Review Days", reworkValue.getLabel());
			assertNull(reworkValue.getOriginKey());

			BoardCSVConfig originBlockValue = value.get(5);
			assertEquals("cycleTimeFlat.BLOCKED", originBlockValue.getValue());
			assertEquals("OriginCycleTime: BLOCKED", originBlockValue.getLabel());
			assertNull(originBlockValue.getOriginKey());
		}
	}

}
