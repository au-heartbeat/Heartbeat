package heartbeat.service.report;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.controller.board.dto.response.CardCycleTime;
import heartbeat.controller.board.dto.response.IssueType;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraProject;
import heartbeat.controller.board.dto.response.Priority;
import heartbeat.controller.board.dto.response.StepsDay;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.AvgDevChangeFailureRate;
import heartbeat.controller.report.dto.response.AvgDevMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.AvgLeadTimeForChanges;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.ClassificationNameValuePair;
import heartbeat.controller.report.dto.response.CycleTime;
import heartbeat.controller.report.dto.response.CycleTimeForSelectedStepItem;
import heartbeat.controller.report.dto.response.DailyDeploymentCount;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.DeploymentFrequencyOfPipeline;
import heartbeat.controller.report.dto.response.DevChangeFailureRate;
import heartbeat.controller.report.dto.response.DevChangeFailureRateOfPipeline;
import heartbeat.controller.report.dto.response.DevMeanTimeToRecovery;
import heartbeat.controller.report.dto.response.DevMeanTimeToRecoveryOfPipeline;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfPipelines;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.Rework;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.exception.FileIOException;
import heartbeat.exception.GenerateReportException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.InputStreamResource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static heartbeat.tools.TimeUtils.mockTimeStamp;
import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CSVFileGeneratorTest {

	@InjectMocks
	CSVFileGenerator csvFileGenerator;

	String mockTimeStamp = "168369327000";

	private static void deleteDirectory(File directory) {
		if (directory.exists()) {
			File[] files = directory.listFiles();
			if (files != null) {
				for (File file : files) {
					if (file.isDirectory()) {
						deleteDirectory(file);
					}
					else {
						file.delete();
					}
				}
			}
			directory.delete();
		}
	}

	@Test
	void shouldConvertPipelineDataToCsvGivenCommitInfoNotNull() throws IOException {

		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA();
		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);
		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);

		assertTrue(file.exists());

		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		String firstLine = reader.readLine();
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"true\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvGivenCommitInfoNotNullAndPipelineStateIsCanceled() throws IOException {

		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture
			.MOCK_PIPELINE_CSV_DATA_WITH_PIPELINE_STATUS_IS_CANCELED();

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);

		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);
		assertTrue(file.exists());
		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		String firstLine = reader.readLine();
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"true\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"canceled\",\"branch\",\"\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvWithoutCreator() throws IOException {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITHOUT_CREATOR();
		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);
		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		String firstLine = reader.readLine();

		assertTrue(file.exists());
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"null\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"1683793037000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvWithoutCreatorName() throws IOException {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITHOUT_CREATOR_NAME();
		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);
		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		String firstLine = reader.readLine();

		assertTrue(file.exists());
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"null\",\"880\",,,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvGivenNullCommitInfo() throws IOException {

		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITH_NULL_COMMIT_INFO();
		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);
		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);

		assertTrue(file.exists());

		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		String firstLine = reader.readLine();
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"true\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvGivenCommitMessageIsRevert() throws IOException {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITH_MESSAGE_IS_REVERT();
		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);
		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		String firstLine = reader.readLine();

		assertTrue(file.exists());
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"null\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"true\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvGivenAuthorIsNull() throws IOException {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA_WITHOUT_Author_NAME();
		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);
		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		String firstLine = reader.readLine();

		assertTrue(file.exists());
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"null\",\"880\",,\"XXX\",\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				firstLine);
		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldMakeCsvDirWhenNotExistGivenDataTypeIsPipeline() {
		String csvDirPath = "./csv";
		File csvDir = new File(csvDirPath);
		deleteDirectory(csvDir);
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA();

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);

		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);
		assertTrue(file.exists());
		file.delete();
	}

	@Test
	void shouldHasContentWhenGetDataFromCsvGivenDataTypeIsPipeline() throws IOException {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA();
		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);

		InputStreamResource inputStreamResource = csvFileGenerator.getDataFromCSV(ReportType.PIPELINE, mockTimeStamp);
		InputStream csvDataInputStream = inputStreamResource.getInputStream();
		String csvPipelineData = new BufferedReader(new InputStreamReader(csvDataInputStream)).lines()
			.collect(Collectors.joining("\n"));

		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"\n"
						+ "\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"true\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				csvPipelineData);

		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);
		file.delete();
	}

	@Test
	void shouldHasContentWhenGetDataFromCsvGivenDataTypeIsBoard() throws IOException {
		String[] mockBoardDataRow1 = { "Issue Type", "Reporter" };
		String[] mockBoardDataRow2 = { "ADM-696", "test" };
		String[][] mockBoardData = { mockBoardDataRow1, mockBoardDataRow2 };
		csvFileGenerator.writeDataToCSV(mockTimeStamp, mockBoardData);

		InputStreamResource inputStreamResource = csvFileGenerator.getDataFromCSV(ReportType.BOARD, mockTimeStamp);
		InputStream csvDataInputStream = inputStreamResource.getInputStream();
		String csvPipelineData = new BufferedReader(new InputStreamReader(csvDataInputStream)).lines()
			.collect(Collectors.joining("\n"));

		assertEquals("\"Issue Type\",\"Reporter\"\n\"ADM-696\",\"test\"", csvPipelineData);

		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);
		file.delete();
	}

	@Test
	void shouldConvertPipelineDataToCsvGivenTwoOrganizationsPipeline() throws IOException {

		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_TWO_ORGANIZATIONS_PIPELINE_CSV_DATA();

		csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, mockTimeStamp);

		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);
		assertTrue(file.exists());

		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		assertEquals(
				"\"Organization\",\"Pipeline Name\",\"Pipeline Step\",\"Valid\",\"Build Number\",\"Code Committer\",\"Build Creator\",\"First Code Committed Time In PR\",\"PR Created Time\",\"PR Merged Time\",\"No PR Committed Time\",\"Job Start Time\",\"Pipeline Start Time\",\"Pipeline Finish Time\",\"Non-Workdays (Hours)\",\"Total Lead Time (HH:mm:ss)\",\"PR Lead Time (HH:mm:ss)\",\"Pipeline Lead Time (HH:mm:ss)\",\"Status\",\"Branch\",\"Revert\"",
				headers);

		String firstLine = reader.readLine();
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"true\",\"880\",,\"XXXX\",\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				firstLine);

		String secondLine = reader.readLine();
		assertEquals(
				"\"Thoughtworks-Heartbeat\",\"Heartbeat\",\":rocket: Deploy prod\",\"true\",\"880\",\"XXXX\",,\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				secondLine);

		String thirdLine = reader.readLine();
		assertEquals(
				"\"Thoughtworks-Foxtel\",\"Heartbeat1\",\":rocket: Deploy prod\",\"true\",\"880\",,\"XXXX\",\"2023-05-08T07:18:18Z\",\"168369327000\",\"1683793037000\",,\"168369327000\",\"168369327000\",\"1684793037000\",\"240\",\"8379303\",\"16837\",\"653037000\",\"passed\",\"branch\",\"\"",
				thirdLine);

		reader.close();
		fileInputStream.close();
		file.delete();
	}

	@Test
	void shouldThrowExceptionWhenFileNotExist() {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA();
		assertThrows(FileIOException.class, () -> csvFileGenerator.getDataFromCSV(ReportType.PIPELINE, "123456"));
		assertThrows(FileIOException.class,
				() -> csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, "15469:89/033"));
	}

	@Test
	void shouldConvertMetricDataToCsv() throws IOException {
		ReportResponse reportResponse = MetricCsvFixture.MOCK_METRIC_CSV_DATA();

		csvFileGenerator.convertMetricDataToCSV(reportResponse, mockTimeStamp);

		String fileName = CSVFileNameEnum.METRIC.getValue() + "-" + mockTimeStamp + ".csv";
		File file = new File(fileName);
		assertTrue(file.exists());

		FileInputStream fileInputStream = new FileInputStream(file);
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
		String headers = reader.readLine();
		assertEquals("\"Group\",\"Metrics\",\"Value\"", headers);
		String firstLine = reader.readLine();
		assertEquals("\"Velocity\",\"Velocity(Story Point)\",\"7.0\"", firstLine);
		reader.close();
		fileInputStream.close();
		boolean delete = file.delete();
		assertTrue(delete);
	}

	@Test
	void shouldMakeCsvDirWhenNotExistGivenDataTypeIsMetric() throws IOException {
		String csvDirPath = "./csv";
		File csvDir = new File(csvDirPath);
		deleteDirectory(csvDir);
		ReportResponse reportResponse = MetricCsvFixture.MOCK_METRIC_CSV_DATA();

		csvFileGenerator.convertMetricDataToCSV(reportResponse, mockTimeStamp);

		Path filePath = Path.of(CSVFileNameEnum.METRIC.getValue() + "-" + mockTimeStamp + ".csv");
		assertTrue(Files.exists(filePath));
		Files.deleteIfExists(filePath);
	}

	@Test
	void shouldThrowExceptionWhenMetricCsvNotExist() {
		ReportResponse reportResponse = MetricCsvFixture.MOCK_METRIC_CSV_DATA();

		assertThrows(FileIOException.class, () -> csvFileGenerator.getDataFromCSV(ReportType.METRIC, "1686710104536"));
		assertThrows(FileIOException.class,
				() -> csvFileGenerator.convertMetricDataToCSV(reportResponse, "15469:89/033"));
	}

	@Test
	void shouldThrowExceptionWhenTimeStampIsIllegal() {
		String mockTimeRangeTimeStampWithBackSlash = mockTimeStamp(2021, 4, 9, 0, 0, 0) + "\\";
		String mockTimeRangeTimeStampWithSlash = mockTimeStamp(2021, 4, 9, 0, 0, 0) + "/";
		String mockTimeRangeTimeStampWithPoint = mockTimeStamp(2021, 4, 9, 0, 0, 0) + "..";

		assertThrows(IllegalArgumentException.class,
				() -> csvFileGenerator.getDataFromCSV(ReportType.METRIC, mockTimeRangeTimeStampWithBackSlash));
		assertThrows(IllegalArgumentException.class,
				() -> csvFileGenerator.getDataFromCSV(ReportType.METRIC, mockTimeRangeTimeStampWithSlash));
		assertThrows(IllegalArgumentException.class,
				() -> csvFileGenerator.getDataFromCSV(ReportType.METRIC, mockTimeRangeTimeStampWithPoint));
	}

	@Test
	void shouldHasContentWhenGetDataFromCsvGivenDataTypeIsMetric() throws IOException {
		ReportResponse reportResponse = ReportResponse.builder()
			.velocity(Velocity.builder().velocityForCards(2).velocityForSP(7).build())
			.classificationList(List.of(Classification.builder()
				.fieldName("Issue Type")
				.pairList(List.of(ClassificationNameValuePair.builder().name("Bug").value(0.3333333333333333).build(),
						ClassificationNameValuePair.builder().name("Story").value(0.6666666666666666).build()))
				.build()))
			.cycleTime(CycleTime.builder()
				.totalTimeForCards(29.26)
				.averageCycleTimePerCard(9.75)
				.averageCycleTimePerSP(4.18)
				.swimlaneList(new ArrayList<>(List.of(
						CycleTimeForSelectedStepItem.builder()
							.optionalItemName("In Dev")
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
							.optionalItemName("Block")
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
			.deploymentFrequency(DeploymentFrequency.builder()
				.totalDeployTimes(1)
				.avgDeploymentFrequency(
						AvgDeploymentFrequency.builder().name("Average").deploymentFrequency(0.67F).build())
				.deploymentFrequencyOfPipelines(List.of(
						DeploymentFrequencyOfPipeline.builder()
							.name("Heartbeat")
							.step(":rocket: Deploy prod")
							.deploymentFrequency(0.78F)
							.deployTimes(1)
							.dailyDeploymentCounts(
									List.of(DailyDeploymentCount.builder().date("10/16/2023").count(1).build()))
							.build(),
						DeploymentFrequencyOfPipeline.builder()
							.name("Heartbeat")
							.step(":mag: Check Frontend License")
							.deploymentFrequency(0.56F)
							.deployTimes(0)
							.dailyDeploymentCounts(
									List.of(DailyDeploymentCount.builder().date("10/16/2023").count(1).build()))
							.build()))
				.build())
			.devChangeFailureRate(DevChangeFailureRate.builder()
				.avgDevChangeFailureRate(AvgDevChangeFailureRate.builder()
					.name("Average")
					.totalTimes(12)
					.totalFailedTimes(0)
					.failureRate(0.0F)
					.build())
				.devChangeFailureRateOfPipelines(List.of(
						DevChangeFailureRateOfPipeline.builder()
							.name("Heartbeat")
							.step(":rocket: Deploy prod")
							.failedTimesOfPipeline(0)
							.totalTimesOfPipeline(7)
							.failureRate(0.0F)
							.build(),
						DevChangeFailureRateOfPipeline.builder()
							.name("Heartbeat")
							.step(":mag: Check Frontend License")
							.failedTimesOfPipeline(0)
							.totalTimesOfPipeline(5)
							.failureRate(0.0F)
							.build()))
				.build())
			.devMeanTimeToRecovery(DevMeanTimeToRecovery.builder()
				.avgDevMeanTimeToRecovery(
						AvgDevMeanTimeToRecovery.builder().timeToRecovery(BigDecimal.valueOf(0)).build())
				.devMeanTimeToRecoveryOfPipelines(List.of(
						DevMeanTimeToRecoveryOfPipeline.builder()
							.timeToRecovery(BigDecimal.valueOf(0))
							.name("Heartbeat")
							.step(":rocket: Deploy prod")
							.build(),
						DevMeanTimeToRecoveryOfPipeline.builder()
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
				.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
					.name("Average")
					.prLeadTime(0.0)
					.pipelineLeadTime(3.0949999999999998)
					.totalDelayTime(3.0949999999999998)
					.build())
				.build())
			.build();

		csvFileGenerator.convertMetricDataToCSV(reportResponse, mockTimeStamp);

		InputStreamResource inputStreamResource = csvFileGenerator.getDataFromCSV(ReportType.METRIC, mockTimeStamp);
		InputStream csvDataInputStream = inputStreamResource.getInputStream();
		String metricCsvData = new BufferedReader(new InputStreamReader(csvDataInputStream)).lines()
			.collect(Collectors.joining("\n"));

		assertEquals(metricCsvData,
				"""
						"Group","Metrics","Value"
						"Velocity","Velocity(Story Point)","7.0"
						"Velocity","Throughput(Cards Count)","2"
						"Cycle time","Average cycle time(days/storyPoint)","4.18"
						"Cycle time","Average cycle time(days/card)","9.75"
						"Cycle time","Total development time / Total cycle time","62.10"
						"Cycle time","Total analysis time / Total cycle time","1087.39"
						"Cycle time","Total block time / Total cycle time","0.34"
						"Cycle time","Total review time / Total cycle time","37.39"
						"Cycle time","Total testing time / Total cycle time","0.17"
						"Cycle time","Total  time / Total cycle time","0.17"
						"Cycle time","Total waiting for testing time / Total cycle time","62.10"
						"Cycle time","Average development time(days/storyPoint)","2.60"
						"Cycle time","Average development time(days/card)","6.06"
						"Cycle time","Average analysis time(days/storyPoint)","12.60"
						"Cycle time","Average analysis time(days/card)","26.06"
						"Cycle time","Average block time(days/storyPoint)","0.01"
						"Cycle time","Average block time(days/card)","0.03"
						"Cycle time","Average review time(days/storyPoint)","1.56"
						"Cycle time","Average review time(days/card)","3.65"
						"Cycle time","Average testing time(days/storyPoint)","0.01"
						"Cycle time","Average testing time(days/card)","0.02"
						"Cycle time","Average  time(days/storyPoint)","0.01"
						"Cycle time","Average  time(days/card)","0.02"
						"Cycle time","Average waiting for testing time(days/storyPoint)","2.60"
						"Cycle time","Average waiting for testing time(days/card)","6.06"
						"Classifications","Issue Type / Bug","33.33"
						"Classifications","Issue Type / Story","66.67"
						"Deployment frequency","Heartbeat / Deploy prod / Deployment frequency(Deployments/Day)","0.78"
						"Deployment frequency","Heartbeat / Deploy prod / Deployment frequency(Deployment times)","1"
						"Deployment frequency","Heartbeat / Check Frontend License / Deployment frequency(Deployments/Day)","0.56"
						"Deployment frequency","Heartbeat / Check Frontend License / Deployment frequency(Deployment times)","0"
						"Deployment frequency","Total / Deployment frequency(Deployments/Day)","0.67"
						"Deployment frequency","Total / Deployment frequency(Deployment times)","1"
						"Lead time for changes","Heartbeat / Deploy prod / PR Lead Time","0"
						"Lead time for changes","Heartbeat / Deploy prod / Pipeline Lead Time","0.02"
						"Lead time for changes","Heartbeat / Deploy prod / Total Lead Time","0.02"
						"Lead time for changes","Heartbeat / Check Frontend License / PR Lead Time","0"
						"Lead time for changes","Heartbeat / Check Frontend License / Pipeline Lead Time","0.09"
						"Lead time for changes","Heartbeat / Check Frontend License / Total Lead Time","0.09"
						"Lead time for changes","Average / PR Lead Time","0"
						"Lead time for changes","Average / Pipeline Lead Time","0.05"
						"Lead time for changes","Average / Total Lead Time","0.05"
						"Dev change failure rate","Heartbeat / Deploy prod / Dev change failure rate","0.0000"
						"Dev change failure rate","Heartbeat / Check Frontend License / Dev change failure rate","0.0000"
						"Dev change failure rate","Average / Dev change failure rate","0"
						"Dev mean time to recovery","Heartbeat / Deploy prod / Dev mean time to recovery","0"
						"Dev mean time to recovery","Heartbeat / Check Frontend License / Dev mean time to recovery","0"
						"Dev mean time to recovery","Total / Dev mean time to recovery","0\"""");

		String fileName = CSVFileNameEnum.METRIC.getValue() + "-" + mockTimeStamp + ".csv";
		Files.deleteIfExists(Path.of(fileName));
	}

	@Test
	void shouldHasNoContentWhenGetDataFromCsvGivenDataTypeIsMetricAndResponseIsEmpty() throws IOException {
		ReportResponse reportResponse = MetricCsvFixture.MOCK_EMPTY_METRIC_CSV_DATA();

		csvFileGenerator.convertMetricDataToCSV(reportResponse, mockTimeStamp);
		InputStreamResource inputStreamResource = csvFileGenerator.getDataFromCSV(ReportType.METRIC, mockTimeStamp);
		InputStream csvDataInputStream = inputStreamResource.getInputStream();
		String metricCsvData = new BufferedReader(new InputStreamReader(csvDataInputStream)).lines()
			.collect(Collectors.joining("\n"));

		assertEquals("\"Group\",\"Metrics\",\"Value\"", metricCsvData);

		String fileName = CSVFileNameEnum.BOARD.getValue() + "-" + mockTimeStamp + ".csv";
		Files.deleteIfExists(Path.of(fileName));
	}

	@Test
	void shouldHasNoContentForAveragesWhenGetDataFromCsvGivenDataTypeIsMetricAndTheQuantityOfPipelineIsEqualToOne()
			throws IOException {
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
					.dailyDeploymentCounts(List.of(DailyDeploymentCount.builder().date("10/16/2023").count(1).build()))
					.build()))
				.totalDeployTimes(1)
				.build())
			.devChangeFailureRate(DevChangeFailureRate.builder()
				.avgDevChangeFailureRate(AvgDevChangeFailureRate.builder()
					.name("Average")
					.totalTimes(12)
					.totalFailedTimes(0)
					.failureRate(0.0F)
					.build())
				.devChangeFailureRateOfPipelines(List.of(DevChangeFailureRateOfPipeline.builder()
					.name("Heartbeat")
					.step(":rocket: Deploy prod")
					.failedTimesOfPipeline(0)
					.totalTimesOfPipeline(7)
					.failureRate(0.0F)
					.build()))
				.build())
			.devMeanTimeToRecovery(DevMeanTimeToRecovery.builder()
				.avgDevMeanTimeToRecovery(
						AvgDevMeanTimeToRecovery.builder().timeToRecovery(BigDecimal.valueOf(0)).build())
				.devMeanTimeToRecoveryOfPipelines(List.of(DevMeanTimeToRecoveryOfPipeline.builder()
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
				.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
					.name("Average")
					.prLeadTime(0.0)
					.pipelineLeadTime(3.0949999999999998)
					.totalDelayTime(3.0949999999999998)
					.build())
				.build())
			.build();

		csvFileGenerator.convertMetricDataToCSV(reportResponse, mockTimeStamp);
		InputStreamResource inputStreamResource = csvFileGenerator.getDataFromCSV(ReportType.METRIC, mockTimeStamp);
		InputStream csvDataInputStream = inputStreamResource.getInputStream();
		String metricCsvData = new BufferedReader(new InputStreamReader(csvDataInputStream)).lines()
			.collect(Collectors.joining("\n"));

		assertEquals(metricCsvData, """
				"Group","Metrics","Value"
				"Rework","Total rework times","3"
				"Rework","Total rework cards","3"
				"Rework","Rework cards ratio(Total rework cards/Throughput)","0.9900"
				"Deployment frequency","Heartbeat / Deploy prod / Deployment frequency(Deployments/Day)","0.78"
				"Deployment frequency","Heartbeat / Deploy prod / Deployment frequency(Deployment times)","1"
				"Lead time for changes","Heartbeat / Deploy prod / PR Lead Time","0"
				"Lead time for changes","Heartbeat / Deploy prod / Pipeline Lead Time","0.02"
				"Lead time for changes","Heartbeat / Deploy prod / Total Lead Time","0.02"
				"Dev change failure rate","Heartbeat / Deploy prod / Dev change failure rate","0.0000"
				"Dev mean time to recovery","Heartbeat / Deploy prod / Dev mean time to recovery","0\"""");

		String fileName = CSVFileNameEnum.BOARD.getValue() + "-" + mockTimeStamp + ".csv";
		Files.deleteIfExists(Path.of(fileName));
	}

	@Test
	void shouldThrowGenerateReportExceptionWhenGeneratePipelineCsvAndCsvTimeStampInvalid() {
		List<PipelineCSVInfo> pipelineCSVInfos = PipelineCsvFixture.MOCK_PIPELINE_CSV_DATA();
		assertThrows(GenerateReportException.class,
				() -> csvFileGenerator.convertPipelineDataToCSV(pipelineCSVInfos, "../"));
	}

	@Test
	void shouldThrowGenerateReportExceptionWhenGenerateMetricsCsvAndCsvTimeStampInvalid() {
		ReportResponse reportResponse = MetricCsvFixture.MOCK_METRIC_CSV_DATA_WITH_ONE_PIPELINE();

		assertThrows(GenerateReportException.class,
				() -> csvFileGenerator.convertMetricDataToCSV(reportResponse, "../"));
	}

	@Test
	void shouldThrowIllegalArgumentExceptionWhenFilePathIsError() {
		String fileName = "./app/output/docs/metric-20240310-20240409-127272861371";
		File file = new File(fileName);

		assertThrows(IllegalArgumentException.class, () -> CSVFileGenerator.readStringFromCsvFile(file));
	}

	@Test
	void shouldAssembleBoardDataSuccess() {
		List<JiraCardDTO> cardDTOList = BoardCsvFixture.MOCK_JIRA_CARD_DTO();
		List<BoardCSVConfig> fields = BoardCsvFixture.MOCK_ALL_FIELDS();
		List<BoardCSVConfig> extraFields = BoardCsvFixture.MOCK_EXTRA_FIELDS();
		String[] expectKey = { "Issue key", "Summary", "Issue Type", "Status", "Status Date", "Story Points",
				"assignee", "Reporter", "Project Key", "Project Name", "Priority", "Parent Summary", "Sprint", "Labels",
				"Cycle Time", "Story point estimate", "Flagged", "1010", "1011", "Cycle Time / Story Points",
				"Analysis Days", "In Dev Days", "Waiting Days", "Testing Days", "Block Days", "Review Days",
				"OriginCycleTime: DOING", "OriginCycleTime: BLOCKED" };
		String[] expectNormalCardValue = { "ADM-489", "summary", "issue type", null, "2023-11-28", "2.0", "name",
				"name", "ADM", "Auto Dora Metrics", "Medium", "parent", "sprint 1", "", "0.90", "1.00", "", "", "{}",
				"0.45", "0", "0.90", "0", "0", "0", "0", "0", "0" };

		String[][] result = csvFileGenerator.assembleBoardData(cardDTOList, fields, extraFields);

		assertEquals(4, result.length);
		assertTrue(Arrays.equals(expectKey, result[0]));
		assertTrue(Arrays.equals(expectNormalCardValue, result[1]));
		assertNonNullValue(result[2], List.of(), List.of());
		assertNonNullValue(result[3], List.of(0), List.of("ADM-489"));
	}

	@Test
	void shouldAssembleBoardDataSuccessWhenExistTodoAndNullFields() {
		CardCycleTime cardCycleTime = CardCycleTime.builder()
			.name("ADM-489")
			.total(0.90)
			.steps(StepsDay.builder().development(0.90).build())
			.build();
		List<JiraCardDTO> cardDTOList = List.of(JiraCardDTO.builder()
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
			.cardCycleTime(cardCycleTime)
			.build());
		List<BoardCSVConfig> fields = BoardCsvFixture.MOCK_ALL_WITH_TODO_FIELDS();
		List<BoardCSVConfig> extraFields = BoardCsvFixture.MOCK_EXTRA_FIELDS();
		String[] expectKey = { "Issue key", "Summary", "Issue Type", "Status", "Status Date", "Story Points",
				"assignee", "Reporter", "Project Key", "Project Name", "Priority", "Parent Summary", "Sprint", "Labels",
				"Cycle Time", "Story point estimate", "Flagged", "1010", "1011", "Cycle Time / Story Points",
				"Todo Days", "In Dev Days", "Waiting Days", "Testing Days", "Block Days", "Review Days",
				"OriginCycleTime: DOING", "OriginCycleTime: BLOCKED" };
		String[] expectNormalCardValue = { "ADM-489", "summary", "issue type", null, null, "2.0", null, null, "ADM",
				"Auto Dora Metrics", "Medium", null, null, "", "0.90", null, null, null, null, "0.45", "0", "0.90", "0",
				"0", "0", "0", null, null };

		String[][] result = csvFileGenerator.assembleBoardData(cardDTOList, fields, extraFields);

		assertEquals(2, result.length);
		assertTrue(Arrays.equals(expectKey, result[0]));
		assertTrue(Arrays.equals(expectNormalCardValue, result[1]));
	}

	@Test
	void shouldWriteDataToCSVErrorWhenWriteThrowException() {
		String[] mockBoardDataRow1 = { "Issue Type", "Reporter" };
		String[] mockBoardDataRow2 = { "ADM-696", "test" };
		String[][] mockBoardData = { mockBoardDataRow1, mockBoardDataRow2 };

		assertThrows(FileIOException.class, () -> {
			csvFileGenerator.writeDataToCSV("15469:89/033", mockBoardData);
		});

	}

	@Test
	void shouldWriteDataToCSVErrorWhenFileNameError() {
		String[] mockBoardDataRow1 = { "Issue Type", "Reporter" };
		String[] mockBoardDataRow2 = { "ADM-696", "test" };
		String[][] mockBoardData = { mockBoardDataRow1, mockBoardDataRow2 };

		assertThrows(GenerateReportException.class, () -> {
			csvFileGenerator.writeDataToCSV(mockTimeStamp + "..", mockBoardData);
		});
	}

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

	private void assertNonNullValue(String[] value, List<Integer> nonNullIndex, List<String> otherValue) {
		for (int i = 0; i < value.length; i++) {
			int pos = nonNullIndex.indexOf(i);
			if (pos != -1) {
				assertEquals(otherValue.get(pos), value[i]);
			}
			else {
				assertNull(value[i]);
			}
		}
	}

}
