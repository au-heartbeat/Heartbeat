package heartbeat.service.report;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import heartbeat.client.dto.board.jira.Assignee;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Sprint;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.controller.board.dto.request.CardStepsEnum;
import heartbeat.controller.board.dto.response.CardCycleTime;
import heartbeat.controller.board.dto.response.CardParent;
import heartbeat.controller.board.dto.response.Fields;
import heartbeat.controller.board.dto.response.IssueType;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraProject;
import heartbeat.controller.board.dto.response.Priority;
import heartbeat.controller.board.dto.response.Reporter;
import heartbeat.controller.board.dto.response.StepsDay;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.AvgPipelineChangeFailureRate;
import heartbeat.controller.report.dto.response.AvgPipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.AvgLeadTimeForChanges;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.ClassificationInfo;
import heartbeat.controller.report.dto.response.CycleTime;
import heartbeat.controller.report.dto.response.CycleTimeForSelectedStepItem;
import heartbeat.controller.report.dto.response.DailyDeploymentCount;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequencyOfPipeline;
import heartbeat.controller.report.dto.response.PipelineChangeFailureRate;
import heartbeat.controller.report.dto.response.PipelineChangeFailureRateOfPipeline;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.PipelineMeanTimeToRecoveryOfPipeline;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfPipelines;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.Rework;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.repository.FileRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.InputStreamResource;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static heartbeat.repository.FilePrefixType.BOARD_REPORT_PREFIX;
import static heartbeat.repository.FilePrefixType.METRIC_REPORT_PREFIX;
import static heartbeat.repository.FilePrefixType.PIPELINE_REPORT_PREFIX;
import static heartbeat.tools.TimeUtils.mockTimeStamp;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CSVFileGeneratorTest {

	@Mock
	FileRepository fileRepository;

	@InjectMocks
	CSVFileGenerator csvFileGenerator;

	String mockTimeStamp = "168369327000";

	public static final String TEST_UUID = "test-uuid";

	@Nested
	class ConvertPipelineDataToCSV {

		@ParameterizedTest
		@MethodSource("generatePipelineCSVInfos")
		void shouldConvertPipelineDataToCsvGivenCommitInfoNotNull(List<PipelineCSVInfo> pipelineCSVInfos,
				String[] respectedData) {
			String[][] expectedSavedData = new String[][] { { "Organization", "Pipeline Name", "Repo Name",
					"Pipeline Step", "Valid", "Build Number", "Pull Number", "Code Committer", "Build Creator",
					"First Code Committed Time In PR", "PR Created Time", "PR Merged Time", "No PR Committed Time",
					"Job Start Time", "Pipeline Start Time", "Pipeline Finish Time", "Non-Workdays (Hours)",
					"Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)", "Pipeline Lead Time (HH:mm:ss)", "Status",
					"Branch", "Revert" }, respectedData };
			csvFileGenerator.convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		@Test
		void shouldConvertPipelineDataToCsvWithoutCreatorName() {
			List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITHOUT_CREATOR_NAME();
			String[][] expectedSavedData = new String[][] {
					{ "Organization", "Pipeline Name", "Repo Name", "Pipeline Step", "Valid", "Build Number",
							"Pull Number", "Code Committer", "Build Creator", "First Code Committed Time In PR",
							"PR Created Time", "PR Merged Time", "No PR Committed Time", "Job Start Time",
							"Pipeline Start Time", "Pipeline Finish Time", "Non-Workdays (Hours)",
							"Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)", "Pipeline Lead Time (HH:mm:ss)",
							"Status", "Branch", "Revert" },
					{ "Thoughtworks-Heartbeat", "Heartbeat", null, ":rocket: Deploy prod", null, "880", null, null,
							null, "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null, "168369327000",
							"168369327000", "1684793037000", "240", "8379303", "16837", "653037000", "passed", "branch",
							"" } };

			csvFileGenerator.convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		@Test
		void shouldConvertPipelineDataToCsvGivenNullCommitInfo() {
			List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITH_NULL_COMMIT_INFO();
			String[][] expectedSavedData = new String[][] {
					{ "Organization", "Pipeline Name", "Repo Name", "Pipeline Step", "Valid", "Build Number",
							"Pull Number", "Code Committer", "Build Creator", "First Code Committed Time In PR",
							"PR Created Time", "PR Merged Time", "No PR Committed Time", "Job Start Time",
							"Pipeline Start Time", "Pipeline Finish Time", "Non-Workdays (Hours)",
							"Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)", "Pipeline Lead Time (HH:mm:ss)",
							"Status", "Branch", "Revert" },
					{ "Thoughtworks-Heartbeat", "Heartbeat", "test-repo", ":rocket: Deploy prod", "true", "880", null,
							"XXXX", null, "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null, "168369327000",
							"168369327000", "1684793037000", "240", "8379303", "16837", "653037000", "passed", "branch",
							"" } };

			csvFileGenerator.convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		@Test
		void shouldConvertPipelineDataToCsvGivenCommitMessageIsRevert() {
			List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITH_MESSAGE_IS_REVERT();
			String[][] expectedSavedData = new String[][] {
					{ "Organization", "Pipeline Name", "Repo Name", "Pipeline Step", "Valid", "Build Number",
							"Pull Number", "Code Committer", "Build Creator", "First Code Committed Time In PR",
							"PR Created Time", "PR Merged Time", "No PR Committed Time", "Job Start Time",
							"Pipeline Start Time", "Pipeline Finish Time", "Non-Workdays (Hours)",
							"Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)", "Pipeline Lead Time (HH:mm:ss)",
							"Status", "Branch", "Revert" },
					{ "Thoughtworks-Heartbeat", "Heartbeat", "test-repo", ":rocket: Deploy prod", null, "880", null,
							"XXXX", null, "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null, "168369327000",
							"168369327000", "1684793037000", "240", "8379303", "16837", "653037000", "passed", "branch",
							"true" } };

			csvFileGenerator.convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		@Test
		void shouldConvertPipelineDataToCsvGivenAuthorIsNull() {
			List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITHOUT_Author_NAME();
			String[][] expectedSavedData = new String[][] {
					{ "Organization", "Pipeline Name", "Repo Name", "Pipeline Step", "Valid", "Build Number",
							"Pull Number", "Code Committer", "Build Creator", "First Code Committed Time In PR",
							"PR Created Time", "PR Merged Time", "No PR Committed Time", "Job Start Time",
							"Pipeline Start Time", "Pipeline Finish Time", "Non-Workdays (Hours)",
							"Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)", "Pipeline Lead Time (HH:mm:ss)",
							"Status", "Branch", "Revert" },
					{ "Thoughtworks-Heartbeat", "Heartbeat", "test-repo", ":rocket: Deploy prod", null, "880", null,
							null, "XXX", "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null, "168369327000",
							"168369327000", "1684793037000", "240", "8379303", "16837", "653037000", "passed", "branch",
							"" } };

			csvFileGenerator.convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		@Test
		void shouldConvertPipelineDataToCsvGivenTwoOrganizationsPipeline() {
			List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_TWO_ORGANIZATIONS_PIPELINE_CSV_DATA();

			String[][] expectedSavedData = new String[][] {
					{ "Organization", "Pipeline Name", "Repo Name", "Pipeline Step", "Valid", "Build Number",
							"Pull Number", "Code Committer", "Build Creator", "First Code Committed Time In PR",
							"PR Created Time", "PR Merged Time", "No PR Committed Time", "Job Start Time",
							"Pipeline Start Time", "Pipeline Finish Time", "Non-Workdays (Hours)",
							"Total Lead Time (HH:mm:ss)", "PR Lead Time (HH:mm:ss)", "Pipeline Lead Time (HH:mm:ss)",
							"Status", "Branch", "Revert" },
					{ "Thoughtworks-Heartbeat", "Heartbeat", "test-repo", ":rocket: Deploy prod", "true", "880", "1",
							"test-committer", "XXXX", "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null,
							"168369327000", "168369327000", "1684793037000", "240", "8379303", "16837", "653037000",
							"passed", "branch", "" },
					{ "Thoughtworks-Heartbeat", "Heartbeat", "test-repo", ":rocket: Deploy prod", "true", "880", null,
							"XXXX", null, "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null, "168369327000",
							"168369327000", "1684793037000", "240", "8379303", "16837", "653037000", "passed", "branch",
							"" },
					{ "Thoughtworks-Foxtel", "Heartbeat1", "test-repo", ":rocket: Deploy prod", "true", "880", null,
							null, "XXXX", "2023-05-08T07:18:18Z", "168369327000", "1683793037000", null, "168369327000",
							"168369327000", "1684793037000", "240", "8379303", "16837", "653037000", "passed", "branch",
							"" } };

			csvFileGenerator.convertPipelineDataToCSV(TEST_UUID, pipelineCSVInfos, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		private static Stream<Arguments> generatePipelineCSVInfos() {
			return Stream.of(
					Arguments.of(PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA(),
							new String[] { "Thoughtworks-Heartbeat", "Heartbeat", "test-repo", ":rocket: Deploy prod",
									"true", "880", "1", "XXXX", null, "2023-05-08T07:18:18Z", "168369327000",
									"1683793037000", null, "168369327000", "168369327000", "1684793037000", "240",
									"8379303", "16837", "653037000", "passed", "branch", "" }),
					Arguments.of(PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITH_PIPELINE_STATUS_IS_CANCELED(),
							new String[] { "Thoughtworks-Heartbeat", "Heartbeat", null, ":rocket: Deploy prod", "true",
									"880", null, "XXXX", null, "2023-05-08T07:18:18Z", "168369327000", "1683793037000",
									null, "168369327000", "168369327000", "1684793037000", "240", "8379303", "16837",
									"653037000", "canceled", "branch", "" }),
					Arguments.of(PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITHOUT_CREATOR(),
							new String[] { "Thoughtworks-Heartbeat", "Heartbeat", null, ":rocket: Deploy prod", null,
									"880", null, "XXXX", null, "2023-05-08T07:18:18Z", "168369327000", "1683793037000",
									null, "1683793037000", "168369327000", "1684793037000", "240", "8379303", "16837",
									"653037000", "passed", "branch", "" }));
		}

	}

	@Nested
	class GetDataFromCSV {

		@Test
		void shouldThrowExceptionWhenTimeStampIsIllegal() {
			String mockTimeRangeTimeStampWithBackSlash = mockTimeStamp(2021, 4, 9, 0, 0, 0) + "\\";
			String mockTimeRangeTimeStampWithSlash = mockTimeStamp(2021, 4, 9, 0, 0, 0) + "/";
			String mockTimeRangeTimeStampWithPoint = mockTimeStamp(2021, 4, 9, 0, 0, 0) + "..";

			assertThrows(IllegalArgumentException.class, () -> csvFileGenerator.getDataFromCSV(ReportType.METRIC,
					TEST_UUID, mockTimeRangeTimeStampWithBackSlash));
			assertThrows(IllegalArgumentException.class, () -> csvFileGenerator.getDataFromCSV(ReportType.METRIC,
					TEST_UUID, mockTimeRangeTimeStampWithSlash));
			assertThrows(IllegalArgumentException.class, () -> csvFileGenerator.getDataFromCSV(ReportType.METRIC,
					TEST_UUID, mockTimeRangeTimeStampWithPoint));
		}

		@Test
		void shouldReadMetricCsvDataWhenReportTypeIsMetric() throws IOException {
			String mockTimeRangeTimeStamp = "123-456-789";

			when(fileRepository.readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp, METRIC_REPORT_PREFIX))
				.thenReturn(new InputStreamResource(new ByteArrayInputStream("csv data".getBytes())));

			InputStreamResource dataFromCSV = csvFileGenerator.getDataFromCSV(ReportType.METRIC, TEST_UUID,
					mockTimeRangeTimeStamp);

			InputStream inputStream = dataFromCSV.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(inputStream)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals("csv data", returnData);
			verify(fileRepository, times(1)).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					METRIC_REPORT_PREFIX);
			verify(fileRepository, never()).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					PIPELINE_REPORT_PREFIX);
			verify(fileRepository, never()).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					BOARD_REPORT_PREFIX);
		}

		@Test
		void shouldReadPipelineCsvDataWhenReportTypeIsPipeline() throws IOException {
			String mockTimeRangeTimeStamp = "123-456-789";

			when(fileRepository.readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp, PIPELINE_REPORT_PREFIX))
				.thenReturn(new InputStreamResource(new ByteArrayInputStream("csv data".getBytes())));

			InputStreamResource dataFromCSV = csvFileGenerator.getDataFromCSV(ReportType.PIPELINE, TEST_UUID,
					mockTimeRangeTimeStamp);

			InputStream inputStream = dataFromCSV.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(inputStream)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals("csv data", returnData);
			verify(fileRepository, never()).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					METRIC_REPORT_PREFIX);
			verify(fileRepository, times(1)).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					PIPELINE_REPORT_PREFIX);
			verify(fileRepository, never()).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					BOARD_REPORT_PREFIX);
		}

		@Test
		void shouldReadBoardCsvDataWhenReportTypeIsBoard() throws IOException {
			String mockTimeRangeTimeStamp = "123-456-789";

			when(fileRepository.readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp, BOARD_REPORT_PREFIX))
				.thenReturn(new InputStreamResource(new ByteArrayInputStream("csv data".getBytes())));

			InputStreamResource dataFromCSV = csvFileGenerator.getDataFromCSV(ReportType.BOARD, TEST_UUID,
					mockTimeRangeTimeStamp);

			InputStream inputStream = dataFromCSV.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(inputStream)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals("csv data", returnData);
			verify(fileRepository, never()).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					METRIC_REPORT_PREFIX);
			verify(fileRepository, never()).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					PIPELINE_REPORT_PREFIX);
			verify(fileRepository, times(1)).readStringFromCsvFile(TEST_UUID, mockTimeRangeTimeStamp,
					BOARD_REPORT_PREFIX);
		}

	}

	@Nested
	class AssembleBoardData {

		@Test
		void shouldAssembleBoardDataSuccess() {
			CardCycleTime cardCycleTime = CardCycleTime.builder()
				.name("ADM-489")
				.total(0.90)
				.steps(StepsDay.builder().development(0.90).build())
				.build();
			JiraCardDTO normalCard = JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("ADM-489")
					.fields(JiraCardField.builder()
						.summary("summary")
						.issuetype(IssueType.builder().name("issue type").build())
						.status(Status.builder().displayValue("done").build())
						.storyPoints(2)
						.project(JiraProject.builder().id("10001").key("ADM").name("Auto Dora Metrics").build())
						.priority(Priority.builder().name("Medium").build())
						.labels(Collections.emptyList())
						.lastStatusChangeDate(123L)
						.assignee(Assignee.builder().displayName("test-assignee").build())
						.reporter(Reporter.builder().displayName("test-reporter").build())
						.parent(CardParent.builder().fields(Fields.builder().summary("parent-summary").build()).build())
						.sprint(Sprint.builder().name("test-sprint").build())
						.build())
					.build())
				.totalCycleTimeDivideStoryPoints("0.90")
				.cardCycleTime(cardCycleTime)
				.build();
			JiraCardDTO noBaseInfoCard = JiraCardDTO.builder()
				.totalCycleTimeDivideStoryPoints("0.90")
				.cardCycleTime(cardCycleTime)
				.build();
			JiraCardDTO noFieldsCard = JiraCardDTO.builder()
				.baseInfo(JiraCard.builder().key("ADM-489").build())
				.totalCycleTimeDivideStoryPoints("0.90")
				.cardCycleTime(cardCycleTime)
				.build();
			JiraCardDTO noCycleTimeCard = JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("ADM-489")
					.fields(JiraCardField.builder()
						.summary("summary")
						.issuetype(IssueType.builder().name("issue type").build())
						.status(Status.builder().displayValue("done").build())
						.storyPoints(2)
						.project(JiraProject.builder().id("10001").key("ADM").name("Auto Dora Metrics").build())
						.priority(Priority.builder().name("Medium").build())
						.labels(Collections.emptyList())
						.build())
					.build())
				.totalCycleTimeDivideStoryPoints("0.90")
				.build();

			List<JiraCardDTO> cardDTOList = List.of(normalCard, noBaseInfoCard, noFieldsCard, noCycleTimeCard);
			List<BoardCSVConfig> fields = BoardCsvFixture.MOCK_ALL_FIELDS();
			List<BoardCSVConfig> extraFields = BoardCsvFixture.MOCK_EXTRA_FIELDS();
			String[] expectKey = { "Issue key", "Summary", "Issue Type", "Status", "Status Date", "Story Points",
					"assignee", "Reporter", "Project Key", "Project Name", "Priority", "Parent Summary", "Sprint",
					"Labels", "Cycle Time", "Story point estimate", "Flagged", "1010", "1011",
					"Cycle Time / Story Points", "Todo Days", "Analysis Days", "Design Days", "In Dev Days",
					"Waiting For Testing Days", "Testing Days", "Block Days", "Review Days",
					"Waiting For Deployment Days", "OriginCycleTime: DOING", "OriginCycleTime: BLOCKED" };
			String[] expectNormalCardValue = { "ADM-489", "summary", "issue type", null, "1970-01-01", "2.0",
					"test-assignee", "test-reporter", "ADM", "Auto Dora Metrics", "Medium", "parent-summary",
					"test-sprint", "", "0.90", null, null, null, null, "0.45", "0", "0", "0", "0.90", "0", "0", "0",
					"0", "0", null, null };
			String[] expectNoBaseInfoCardValue = { null, null, null, null, null, null, null, null, null, null, null,
					null, null, null, "0.90", null, null, null, null, "", "0", "0", "0", "0.90", "0", "0", "0", "0",
					"0", null, null };
			String[] expectNoFieldsCardValue = { "ADM-489", null, null, null, null, null, null, null, null, null, null,
					null, null, null, "0.90", null, null, null, null, "", "0", "0", "0", "0.90", "0", "0", "0", "0",
					"0", null, null };
			String[] expectNoCycleTimeCardValue = { "ADM-489", "summary", "issue type", null, null, "2.0", null, null,
					"ADM", "Auto Dora Metrics", "Medium", null, null, "", null, null, null, null, null, null, null,
					null, null, null, null, null, null, null, null, null, null };

			String[][] result = csvFileGenerator.assembleBoardData(cardDTOList, fields, extraFields);

			assertEquals(5, result.length);
			assertArrayEquals(expectKey, result[0]);
			assertArrayEquals(expectNormalCardValue, result[1]);
			assertArrayEquals(expectNoBaseInfoCardValue, result[2]);
			assertArrayEquals(expectNoFieldsCardValue, result[3]);
			assertArrayEquals(expectNoCycleTimeCardValue, result[4]);
		}

	}

	@Nested
	class GetExtraDataPerRow {

		@Test
		void shouldGetExtraDataPerRowIsNullWhenElementMapIsNull() {
			List<BoardCSVConfig> extraFields = BoardCsvFixture.MOCK_EXTRA_FIELDS();
			BoardCSVConfig extraField = extraFields.get(0);

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(null, extraField);

			assertNull(extraDataPerRow);
		}

		@Test
		void shouldGetExtraDataPerRowWhenFieldIsNull() {
			List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();

			Object elementMap = cardDTOList.get(0).getBaseInfo().getFields().getCustomFields();
			BoardCSVConfig extraField = BoardCSVConfig.builder()
				.label("Story point estimate")
				.value("baseInfo.fields.customFields.customfield_1001")
				.originKey("customfield_1001")
				.build();

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(elementMap, extraField);

			assertEquals("", extraDataPerRow);
		}

		@Test
		void shouldGetExtraDataPerRowWhenFieldIsNullAndExtraFieldContainOriginCycleTime() {
			List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();

			Object elementMap = cardDTOList.get(0).getBaseInfo().getFields().getCustomFields();
			BoardCSVConfig extraField = BoardCSVConfig.builder()
				.label("OriginCycleTime")
				.value("baseInfo.fields.customFields.customfield_1001")
				.originKey("customfield_1001")
				.build();

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(elementMap, extraField);

			assertEquals("0", extraDataPerRow);
		}

		@Test
		void shouldGetExtraDataPerRowWhenFieldValueIsDouble() {
			List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();

			Object elementMap = cardDTOList.get(0).getBaseInfo().getFields().getCustomFields();
			BoardCSVConfig extraField = BoardCSVConfig.builder()
				.label("Story point estimate")
				.value("baseInfo.fields.customFields.customfield_1008")
				.originKey("customfield_1008")
				.build();

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(elementMap, extraField);

			assertEquals("1.00", extraDataPerRow);
		}

		@Test
		void shouldGetExtraDataPerRowWhenFieldValueIsNull() {
			List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();

			Object elementMap = cardDTOList.get(0).getBaseInfo().getFields().getCustomFields();
			BoardCSVConfig extraField = BoardCSVConfig.builder()
				.label("Story point estimate")
				.value("baseInfo.fields.customFields.customfield_1010")
				.originKey("customfield_1010")
				.build();

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(elementMap, extraField);

			assertEquals("", extraDataPerRow);
		}

		@Test
		void shouldGetExtraDataPerRowWhenFieldValueIsArray() {
			List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();

			Map<String, JsonElement> elementMap = cardDTOList.get(0).getBaseInfo().getFields().getCustomFields();
			JsonArray jsonElements = new JsonArray();
			jsonElements.add(new JsonObject());
			jsonElements.add(1);
			elementMap.put("customfield_1005", jsonElements);
			BoardCSVConfig extraField = BoardCSVConfig.builder()
				.label("Story point estimate")
				.value("baseInfo.fields.customFields.customfield_1005")
				.originKey("customfield_1005")
				.build();

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(elementMap, extraField);

			assertEquals("None", extraDataPerRow);
		}

		@Test
		void shouldGetExtraDataPerRowWhenFieldValueIsOther() {
			List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();

			Object elementMap = cardDTOList.get(0).getBaseInfo().getFields().getCustomFields();
			BoardCSVConfig extraField = BoardCSVConfig.builder()
				.label("Story point estimate")
				.value("baseInfo.fields.customFields.customfield_1009")
				.originKey("customfield_1009")
				.build();

			String extraDataPerRow = csvFileGenerator.getExtraDataPerRow(elementMap, extraField);

			assertEquals(
					"{hasEpicLinkFieldDependency=false, showField=false, nonEditableReason={reason=reason, message=message}}",
					extraDataPerRow);
		}

	}

	@Nested
	class ConvertMetricDataToCSV {

		@Test
		void shouldConvertMetricDataToCsv() {
			try (MockedStatic<CardStepsEnum> cardStepsEnumMockedStatic = mockStatic(CardStepsEnum.class)) {
				ReportResponse reportResponse = MetricCsvFixture.MOCK_METRIC_CSV_DATA();
				String[][] expectedSavedData = new String[][] { { "Group", "Metrics", "Value" },
						{ "Velocity", "Velocity(Story Point)", "7.0" }, { "Velocity", "Throughput(Cards Count)", "2" },
						{ "Cycle time", "Average cycle time(days/storyPoint)", "4.18" },
						{ "Cycle time", "Average cycle time(days/card)", "9.75" },
						{ "Cycle time", "Total analysis time / Total cycle time(%)", "1087.39" },
						{ "Cycle time", "Total development time / Total cycle time(%)", "62.10" },
						{ "Cycle time", "Total block time / Total cycle time(%)", "0.34" },
						{ "Cycle time", "Total review time / Total cycle time(%)", "37.39" },
						{ "Cycle time", "Total testing time / Total cycle time(%)", "0.17" },
						{ "Cycle time", "Total  time / Total cycle time(%)", "0.17" },
						{ "Cycle time", "Average analysis time(days/storyPoint)", "12.60" },
						{ "Cycle time", "Average analysis time(days/card)", "26.06" },
						{ "Cycle time", "Average development time(days/storyPoint)", "2.60" },
						{ "Cycle time", "Average development time(days/card)", "6.06" },
						{ "Cycle time", "Average block time(days/storyPoint)", "0.01" },
						{ "Cycle time", "Average block time(days/card)", "0.03" },
						{ "Cycle time", "Average review time(days/storyPoint)", "1.56" },
						{ "Cycle time", "Average review time(days/card)", "3.65" },
						{ "Cycle time", "Average testing time(days/storyPoint)", "0.01" },
						{ "Cycle time", "Average testing time(days/card)", "0.02" },
						{ "Cycle time", "Average  time(days/storyPoint)", "0.01" },
						{ "Cycle time", "Average  time(days/card)", "0.02" },
						{ "Classifications", "Issue Type / Bug(Value/Cards count%)", "33.33" },
						{ "Classifications", "Issue Type / Bug(Value/Story point%)", "50.00" },
						{ "Classifications", "Issue Type / Story(Value/Cards count%)", "66.67" },
						{ "Classifications", "Issue Type / Story(Value/Story point%)", "50.00" },
						{ "Deployment frequency", "Heartbeat / Deploy prod / Deployment frequency(Deployments/Day)",
								"0.78" },
						{ "Deployment frequency", "Heartbeat / Deploy prod / Deployment frequency(Deployment times)",
								"0" },
						{ "Deployment frequency",
								"Heartbeat / Check Frontend License / Deployment frequency(Deployments/Day)", "0.56" },
						{ "Deployment frequency",
								"Heartbeat / Check Frontend License / Deployment frequency(Deployment times)", "0" },
						{ "Deployment frequency", "Total / Deployment frequency(Deployments/Day)", "0.67" },
						{ "Deployment frequency", "Total / Deployment frequency(Deployment times)", "0" },
						{ "Lead time for changes", "Heartbeat / Deploy prod / PR Lead Time", "0" },
						{ "Lead time for changes", "Heartbeat / Deploy prod / Pipeline Lead Time", "0.02" },
						{ "Lead time for changes", "Heartbeat / Deploy prod / Total Lead Time", "0.02" },
						{ "Lead time for changes", "Heartbeat / Check Frontend License / PR Lead Time", "0" },
						{ "Lead time for changes", "Heartbeat / Check Frontend License / Pipeline Lead Time", "0.09" },
						{ "Lead time for changes", "Heartbeat / Check Frontend License / Total Lead Time", "0.09" },
						{ "Lead time for changes", "organization1 / repo1 / PR Lead Time", "0" },
						{ "Lead time for changes", "organization1 / repo1 / Pipeline Lead Time", "0.02" },
						{ "Lead time for changes", "organization1 / repo1 / Total Lead Time", "0.02" },
						{ "Lead time for changes", "organization2 / repo2 / PR Lead Time", "0" },
						{ "Lead time for changes", "organization2 / repo2 / Pipeline Lead Time", "0.09" },
						{ "Lead time for changes", "organization2 / repo2 / Total Lead Time", "0.09" },
						{ "Lead time for changes", "Average / PR Lead Time", "0" },
						{ "Lead time for changes", "Average / Pipeline Lead Time", "0.05" },
						{ "Lead time for changes", "Average / Total Lead Time", "0.05" },
						{ "Pipeline change failure rate", "Heartbeat / Deploy prod / Pipeline change failure rate(%)",
								"0" },
						{ "Pipeline change failure rate",
								"Heartbeat / Check Frontend License / Pipeline change failure rate(%)", "0" },
						{ "Pipeline change failure rate", "Average / Pipeline change failure rate(%)", "0" },
						{ "Pipeline mean time to recovery", "Heartbeat / Deploy prod / Pipeline mean time to recovery",
								"0" },
						{ "Pipeline mean time to recovery",
								"Heartbeat / Check Frontend License / Pipeline mean time to recovery", "0" },
						{ "Pipeline mean time to recovery", "Total / Pipeline mean time to recovery", "0" }, };
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("In Dev"))
					.thenReturn(CardStepsEnum.DEVELOPMENT);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Analysis"))
					.thenReturn(CardStepsEnum.ANALYSE);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Block")).thenReturn(CardStepsEnum.BLOCK);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Review"))
					.thenReturn(CardStepsEnum.REVIEW);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Testing"))
					.thenReturn(CardStepsEnum.TESTING);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Other step name"))
					.thenReturn(CardStepsEnum.UNKNOWN);

				csvFileGenerator.convertMetricDataToCSV(TEST_UUID, reportResponse, mockTimeStamp);

				verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
			}

		}

		@Test
		void shouldHasContentWhenGetDataFromCsvGivenDataTypeIsMetric() {
			try (MockedStatic<CardStepsEnum> cardStepsEnumMockedStatic = mockStatic(CardStepsEnum.class)) {
				ReportResponse reportResponse = ReportResponse.builder()
					.velocity(Velocity.builder().velocityForCards(2).velocityForSP(7).build())
					.classificationList(List.of(Classification.builder()
						.fieldName("Issue Type")
						.classificationInfos(List.of(
								ClassificationInfo.builder()
									.name("Bug")
									.cardCountValue(0.3333333333333333)
									.storyPointsValue(0.6)
									.build(),
								ClassificationInfo.builder()
									.name("Story")
									.cardCountValue(0.6666666666666666)
									.storyPointsValue(0.4)
									.build()))
						.build()))
					.cycleTime(CycleTime.builder()
						.totalTimeForCards(29.26)
						.averageCycleTimePerCard(9.75)
						.averageCycleTimePerSP(4.18)
						.swimlaneList(new ArrayList<>(List.of(
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Waiting for deployment")
									.averageTimeForSP(2.6)
									.averageTimeForCards(6.06)
									.totalTime(18.17)
									.build(),
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Analysis")
									.averageTimeForSP(12.6)
									.averageTimeForCards(26.06)
									.totalTime(318.17)
									.build(),
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Design")
									.averageTimeForSP(0.01)
									.averageTimeForCards(0.03)
									.totalTime(0.1)
									.build(),
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Review")
									.averageTimeForSP(1.56)
									.averageTimeForCards(3.65)
									.totalTime(10.94)
									.build(),
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Testing")
									.averageTimeForSP(0.01)
									.averageTimeForCards(0.02)
									.totalTime(0.05)
									.build(),
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Other step name")
									.averageTimeForSP(0.01)
									.averageTimeForCards(0.02)
									.totalTime(0.05)
									.build(),
								CycleTimeForSelectedStepItem.builder()
									.optionalItemName("Waiting for testing")
									.averageTimeForSP(2.6)
									.averageTimeForCards(6.06)
									.totalTime(18.17)
									.build())))
						.build())
					.deploymentFrequency(
							DeploymentFrequency.builder()
								.totalDeployTimes(1)
								.avgDeploymentFrequency(AvgDeploymentFrequency.builder()
									.name("Average")
									.deploymentFrequency(0.67F)
									.build())
								.deploymentFrequencyOfPipelines(List.of(
										DeploymentFrequencyOfPipeline.builder()
											.name("Heartbeat")
											.step(":rocket: Deploy prod")
											.deploymentFrequency(0.78F)
											.deployTimes(1)
											.dailyDeploymentCounts(List
												.of(DailyDeploymentCount.builder().date("10/16/2023").count(1).build()))
											.build(),
										DeploymentFrequencyOfPipeline.builder()
											.name("Heartbeat")
											.step(":mag: Check Frontend License")
											.deploymentFrequency(0.56F)
											.deployTimes(0)
											.dailyDeploymentCounts(List
												.of(DailyDeploymentCount.builder().date("10/16/2023").count(1).build()))
											.build()))
								.build())
					.pipelineChangeFailureRate(PipelineChangeFailureRate.builder()
						.avgPipelineChangeFailureRate(AvgPipelineChangeFailureRate.builder()
							.name("Average")
							.totalTimes(12)
							.totalFailedTimes(0)
							.failureRate(0.0F)
							.build())
						.pipelineChangeFailureRateOfPipelines(List.of(
								PipelineChangeFailureRateOfPipeline.builder()
									.name("Heartbeat")
									.step(":rocket: Deploy prod")
									.failedTimesOfPipeline(0)
									.totalTimesOfPipeline(7)
									.failureRate(0.0F)
									.build(),
								PipelineChangeFailureRateOfPipeline.builder()
									.name("Heartbeat")
									.step(":mag: Check Frontend License")
									.failedTimesOfPipeline(0)
									.totalTimesOfPipeline(5)
									.failureRate(0.0F)
									.build()))
						.build())
					.pipelineMeanTimeToRecovery(PipelineMeanTimeToRecovery.builder()
						.avgPipelineMeanTimeToRecovery(
								AvgPipelineMeanTimeToRecovery.builder().timeToRecovery(BigDecimal.valueOf(0)).build())
						.pipelineMeanTimeToRecoveryOfPipelines(List.of(
								PipelineMeanTimeToRecoveryOfPipeline.builder()
									.timeToRecovery(BigDecimal.valueOf(0))
									.name("Heartbeat")
									.step(":rocket: Deploy prod")
									.build(),
								PipelineMeanTimeToRecoveryOfPipeline.builder()
									.timeToRecovery(BigDecimal.valueOf(0))
									.name("Heartbeat")
									.step(":mag: Check Frontend License")
									.build()))
						.build())
					.leadTimeForChanges(LeadTimeForChanges.builder()
						.leadTimeForChangesOfPipelines(List.of(
								LeadTimeForChangesOfPipelines.builder()
									.name("Heartbeat")
									.step(":rocket: Deploy prod")
									.prLeadTime(0.0)
									.pipelineLeadTime(1.01)
									.totalDelayTime(1.01)
									.build(),
								LeadTimeForChangesOfPipelines.builder()
									.name("Heartbeat")
									.step(":mag: Check Frontend License")
									.prLeadTime(0.0)
									.pipelineLeadTime(5.18)
									.totalDelayTime(5.18)
									.build()))
						.leadTimeForChangesOfSourceControls(List.of())
						.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
							.name("Average")
							.prLeadTime(0.0)
							.pipelineLeadTime(3.0949999999999998)
							.totalDelayTime(3.0949999999999998)
							.build())
						.build())
					.build();
				String[][] expectedSavedData = new String[][] { { "Group", "Metrics", "Value" },
						{ "Velocity", "Velocity(Story Point)", "7.0" }, { "Velocity", "Throughput(Cards Count)", "2" },
						{ "Cycle time", "Average cycle time(days/storyPoint)", "4.18" },
						{ "Cycle time", "Average cycle time(days/card)", "9.75" },
						{ "Cycle time", "Total analysis time / Total cycle time(%)", "1087.39" },
						{ "Cycle time", "Total design time / Total cycle time(%)", "0.34" },
						{ "Cycle time", "Total review time / Total cycle time(%)", "37.39" },
						{ "Cycle time", "Total waiting for testing time / Total cycle time(%)", "62.10" },
						{ "Cycle time", "Total testing time / Total cycle time(%)", "0.17" },
						{ "Cycle time", "Total waiting for deployment time / Total cycle time(%)", "62.10" },
						{ "Cycle time", "Total  time / Total cycle time(%)", "0.17" },
						{ "Cycle time", "Average analysis time(days/storyPoint)", "12.60" },
						{ "Cycle time", "Average analysis time(days/card)", "26.06" },
						{ "Cycle time", "Average design time(days/storyPoint)", "0.01" },
						{ "Cycle time", "Average design time(days/card)", "0.03" },
						{ "Cycle time", "Average review time(days/storyPoint)", "1.56" },
						{ "Cycle time", "Average review time(days/card)", "3.65" },
						{ "Cycle time", "Average waiting for testing time(days/storyPoint)", "2.60" },
						{ "Cycle time", "Average waiting for testing time(days/card)", "6.06" },
						{ "Cycle time", "Average testing time(days/storyPoint)", "0.01" },
						{ "Cycle time", "Average testing time(days/card)", "0.02" },
						{ "Cycle time", "Average waiting for deployment time(days/storyPoint)", "2.60" },
						{ "Cycle time", "Average waiting for deployment time(days/card)", "6.06" },
						{ "Cycle time", "Average  time(days/storyPoint)", "0.01" },
						{ "Cycle time", "Average  time(days/card)", "0.02" },
						{ "Classifications", "Issue Type / Bug(Value/Cards count%)", "33.33" },
						{ "Classifications", "Issue Type / Bug(Value/Story point%)", "60.00" },
						{ "Classifications", "Issue Type / Story(Value/Cards count%)", "66.67" },
						{ "Classifications", "Issue Type / Story(Value/Story point%)", "40.00" },
						{ "Deployment frequency", "Heartbeat / Deploy prod / Deployment frequency(Deployments/Day)",
								"0.78" },
						{ "Deployment frequency", "Heartbeat / Deploy prod / Deployment frequency(Deployment times)",
								"1" },
						{ "Deployment frequency",
								"Heartbeat / Check Frontend License / Deployment frequency(Deployments/Day)", "0.56" },
						{ "Deployment frequency",
								"Heartbeat / Check Frontend License / Deployment frequency(Deployment times)", "0" },
						{ "Deployment frequency", "Total / Deployment frequency(Deployments/Day)", "0.67" },
						{ "Deployment frequency", "Total / Deployment frequency(Deployment times)", "1" },
						{ "Lead time for changes", "Heartbeat / Deploy prod / PR Lead Time", "0" },
						{ "Lead time for changes", "Heartbeat / Deploy prod / Pipeline Lead Time", "0.02" },
						{ "Lead time for changes", "Heartbeat / Deploy prod / Total Lead Time", "0.02" },
						{ "Lead time for changes", "Heartbeat / Check Frontend License / PR Lead Time", "0" },
						{ "Lead time for changes", "Heartbeat / Check Frontend License / Pipeline Lead Time", "0.09" },
						{ "Lead time for changes", "Heartbeat / Check Frontend License / Total Lead Time", "0.09" },
						{ "Lead time for changes", "Average / PR Lead Time", "0" },
						{ "Lead time for changes", "Average / Pipeline Lead Time", "0.05" },
						{ "Lead time for changes", "Average / Total Lead Time", "0.05" },
						{ "Pipeline change failure rate", "Heartbeat / Deploy prod / Pipeline change failure rate(%)",
								"0" },
						{ "Pipeline change failure rate",
								"Heartbeat / Check Frontend License / Pipeline change failure rate(%)", "0" },
						{ "Pipeline change failure rate", "Average / Pipeline change failure rate(%)", "0" },
						{ "Pipeline mean time to recovery", "Heartbeat / Deploy prod / Pipeline mean time to recovery",
								"0" },
						{ "Pipeline mean time to recovery",
								"Heartbeat / Check Frontend License / Pipeline mean time to recovery", "0" },
						{ "Pipeline mean time to recovery", "Total / Pipeline mean time to recovery", "0" } };
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Waiting for deployment"))
					.thenReturn(CardStepsEnum.WAITING_FOR_DEPLOYMENT);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Analysis"))
					.thenReturn(CardStepsEnum.ANALYSE);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Design"))
					.thenReturn(CardStepsEnum.DESIGN);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Review"))
					.thenReturn(CardStepsEnum.REVIEW);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Testing"))
					.thenReturn(CardStepsEnum.TESTING);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Waiting for testing"))
					.thenReturn(CardStepsEnum.WAITING_FOR_TESTING);
				cardStepsEnumMockedStatic.when(() -> CardStepsEnum.fromValue("Other step name"))
					.thenReturn(CardStepsEnum.UNKNOWN);

				csvFileGenerator.convertMetricDataToCSV(TEST_UUID, reportResponse, mockTimeStamp);

				verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
			}
		}

		@Test
		void shouldHasNoContentWhenGetDataFromCsvGivenDataTypeIsMetricAndResponseIsEmpty() {
			ReportResponse reportResponse = MetricCsvFixture.MOCK_EMPTY_METRIC_CSV_DATA();

			String[][] expectedSavedData = new String[][] { { "Group", "Metrics", "Value" } };

			csvFileGenerator.convertMetricDataToCSV(TEST_UUID, reportResponse, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

		@Test
		void shouldHasNoContentForAveragesWhenGetDataFromCsvGivenDataTypeIsMetricAndTheQuantityOfPipelineIsEqualToOne() {
			ReportResponse reportResponse = ReportResponse.builder()
				.rework(Rework.builder().totalReworkTimes(3).totalReworkCards(3).reworkCardsRatio(0.99).build())
				.deploymentFrequency(DeploymentFrequency.builder()
					.avgDeploymentFrequency(
							AvgDeploymentFrequency.builder().name("Average").deploymentFrequency(0.67F).build())
					.deploymentFrequencyOfPipelines(List.of(DeploymentFrequencyOfPipeline.builder()
						.name("Heartbeat")
						.step(":rocket: Deploy prod")
						.deploymentFrequency(0.78F)
						.deployTimes(1)
						.dailyDeploymentCounts(
								List.of(DailyDeploymentCount.builder().date("10/16/2023").count(1).build()))
						.build()))
					.totalDeployTimes(1)
					.build())
				.pipelineChangeFailureRate(PipelineChangeFailureRate.builder()
					.avgPipelineChangeFailureRate(AvgPipelineChangeFailureRate.builder()
						.name("Average")
						.totalTimes(12)
						.totalFailedTimes(0)
						.failureRate(0.0F)
						.build())
					.pipelineChangeFailureRateOfPipelines(List.of(PipelineChangeFailureRateOfPipeline.builder()
						.name("Heartbeat")
						.step(":rocket: Deploy prod")
						.failedTimesOfPipeline(0)
						.totalTimesOfPipeline(7)
						.failureRate(0.0F)
						.build()))
					.build())
				.pipelineMeanTimeToRecovery(PipelineMeanTimeToRecovery.builder()
					.avgPipelineMeanTimeToRecovery(
							AvgPipelineMeanTimeToRecovery.builder().timeToRecovery(BigDecimal.valueOf(0)).build())
					.pipelineMeanTimeToRecoveryOfPipelines(List.of(PipelineMeanTimeToRecoveryOfPipeline.builder()
						.timeToRecovery(BigDecimal.valueOf(0))
						.name("Heartbeat")
						.step(":rocket: Deploy prod")
						.build()))
					.build())
				.leadTimeForChanges(LeadTimeForChanges.builder()
					.leadTimeForChangesOfPipelines(List.of(LeadTimeForChangesOfPipelines.builder()
						.name("Heartbeat")
						.step(":rocket: Deploy prod")
						.prLeadTime(0.0)
						.pipelineLeadTime(1.01)
						.totalDelayTime(1.01)
						.build()))
					.leadTimeForChangesOfSourceControls(List.of())
					.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
						.name("Average")
						.prLeadTime(0.0)
						.pipelineLeadTime(3.0949999999999998)
						.totalDelayTime(3.0949999999999998)
						.build())
					.build())
				.build();
			String[][] expectedSavedData = new String[][] { { "Group", "Metrics", "Value" },
					{ "Rework", "Total rework times", "3" }, { "Rework", "Total rework cards", "3" },
					{ "Rework", "Rework cards ratio(Total rework cards/Throughput%)", "99.00" },
					{ "Deployment frequency", "Heartbeat / Deploy prod / Deployment frequency(Deployments/Day)",
							"0.78" },
					{ "Deployment frequency", "Heartbeat / Deploy prod / Deployment frequency(Deployment times)", "1" },
					{ "Lead time for changes", "Heartbeat / Deploy prod / PR Lead Time", "0" },
					{ "Lead time for changes", "Heartbeat / Deploy prod / Pipeline Lead Time", "0.02" },
					{ "Lead time for changes", "Heartbeat / Deploy prod / Total Lead Time", "0.02" },
					{ "Pipeline change failure rate", "Heartbeat / Deploy prod / Pipeline change failure rate(%)",
							"0" },
					{ "Pipeline mean time to recovery", "Heartbeat / Deploy prod / Pipeline mean time to recovery",
							"0" }, };

			csvFileGenerator.convertMetricDataToCSV(TEST_UUID, reportResponse, mockTimeStamp);

			verify(fileRepository, times(1)).createCSVFileByType(any(), any(), eq(expectedSavedData), any());
		}

	}

}
