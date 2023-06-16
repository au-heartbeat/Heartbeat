package heartbeat.service.report;

import com.google.gson.JsonElement;
import heartbeat.client.component.JiraUriGenerator;
import heartbeat.client.dto.board.jira.Assignee;
import heartbeat.client.dto.board.jira.JiraCard;
import heartbeat.client.dto.board.jira.JiraCardField;
import heartbeat.client.dto.board.jira.Status;
import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.controller.board.dto.request.RequestJiraBoardColumnSetting;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.CardCycleTime;
import heartbeat.controller.board.dto.response.CardParent;
import heartbeat.controller.board.dto.response.CycleTimeInfo;
import heartbeat.controller.board.dto.response.FixVersion;
import heartbeat.controller.board.dto.response.IssueType;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.board.dto.response.JiraProject;
import heartbeat.controller.board.dto.response.Priority;
import heartbeat.controller.board.dto.response.Reporter;
import heartbeat.controller.board.dto.response.StepsDay;
import heartbeat.controller.board.dto.response.TargetField;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.ExportCSVRequest;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.response.AvgChangeFailureRate;
import heartbeat.controller.report.dto.response.AvgDeploymentFrequency;
import heartbeat.controller.report.dto.response.AvgLeadTimeForChanges;
import heartbeat.controller.report.dto.response.ChangeFailureRate;
import heartbeat.controller.report.dto.response.Classification;
import heartbeat.controller.report.dto.response.ClassificationNameValuePair;
import heartbeat.controller.report.dto.response.CycleTime;
import heartbeat.controller.report.dto.response.DeploymentFrequency;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfPipelines;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.Velocity;
import heartbeat.service.board.jira.JiraColumnResult;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.pipeline.buildkite.BuildKiteService;
import heartbeat.service.pipeline.buildkite.builder.BuildKiteBuildInfoBuilder;
import heartbeat.service.pipeline.buildkite.builder.BuildKiteJobBuilder;
import heartbeat.service.pipeline.buildkite.builder.DeployInfoBuilder;
import heartbeat.service.pipeline.buildkite.builder.DeployTimesBuilder;
import heartbeat.service.pipeline.buildkite.builder.DeploymentEnvironmentBuilder;
import heartbeat.service.report.calculator.ChangeFailureRateCalculator;
import heartbeat.service.report.calculator.ClassificationCalculator;
import heartbeat.service.report.calculator.CycleTimeCalculator;
import heartbeat.service.report.calculator.DeploymentFrequencyCalculator;
import heartbeat.service.report.calculator.VelocityCalculator;
import heartbeat.service.source.github.GitHubService;
import heartbeat.util.JsonFileReader;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.InputStreamResource;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import static heartbeat.service.report.CycleTimeFixture.JIRA_BOARD_COLUMNS_SETTING;
import static heartbeat.service.report.CycleTimeFixture.MOCK_CARD_COLLECTION;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import static heartbeat.TestFixtures.BUILDKITE_TOKEN;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GenerateReporterServiceTest {

	public static final String SITE_ATLASSIAN_NET = "https://site.atlassian.net";

	@InjectMocks
	GenerateReporterService generateReporterService;

	@Mock
	JiraService jiraService;

	@Mock
	WorkDay workDay;

	@Mock
	ClassificationCalculator classificationCalculator;

	@Mock
	CSVFileGenerator csvFileGenerator;

	@Mock
	VelocityCalculator velocityCalculator;

	Path mockPipelineCsvPath = Path.of("./csv/exportPipelineMetrics-1683734399999.csv");

	Path mockBoardCsvPath = Path.of("./csv/exportBoard-1683734399999.csv");

	@Mock
	private BuildKiteService buildKiteService;

	@Mock
	private GitHubService gitHubService;

	@Mock
	private DeploymentFrequencyCalculator calculateDeploymentFrequency;

	@Mock
	private ChangeFailureRateCalculator calculateChangeFailureRate;

	@Mock
	private CycleTimeCalculator cycleTimeCalculator;

	@Mock
	private LeadTimeForChangesCalculator leadTimeForChangesCalculator;

	@Mock
	private JiraUriGenerator urlGenerator;

	@Test
	void shouldReturnGenerateReportResponseWhenCallGenerateReporter() {
		JiraBoardSetting jiraBoardSetting = JiraBoardSetting.builder()
			.boardId("")
			.boardColumns(List.of())
			.token("testToken")
			.site("site")
			.doneColumn(List.of())
			.treatFlagCardAsBlock(true)
			.type("jira")
			.projectKey("PLL")
			.targetFields(Collections.emptyList())
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of("velocity"))
			.jiraBoardSetting(jiraBoardSetting)
			.startTime("123")
			.endTime("123")
			.build();

		URI mockUrl = URI.create(SITE_ATLASSIAN_NET);

		Velocity velocity = Velocity.builder().velocityForSP(0).velocityForCards(0).build();
		when(jiraService.getStoryPointsAndCycleTime(any(), any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(0)
			.cardsNumber(0)
			.jiraCardDTOList(Collections.emptyList())
			.build());
		when(jiraService.getStoryPointsAndCycleTimeForNonDoneCards(any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(0)
			.cardsNumber(0)
			.jiraCardDTOList(Collections.emptyList())
			.build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(Collections.emptyList())
			.doneColumns(Collections.emptyList())
			.build());
		when(velocityCalculator.calculateVelocity(any())).thenReturn(velocity);
		when(urlGenerator.getUri(any())).thenReturn(mockUrl);

		ReportResponse result = generateReporterService.generateReporter(request);

		assertThat(result).isEqualTo(ReportResponse.builder().velocity(velocity).build());
	}

	@Test
	public void testGenerateReportWithClassification() {
		JiraBoardSetting jiraBoardSetting = JiraBoardSetting.builder()
			.boardId("")
			.boardColumns(List.of())
			.token("testToken")
			.site("site")
			.doneColumn(List.of())
			.treatFlagCardAsBlock(true)
			.type("jira")
			.projectKey("PLL")
			.targetFields(List.of(TargetField.builder().key("assignee").name("Assignee").flag(true).build()))
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of("classification"))
			.jiraBoardSetting(jiraBoardSetting)
			.startTime("123")
			.endTime("123")
			.build();

		Classification classification = Classification.builder()
			.fieldName("Assignee")
			.pairList((List.of(ClassificationNameValuePair.builder().name("shawn").value(1.0D).build())))
			.build();

		when(jiraService.getStoryPointsAndCycleTime(any(), any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(0)
			.cardsNumber(0)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.fields(JiraCardField.builder().assignee(Assignee.builder().displayName("shawn").build()).build())
					.build())
				.build()))
			.build());
		Classification mockClassification = Classification.builder()
			.fieldName("Assignee")
			.pairList((List.of(ClassificationNameValuePair.builder().name("shawn").value(1.0D).build())))
			.build();

		when(classificationCalculator.calculate(any(), any())).thenReturn(List.of(mockClassification));
		when(jiraService.getStoryPointsAndCycleTime(any(), any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(0)
			.cardsNumber(0)
			.jiraCardDTOList(Collections.emptyList())
			.build());
		when(jiraService.getStoryPointsAndCycleTimeForNonDoneCards(any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(0)
			.cardsNumber(0)
			.jiraCardDTOList(Collections.emptyList())
			.build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(Collections.emptyList())
			.doneColumns(Collections.emptyList())
			.build());

		ReportResponse result = generateReporterService.generateReporter(request);

		assertThat(result.getClassificationList()).isEqualTo(List.of(classification));
	}

	@Test
	public void testGenerateReporterWithDeploymentFrequencyMetric() {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type("BuildKite")
			.token(BUILDKITE_TOKEN)
			.deploymentEnvList(List.of(mockDeployment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of("deployment frequency"))
			.buildKiteSetting(buildKiteSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.build();

		DeploymentFrequency deploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency("Average", 0.10F))
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().build()))
				.withPipelineCreateTime("2022-09-09T04:57:34Z")
				.build()));

		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());

		DeploymentFrequency mockedDeploymentFrequency = DeploymentFrequency.builder()
			.avgDeploymentFrequency(new AvgDeploymentFrequency("Average", 0.10F))
			.build();

		when(calculateDeploymentFrequency.calculate(any(), anyLong(), anyLong())).thenReturn(mockedDeploymentFrequency);

		ReportResponse response = generateReporterService.generateReporter(request);

		assertThat(response.getDeploymentFrequency().getAvgDeploymentFrequency())
			.isEqualTo(deploymentFrequency.getAvgDeploymentFrequency());
	}

	@Test
	public void testGenerateReporterWithChangeFailureRateMetric() {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type("BuildKite")
			.token(BUILDKITE_TOKEN)
			.deploymentEnvList(List.of(mockDeployment))
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of("change failure rate"))
			.buildKiteSetting(buildKiteSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.build();

		ChangeFailureRate changeFailureRate = ChangeFailureRate.builder()
			.avgChangeFailureRate(AvgChangeFailureRate.builder().failureRate(0.1F).build())
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().build()))
				.withPipelineCreateTime("2022-09-09T04:57:34Z")
				.build()));

		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());

		ChangeFailureRate mockedChangeFailureRate = ChangeFailureRate.builder()
			.avgChangeFailureRate(AvgChangeFailureRate.builder().failureRate(0.1F).build())
			.build();

		when(calculateChangeFailureRate.calculate(any())).thenReturn(mockedChangeFailureRate);

		ReportResponse response = generateReporterService.generateReporter(request);

		assertThat(response.getChangeFailureRate().getAvgChangeFailureRate().getFailureRate())
			.isEqualTo(changeFailureRate.getAvgChangeFailureRate().getFailureRate());
	}

	@Test
	void shouldReturnGenerateReportResponseWithCycleTimeModelWhenCallGenerateReporterWithCycleTimeMetrics() {
		CardCollection cardCollection = MOCK_CARD_COLLECTION();
		List<RequestJiraBoardColumnSetting> boardColumns = JIRA_BOARD_COLUMNS_SETTING();

		JiraBoardSetting jiraBoardSetting = JiraBoardSetting.builder()
			.boardId("")
			.boardColumns(boardColumns)
			.token("testToken")
			.site("site")
			.doneColumn(List.of())
			.treatFlagCardAsBlock(true)
			.type("jira")
			.projectKey("PLL")
			.targetFields(Collections.emptyList())
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(false)
			.metrics(List.of("cycle time"))
			.jiraBoardSetting(jiraBoardSetting)
			.startTime("123")
			.endTime("123")
			.build();

		when(jiraService.getStoryPointsAndCycleTime(any(), any(), any())).thenReturn(cardCollection);
		when(jiraService.getStoryPointsAndCycleTimeForNonDoneCards(any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(0)
			.cardsNumber(0)
			.jiraCardDTOList(Collections.emptyList())
			.build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(Collections.emptyList())
			.doneColumns(Collections.emptyList())
			.build());
		when(cycleTimeCalculator.calculateCycleTime(cardCollection, request.getJiraBoardSetting().getBoardColumns()))
			.thenReturn(CycleTime.builder().build());

		ReportResponse result = generateReporterService.generateReporter(request);
		ReportResponse expect = ReportResponse.builder().cycleTime(CycleTime.builder().build()).build();

		assertThat(result).isEqualTo(expect);
	}

	@Test
	public void testGenerateReporterWithLeadTimeForChangesMetric() {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository("https://github.com/XXXX-fs/fs-platform-onboarding");

		CodebaseSetting codebaseSetting = CodebaseSetting.builder()
			.type("Github")
			.token("github_fake_token")
			.leadTime(List.of(mockDeployment))
			.build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type("BuildKite")
			.token("buildKite_fake_token")
			.deploymentEnvList(List.of(mockDeployment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(true)
			.metrics(List.of("lead time for changes"))
			.buildKiteSetting(buildKiteSetting)
			.codebaseSetting(codebaseSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.build();

		PipelineLeadTime pipelineLeadTime = PipelineLeadTime.builder()
			.pipelineStep("Step")
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.prCreatedTime(1658549100000L)
				.prMergedTime(1658549160000L)
				.firstCommitTimeInPr(1658549100000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(1658549100000L)
				.prDelayTime(60000L)
				.pipelineDelayTime(60000)
				.totalTime(120000)
				.build()))
			.build();

		LeadTimeForChanges mockLeadTimeForChanges = LeadTimeForChanges.builder()
			.leadTimeForChangesOfPipelines(List.of(LeadTimeForChangesOfPipelines.builder()
				.name("Name")
				.step("Step")
				.mergeDelayTime(1.0)
				.pipelineDelayTime(1.0)
				.totalDelayTime(2.0)
				.build()))
			.avgLeadTimeForChanges(AvgLeadTimeForChanges.builder()
				.name("Average")
				.mergeDelayTime(1.0)
				.pipelineDelayTime(1.0)
				.totalDelayTime(2.0)
				.build())
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().build()))
				.withPipelineCreateTime("2022-09-09T04:57:34Z")
				.build()));
		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());
		when(gitHubService.fetchPipelinesLeadTime(any(), any(), any())).thenReturn(List.of(pipelineLeadTime));
		when(leadTimeForChangesCalculator.calculate(any())).thenReturn(mockLeadTimeForChanges);
		ReportResponse result = generateReporterService.generateReporter(request);

		assertThat(result.getLeadTimeForChanges()).isEqualTo(mockLeadTimeForChanges);
	}

	@Test
	public void shouldGenerateCsvForPipelineWithPipelineMetricAndBuildInfoIsEmpty() throws IOException {
		Path csvFilePath = Path.of("./csv/exportPipelineMetrics-1683734399999.csv");
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository("https://github.com/XXXX-fs/fs-platform-onboarding");

		CodebaseSetting codebaseSetting = CodebaseSetting.builder()
			.type("Github")
			.token("github_fake_token")
			.leadTime(List.of(mockDeployment))
			.build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type("BuildKite")
			.token("buildKite_fake_token")
			.deploymentEnvList(List.of(mockDeployment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(true)
			.metrics(List.of("lead time for changes", "deployment frequency"))
			.buildKiteSetting(buildKiteSetting)
			.codebaseSetting(codebaseSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.csvTimeStamp("1683734399999")
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withCommit("")
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().withState("broken").build()))
				.build()));
		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());
		when(gitHubService.fetchPipelinesLeadTime(any(), any(), any()))
			.thenReturn(List.of(PipelineCsvFixture.MOCK_PIPELINE_LEAD_TIME_DATA()));

		Mockito.doAnswer(invocation -> {
			Files.createFile(csvFilePath);
			return null;
		}).when(csvFileGenerator).convertPipelineDataToCSV(any(), any());

		generateReporterService.generateReporter(request);

		boolean isExists = Files.exists(csvFilePath);
		Assertions.assertTrue(isExists);
		Files.deleteIfExists(csvFilePath);
	}

	@Test
	public void shouldGenerateCsvForPipelineWithPipelineMetric() throws IOException {
		DeploymentEnvironment mockDeployment = DeploymentEnvironmentBuilder.withDefault().build();
		mockDeployment.setRepository("https://github.com/XXXX-fs/fs-platform-onboarding");

		CodebaseSetting codebaseSetting = CodebaseSetting.builder()
			.type("Github")
			.token("github_fake_token")
			.leadTime(List.of(mockDeployment))
			.build();

		BuildKiteSetting buildKiteSetting = BuildKiteSetting.builder()
			.type("BuildKite")
			.token("buildKite_fake_token")
			.deploymentEnvList(List.of(mockDeployment))
			.build();

		GenerateReportRequest request = GenerateReportRequest.builder()
			.considerHoliday(true)
			.metrics(List.of("lead time for changes", "deployment frequency"))
			.buildKiteSetting(buildKiteSetting)
			.codebaseSetting(codebaseSetting)
			.startTime("1661702400000")
			.endTime("1662739199000")
			.csvTimeStamp("1683734399999")
			.build();

		when(buildKiteService.fetchPipelineBuilds(any(), any(), any(), any()))
			.thenReturn(List.of(BuildKiteBuildInfoBuilder.withDefault()
				.withJobs(List.of(BuildKiteJobBuilder.withDefault().build()))
				.withPipelineCreateTime("2022-09-09T04:57:34Z")
				.build()));
		when(buildKiteService.countDeployTimes(any(), any(), any(), any())).thenReturn(
				DeployTimesBuilder.withDefault().withPassed(List.of(DeployInfoBuilder.withDefault().build())).build());
		when(gitHubService.fetchPipelinesLeadTime(any(), any(), any()))
			.thenReturn(List.of(PipelineCsvFixture.MOCK_PIPELINE_LEAD_TIME_DATA()));

		Mockito.doAnswer(invocation -> {
			Files.createFile(mockPipelineCsvPath);
			return null;
		}).when(csvFileGenerator).convertPipelineDataToCSV(any(), any());

		generateReporterService.generateReporter(request);

		boolean isExists = Files.exists(mockPipelineCsvPath);
		Assertions.assertTrue(isExists);
		Files.deleteIfExists(mockPipelineCsvPath);
	}

	@Test
	public void shouldReturnCsvDataForPipelineWhenExportCsv() throws IOException {
		String mockedCsvData = "csv data";
		ExportCSVRequest mockExportCSVRequest = ExportCSVRequest.builder()
			.dataType("pipeline")
			.csvTimeStamp("1685010080107")
			.build();

		InputStream inputStream = new ByteArrayInputStream(mockedCsvData.getBytes());
		InputStreamResource mockInputStreamResource = new InputStreamResource(inputStream);
		when(csvFileGenerator.getDataFromCSV(any(), anyLong())).thenReturn(mockInputStreamResource);

		InputStreamResource csvDataResource = generateReporterService.fetchCSVData(mockExportCSVRequest);
		InputStream csvDataInputStream = csvDataResource.getInputStream();
		String csvData = new BufferedReader(new InputStreamReader(csvDataInputStream)).lines()
			.collect(Collectors.joining("\n"));

		assertThat(csvData).isEqualTo(mockedCsvData);
	}

	@Test
	public void shouldDeleteOldCsvWhenExportCsvWithOldCsvOutsideTenHours() throws IOException {
		Files.createFile(mockPipelineCsvPath);
		ExportCSVRequest mockExportCSVRequest = ExportCSVRequest.builder()
			.dataType("pipeline")
			.csvTimeStamp("1685010080107")
			.build();

		generateReporterService.fetchCSVData(mockExportCSVRequest);

		boolean isFileDeleted = Files.notExists(mockPipelineCsvPath);
		Assertions.assertTrue(isFileDeleted);
	}

	@Test
	public void shouldNotDeleteOldCsvWhenExportCsvWithoutOldCsvInsideTenHours() throws IOException {
		long currentTimeStamp = System.currentTimeMillis();
		Path csvFilePath = Path.of(String.format("./csv/exportPipelineMetrics-%s.csv", currentTimeStamp));
		Files.createFile(csvFilePath);
		ExportCSVRequest mockExportCSVRequest = ExportCSVRequest.builder()
			.dataType("pipeline")
			.csvTimeStamp("1685010080107")
			.build();

		generateReporterService.fetchCSVData(mockExportCSVRequest);

		boolean isFileDeleted = Files.notExists(csvFilePath);
		Assertions.assertFalse(isFileDeleted);
		Files.deleteIfExists(csvFilePath);
	}

	@Test
	void shouldGenerateForBoardCsvWhenCallGenerateReporterWithBoardMetric() throws IOException {
		JiraBoardSetting jiraBoardSetting = JiraBoardSetting.builder()
			.treatFlagCardAsBlock(true)
			.targetFields(List.of(TargetField.builder().key("issuetype").name("事务类型").flag(true).build(),
					TargetField.builder().key("customfield_1001").name("1").flag(true).build(),
					TargetField.builder().key("customfield_1002").name("2").flag(true).build(),
					TargetField.builder().key("customfield_1003").name("3").flag(true).build(),
					TargetField.builder().key("customfield_1004").name("4").flag(true).build(),
					TargetField.builder().key("customfield_1005").name("5").flag(true).build(),
					TargetField.builder().key("customfield_1006").name("6").flag(true).build(),
					TargetField.builder().key("customfield_1007").name("7").flag(true).build(),
					TargetField.builder().key("customfield_1008").name("8").flag(true).build(),
					TargetField.builder().key("customfield_1009").name("9").flag(true).build(),
					TargetField.builder().key("parent").name("父级").flag(false).build()))
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.metrics(List.of("velocity"))
			.considerHoliday(false)
			.jiraBoardSetting(jiraBoardSetting)
			.startTime("123")
			.endTime("123")
			.csvTimeStamp("1683734399999")
			.build();

		HashMap<String, JsonElement> customFields = JsonFileReader.readJsonFile(
				"/Users/ting.li/Mio/work/HB/HeartBeat/backend/src/test/java/heartbeat/service/report/fields.json");

		URI mockUrl = URI.create(SITE_ATLASSIAN_NET);

		when(jiraService.getStoryPointsAndCycleTime(any(), any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(2)
			.cardsNumber(1)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("key1")
					.fields(JiraCardField.builder()
						.assignee(Assignee.builder().displayName("Shawn").build())
						.summary("Tech replacement")
						.status(Status.builder().displayValue("Doing").build())
						.issuetype(IssueType.builder().name("Task").build())
						.reporter(Reporter.builder().displayName("Jack").build())
						.statusCategoryChangeDate("2023-4-23")
						.storyPoints(3)
						.priority(Priority.builder().name("Top").build())
						.fixVersions(List.of(FixVersion.builder().name("sprint1").build(),
								FixVersion.builder().name("sprint2").build()))
						.project(JiraProject.builder().id("1").key("metrics").name("heartBeat").build())
						.parent(CardParent.builder().key("test").build())
						.labels(List.of("backend", "frontend"))
						.customFields(customFields)
						.build())
					.build())
				.cardCycleTime(CardCycleTime.builder()
					.name("1")
					.steps(StepsDay.builder().development(0.9).build())
					.total(0.9)
					.build())
				.originCycleTime(List.of(CycleTimeInfo.builder().column("TODO").day(30.7859).build(),
						CycleTimeInfo.builder().column("DOING").day(3.29E-5).build()))
				.build()))
			.build());
		when(jiraService.getStoryPointsAndCycleTimeForNonDoneCards(any(), any())).thenReturn(CardCollection.builder()
			.storyPointSum(2)
			.cardsNumber(1)
			.jiraCardDTOList(List.of(JiraCardDTO.builder()
				.baseInfo(JiraCard.builder()
					.key("2")
					.fields(JiraCardField.builder()
						.issuetype(IssueType.builder().name("缺陷").build())
						.customFields(customFields)
						.build())
					.build())
				.cardCycleTime(CardCycleTime.builder()
					.name("1")
					.steps(StepsDay.builder().development(0.0).build())
					.total(0.0)
					.build())
				.build()))
			.build());
		when(jiraService.getJiraColumns(any(), any(), any())).thenReturn(JiraColumnResult.builder()
			.jiraColumnResponse(Collections.emptyList())
			.doneColumns(Collections.emptyList())
			.build());
		when(urlGenerator.getUri(any())).thenReturn(mockUrl);
		Mockito.doAnswer(invocation -> {
			Files.createFile(mockBoardCsvPath);
			return null;
		}).when(csvFileGenerator).convertBoardDataToCSV(any(), any(), any(), any());

		generateReporterService.generateReporter(request);

		boolean isExists = Files.exists(mockBoardCsvPath);
		Assertions.assertTrue(isExists);
		Files.deleteIfExists(mockBoardCsvPath);
	}

}
