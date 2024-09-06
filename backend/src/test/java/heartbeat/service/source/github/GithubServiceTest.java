package heartbeat.service.source.github;

import heartbeat.client.GitHubFeignClient;
import heartbeat.client.dto.codebase.github.Author;
import heartbeat.client.dto.codebase.github.BranchesInfoDTO;
import heartbeat.client.dto.codebase.github.Commit;
import heartbeat.client.dto.codebase.github.CommitInfo;
import heartbeat.client.dto.codebase.github.Committer;
import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.client.dto.codebase.github.OrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PageBranchesInfoDTO;
import heartbeat.client.dto.codebase.github.PageOrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PagePullRequestInfo;
import heartbeat.client.dto.codebase.github.PageReposInfoDTO;
import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.codebase.github.PullRequestInfo;
import heartbeat.client.dto.codebase.github.ReposInfoDTO;
import heartbeat.client.dto.codebase.github.SourceControlLeadTime;
import heartbeat.client.dto.pipeline.buildkite.DeployInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.controller.report.dto.request.CodeBase;
import heartbeat.controller.report.dto.request.CodebaseSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.exception.BadRequestException;
import heartbeat.exception.InternalServerErrorException;
import heartbeat.exception.NotFoundException;
import heartbeat.exception.PermissionDenyException;
import heartbeat.exception.UnauthorizedException;
import heartbeat.service.pipeline.buildkite.CachePageService;
import heartbeat.service.report.WorkDay;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.service.report.model.WorkInfo;
import heartbeat.service.source.github.model.PipelineInfoOfRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletionException;

import static heartbeat.TestFixtures.GITHUB_REPOSITORY;
import static heartbeat.TestFixtures.GITHUB_TOKEN;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GithubServiceTest {

	public static final String PIPELINE_STEP = "FakeName";

	private static final String JOB_NAME = PIPELINE_STEP;

	@Mock
	GitHubFeignClient gitHubFeignClient;

	@Mock
	WorkDay workDay;

	@Mock
	CachePageService cachePageService;

	GitHubService githubService;

	@Mock
	PullRequestInfo pullRequestInfo;

	@Mock
	PipelineInfoOfRepository pipelineInfoOfRepository;

	@Mock
	DeployInfo deployInfo;

	@Mock
	CommitInfo commitInfo;

	@Mock
	List<DeployTimes> deployTimes;

	@Mock
	List<PipelineLeadTime> pipelineLeadTimes;

	@Mock
	Map<String, String> repositoryMap;

	@BeforeEach
	public void setUp() {
		pullRequestInfo = PullRequestInfo.builder()
			.mergedAt("2022-07-23T04:04:00.000+00:00")
			.createdAt("2022-07-23T04:03:00.000+00:00")
			.mergeCommitSha("111")
			.url("https://api.github.com/repos/XXXX-fs/fs-platform-onboarding/pulls/1")
			.number(1)
			.build();
		deployInfo = DeployInfo.builder()
			.commitId("111")
			.pipelineCreateTime("2022-07-23T04:05:00.000+00:00")
			.jobStartTime("2022-07-23T04:04:00.000+00:00")
			.jobFinishTime("2022-07-23T04:06:00.000+00:00")
			.state("passed")
			.build();
		commitInfo = CommitInfo.builder()
			.commit(Commit.builder()
				.committer(Committer.builder().date("2022-07-23T04:03:00.000+00:00").build())
				.message("mock commit message")
				.build())
			.build();

		deployTimes = List.of(DeployTimes.builder()
			.pipelineId("fs-platform-onboarding")
			.pipelineName("Name")
			.pipelineStep(PIPELINE_STEP)
			.passed(List.of(DeployInfo.builder()
				.jobName(JOB_NAME)
				.pipelineCreateTime("2022-07-23T04:05:00.000+00:00")
				.jobStartTime("2022-07-23T04:04:00.000+00:00")
				.jobFinishTime("2022-07-23T04:06:00.000+00:00")
				.commitId("111")
				.state("passed")
				.jobName(JOB_NAME)
				.build()))
			.build());

		pipelineLeadTimes = List.of(PipelineLeadTime.builder()
			.pipelineName("Name")
			.pipelineStep(PIPELINE_STEP)
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.prCreatedTime(1658548980000L)
				.prMergedTime(1658549040000L)
				.firstCommitTimeInPr(1658548980000L)
				.jobStartTime(1658549040000L)
				.jobFinishTime(1658549160000L)
				.pipelineLeadTime(1658549100000L)
				.pipelineCreateTime(1658549100000L)
				.prLeadTime(60000L)
				.pipelineLeadTime(120000)
				.firstCommitTime(1658549040000L)
				.totalTime(180000)
				.isRevert(Boolean.FALSE)
				.build()))
			.build());

		repositoryMap = new HashMap<>();
		repositoryMap.put("fs-platform-payment-selector", "https://github.com/XXXX-fs/fs-platform-onboarding");
		repositoryMap.put("fs-platform-onboarding", "https://github.com/XXXX-fs/fs-platform-onboarding");

		pipelineInfoOfRepository = PipelineInfoOfRepository.builder()
			.repository("https://github.com/XXXX-fs/fs-platform-onboarding")
			.passedDeploy(deployTimes.get(0).getPassed())
			.pipelineStep(deployTimes.get(0).getPipelineStep())
			.pipelineName(deployTimes.get(0).getPipelineName())
			.build();

		githubService = new GitHubService(gitHubFeignClient, cachePageService, getTaskExecutor(), workDay);
	}

	@AfterEach
	public void tearDown() {
		githubService.shutdownExecutor();
	}

	private ThreadPoolTaskExecutor getTaskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(10);
		executor.setMaxPoolSize(100);
		executor.setQueueCapacity(500);
		executor.setKeepAliveSeconds(60);
		executor.setThreadNamePrefix("Heartbeat-");
		executor.initialize();
		return executor;
	}

	@Test
	void shouldReturnGithubTokenIsVerifyWhenVerifyToken() {
		String githubToken = GITHUB_TOKEN;
		String token = "token " + githubToken;

		doNothing().when(gitHubFeignClient).verifyToken(token);

		assertDoesNotThrow(() -> githubService.verifyToken(githubToken));
	}

	@Test
	void shouldReturnGithubBranchIsVerifyWhenVerifyBranch() {
		String githubToken = GITHUB_TOKEN;
		String token = "token " + githubToken;
		doNothing().when(gitHubFeignClient).verifyCanReadTargetBranch(any(), any(), any());

		githubService.verifyCanReadTargetBranch(GITHUB_REPOSITORY, "main", githubToken);

		verify(gitHubFeignClient, times(1)).verifyCanReadTargetBranch("fake/repo", "main", token);
	}

	@Test
	void shouldThrowUnauthorizedExceptionGivenGithubReturnUnauthorizedExceptionWhenVerifyToken() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new UnauthorizedException("Failed to get GitHub info_status: 401 UNAUTHORIZED, reason: ..."))
			.when(gitHubFeignClient)
			.verifyToken("token " + githubEmptyToken);

		var exception = assertThrows(UnauthorizedException.class, () -> githubService.verifyToken(githubEmptyToken));
		assertEquals("Failed to get GitHub info_status: 401 UNAUTHORIZED, reason: ...", exception.getMessage());
	}

	@Test
	void shouldThrowBadRequestExceptionGivenGithubReturnUnExpectedExceptionWhenVerifyBranch() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new UnauthorizedException("Failed to get GitHub info_status: 401 UNAUTHORIZED, reason: ..."))
			.when(gitHubFeignClient)
			.verifyCanReadTargetBranch("fake/repo", "main", "token " + githubEmptyToken);

		var exception = assertThrows(BadRequestException.class,
				() -> githubService.verifyCanReadTargetBranch(GITHUB_REPOSITORY, "main", githubEmptyToken));
		assertEquals("Unable to read target branch: main, with token error", exception.getMessage());
	}

	@Test
	void shouldThrowNotFoundExceptionGivenGithubReturnNotFoundExceptionWhenVerifyBranch() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new NotFoundException("Failed to get GitHub info_status: 404, reason: ...")).when(gitHubFeignClient)
			.verifyCanReadTargetBranch("fake/repo", "main", "token " + githubEmptyToken);

		var exception = assertThrows(NotFoundException.class,
				() -> githubService.verifyCanReadTargetBranch(GITHUB_REPOSITORY, "main", githubEmptyToken));
		assertEquals("Unable to read target branch: main", exception.getMessage());
	}

	@Test
	void shouldThrowInternalServerErrorExceptionGivenGithubReturnInternalServerErrorExceptionWhenVerifyBranch() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new InternalServerErrorException("Failed to get GitHub info_status: 500, reason: ..."))
			.when(gitHubFeignClient)
			.verifyCanReadTargetBranch("fake/repo", "main", "token " + githubEmptyToken);

		var exception = assertThrows(InternalServerErrorException.class,
				() -> githubService.verifyCanReadTargetBranch(GITHUB_REPOSITORY, "main", githubEmptyToken));
		assertEquals("Failed to get GitHub info_status: 500, reason: ...", exception.getMessage());
	}

	@Test
	void shouldThrowInternalServerErrorExceptionGivenGithubReturnCompletionExceptionWhenVerifyToken() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new CompletionException(new Exception("UnExpected Exception"))).when(gitHubFeignClient)
			.verifyToken("token " + githubEmptyToken);

		var exception = assertThrows(InternalServerErrorException.class,
				() -> githubService.verifyToken(githubEmptyToken));
		assertEquals("Failed to call GitHub with token_error: UnExpected Exception", exception.getMessage());
	}

	@Test
	void shouldThrowInternalServerErrorExceptionGivenGithubReturnCompletionExceptionWhenVerifyBranch() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new CompletionException(new Exception("UnExpected Exception"))).when(gitHubFeignClient)
			.verifyCanReadTargetBranch("fake/repo", "main", "token " + githubEmptyToken);

		var exception = assertThrows(InternalServerErrorException.class,
				() -> githubService.verifyCanReadTargetBranch(GITHUB_REPOSITORY, "main", githubEmptyToken));
		assertEquals("Failed to call GitHub branch: main with error: UnExpected Exception", exception.getMessage());
	}

	@Test
	void shouldThrowUnauthorizedExceptionGivenGithubReturnPermissionDenyExceptionWhenVerifyBranch() {
		String githubEmptyToken = GITHUB_TOKEN;
		doThrow(new PermissionDenyException("Failed to get GitHub info_status: 403 FORBIDDEN..."))
			.when(gitHubFeignClient)
			.verifyCanReadTargetBranch("fake/repo", "main", "token " + githubEmptyToken);

		var exception = assertThrows(UnauthorizedException.class,
				() -> githubService.verifyCanReadTargetBranch(GITHUB_REPOSITORY, "main", githubEmptyToken));
		assertEquals("Unable to read target organization", exception.getMessage());
	}

	@Test
	void shouldReturnNullWhenMergeTimeIsNull() {
		PullRequestInfo pullRequestInfo = PullRequestInfo.builder().build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		DeployInfo deployInfo = DeployInfo.builder().build();
		CommitInfo commitInfo = CommitInfo.builder().build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertNull(result);
	}

	@Test
	void shouldReturnNullWhenCommitterDateIsNull() {
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000L)
			.isRevert(null)
			.build();
		commitInfo = CommitInfo.builder()
			.commit(Commit.builder().committer(Committer.builder().build()).build())
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnLeadTimeWhenMergedTimeIsNotNull() {
		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(1658548980000L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(60000L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(180000)
			.isRevert(Boolean.FALSE)
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.timezone("Asia/Shanghai")
			.calendarType(CalendarTypeEnum.REGULAR)
			.build();

		when(workDay.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(CalendarTypeEnum.class),
				any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void CommitTimeInPrShouldBeZeroWhenCommitInfoIsNull() {
		commitInfo = CommitInfo.builder().commit(Commit.builder().message("mock commit message").build()).build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();

		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000)
			.isRevert(Boolean.FALSE)
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void CommitTimeInPrLeadTimeShouldBeZeroWhenCommitInfoIsNotNullGivenCommitIsReverted() {
		commitInfo = CommitInfo.builder().commit(Commit.builder().message("Revert commit message").build()).build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();

		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000)
			.isRevert(Boolean.TRUE)
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void CommitTimeInPrLeadTimeShouldBeZeroWhenCommitInfoIsInLowerCaseGivenCommitIsReverted() {
		commitInfo = CommitInfo.builder().commit(Commit.builder().message("revert commit message").build()).build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.isRevert(Boolean.TRUE)
			.totalTime(120000)
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnIsRevertIsNullWhenCommitInfoCommitIsNull() {
		commitInfo = CommitInfo.builder().build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000L)
			.isRevert(null)
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnIsRevertIsNullWhenCommitInfoCommitMessageIsNull() {
		commitInfo = CommitInfo.builder().commit(Commit.builder().build()).build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000L)
			.isRevert(null)
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnFirstCommitTimeInPrZeroWhenCommitInfoIsNull() {
		commitInfo = CommitInfo.builder().commit(Commit.builder().message("mock commit message").build()).build();
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(0L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000L)
			.isRevert(Boolean.FALSE)
			.build();

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnPrLeadTimeIsZeroWhenWorkdayIsNegative() {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		PrintStream printStream = new PrintStream(outputStream);
		System.setOut(printStream);

		commitInfo = CommitInfo.builder()
			.commit(Commit.builder()
				.committer(Committer.builder().date("2022-07-24T04:04:00.000+00:00").build())
				.message("mock commit message")
				.build())
			.build();

		pullRequestInfo = PullRequestInfo.builder()
			.mergedAt("2022-07-23T04:04:00.000+00:00")
			.createdAt("2022-07-23T04:03:00.000+00:00")
			.mergeCommitSha("111")
			.url("https://api.github.com/repos/XXXX-fs/fs-platform-onboarding/pulls/1")
			.number(1)
			.build();

		LeadTime expect = LeadTime.builder()
			.commitId("111")
			.prCreatedTime(1658548980000L)
			.prMergedTime(1658549040000L)
			.firstCommitTimeInPr(1658635440000L)
			.jobStartTime(1658549040000L)
			.jobFinishTime(1658549160000L)
			.pipelineLeadTime(1658549100000L)
			.pipelineCreateTime(1658549100000L)
			.prLeadTime(0L)
			.pipelineLeadTime(120000)
			.firstCommitTime(1658549040000L)
			.totalTime(120000)
			.isRevert(Boolean.FALSE)
			.build();
		GenerateReportRequest request = GenerateReportRequest.builder()
			.timezone("Asia/Shanghai")
			.calendarType(CalendarTypeEnum.REGULAR)
			.build();

		when(workDay.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(CalendarTypeEnum.class),
				any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		LeadTime result = githubService.mapLeadTimeWithInfo(pullRequestInfo, deployInfo, commitInfo, request);

		String logs = outputStream.toString();

		assertEquals(expect, result);
		assertTrue(logs.contains("calculate work time error"));

		System.setOut(System.out);
	}

	@Test
	void shouldReturnPipeLineLeadTimeWhenDeployITimesIsNotEmpty() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder()
			.timezone("Asia/Shanghai")
			.calendarType(CalendarTypeEnum.REGULAR)
			.build();

		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenReturn(List.of(pullRequestInfo));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of(commitInfo));
		when(gitHubFeignClient.getCommitInfo(any(), any(), any())).thenReturn(commitInfo);

		when(workDay.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(CalendarTypeEnum.class),
				any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(pipelineLeadTimes, result);
	}

	@Test
	void shouldReturnEmptyLeadTimeWhenDeployTimesIsEmpty() {
		String mockToken = "mockToken";
		List<PipelineLeadTime> expect = List.of(PipelineLeadTime.builder().build());
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenReturn(List.of(pullRequestInfo));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of(commitInfo));
		List<DeployTimes> emptyDeployTimes = List.of(DeployTimes.builder().build());

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(emptyDeployTimes, repositoryMap, mockToken,
				request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnEmptyLeadTimeGithubShaIsDifferent() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		List<PipelineLeadTime> expect = List.of(PipelineLeadTime.builder()
			.pipelineStep(PIPELINE_STEP)
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.noPRCommitTime(1658548980000L)
				.jobStartTime(1658549040000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(1658549100000L)
				.prLeadTime(0L)
				.pipelineLeadTime(180000)
				.firstCommitTime(1658548980000L)
				.totalTime(180000)
				.isRevert(Boolean.FALSE)
				.build()))
			.build());
		var pullRequestInfoWithDifferentSha = PullRequestInfo.builder()
			.mergedAt("2022-07-23T04:04:00.000+00:00")
			.createdAt("2022-07-23T04:03:00.000+00:00")
			.mergeCommitSha("222")
			.url("https://api.github.com/repos/XXXX-fs/fs-platform-onboarding/pulls/1")
			.number(1)
			.build();
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any()))
			.thenReturn(List.of(pullRequestInfoWithDifferentSha));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of(commitInfo));
		when(gitHubFeignClient.getCommitInfo(any(), any(), any())).thenReturn(commitInfo);

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnEmptyMergeLeadTimeWhenPullRequestInfoIsEmpty() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		List<PipelineLeadTime> expect = List.of(PipelineLeadTime.builder()
			.pipelineStep(PIPELINE_STEP)
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.jobStartTime(1658549040000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(1658549100000L)
				.prLeadTime(0L)
				.pipelineLeadTime(120000)
				.totalTime(120000)
				.firstCommitTime(1658549040000L)
				.isRevert(null)
				.build()))
			.build());
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenReturn(List.of());
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of());
		when(gitHubFeignClient.getCommitInfo(any(), any(), any())).thenReturn(new CommitInfo());

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnEmptyMergeLeadTimeWhenPullRequestInfoGot404Error() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();

		List<PipelineLeadTime> expect = List.of(PipelineLeadTime.builder()
			.pipelineStep(PIPELINE_STEP)
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.jobStartTime(1658549040000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(1658549100000L)
				.prLeadTime(0L)
				.pipelineLeadTime(120000)
				.firstCommitTime(1658549040000L)
				.totalTime(120000)
				.isRevert(Boolean.FALSE)
				.build()))
			.build());
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenThrow(new NotFoundException(""));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of());
		when(gitHubFeignClient.getCommitInfo(any(), any(), any()))
			.thenReturn(CommitInfo.builder().commit(Commit.builder().message("").build()).build());

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(expect, result);
	}

	@Test
	void shouldReturnEmptyMergeLeadTimeWhenMergeTimeIsEmpty() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();

		pullRequestInfo.setMergedAt(null);
		List<PipelineLeadTime> expect = List.of(PipelineLeadTime.builder()
			.pipelineStep(PIPELINE_STEP)
			.pipelineName("Name")
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.jobStartTime(1658549040000L)
				.jobFinishTime(1658549160000L)
				.pipelineCreateTime(1658549100000L)
				.prLeadTime(0L)
				.pipelineLeadTime(120000)
				.firstCommitTime(1658549040000L)
				.totalTime(120000)
				.isRevert(null)
				.build()))
			.build());
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenReturn(List.of(pullRequestInfo));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of());
		when(gitHubFeignClient.getCommitInfo(any(), any(), any())).thenReturn(new CommitInfo());

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(expect, result);
	}

	@Test
	void shouldThrowExceptionIfGetPullRequestListInfoHasExceptionWhenFetchPipelinesLeadTime() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();

		pullRequestInfo.setMergedAt(null);
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any()))
			.thenThrow(new CompletionException(new Exception("UnExpected Exception")));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of());

		assertThatThrownBy(() -> githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken, request))
			.isInstanceOf(InternalServerErrorException.class)
			.hasMessageContaining("UnExpected Exception");
	}

	@Test
	void shouldThrowCompletableExceptionIfGetPullRequestListInfoHasExceptionWhenFetchPipelinesLeadTime() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		pullRequestInfo.setMergedAt(null);
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any()))
			.thenThrow(new CompletionException(new UnauthorizedException("Bad credentials")));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of());

		assertThatThrownBy(() -> githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken, request))
			.isInstanceOf(UnauthorizedException.class)
			.hasMessageContaining("Bad credentials");
	}

	@Test
	void shouldFetchCommitInfo() {
		CommitInfo commitInfo = CommitInfo.builder()
			.commit(Commit.builder()
				.author(Author.builder().name("XXXX").email("XXX@test.com").date("2023-05-10T06:43:02.653Z").build())
				.committer(
						Committer.builder().name("XXXX").email("XXX@test.com").date("2023-05-10T06:43:02.653Z").build())
				.build())
			.build();
		when(gitHubFeignClient.getCommitInfo(anyString(), anyString(), anyString())).thenReturn(commitInfo);

		CommitInfo result = githubService.fetchCommitInfo("12344", "org/repo", "mockToken");

		assertEquals(result, commitInfo);
	}

	@Test
    void shouldThrowPermissionDenyExceptionWhenFetchCommitInfo403Forbidden() {
        when(gitHubFeignClient.getCommitInfo(anyString(), anyString(), anyString()))
                .thenThrow(new PermissionDenyException("request forbidden"));

        assertThatThrownBy(() -> githubService.fetchCommitInfo("12344", "org/repo", "mockToken"))
                .isInstanceOf(PermissionDenyException.class)
                .hasMessageContaining("request forbidden");
    }

	@Test
	void shouldThrowInternalServerErrorExceptionWhenFetchCommitInfo500Exception() {
		when(gitHubFeignClient.getCommitInfo(anyString(), anyString(), anyString())).thenReturn(null);

		assertThatThrownBy(() -> githubService.fetchCommitInfo("12344", "", ""))
			.isInstanceOf(InternalServerErrorException.class)
			.hasMessageContaining("Failed to get commit info_repoId");
	}

	@Test
	void shouldReturnNullWhenFetchCommitInfo404Exception() {
		when(gitHubFeignClient.getCommitInfo(anyString(), anyString(), anyString())).thenThrow(new NotFoundException(""));

		assertNull(githubService.fetchCommitInfo("12344", "", ""));
	}

	@Test
	void shouldReturnPipeLineLeadTimeWhenDeployITimesIsNotEmptyAndCommitInfoError() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder()
			.timezone("Asia/Shanghai")
			.calendarType(CalendarTypeEnum.REGULAR)
			.build();
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenReturn(List.of(pullRequestInfo));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of(commitInfo));
		when(gitHubFeignClient.getCommitInfo(any(), any(), any()))
			.thenThrow(new NotFoundException("Failed to get commit"));

		when(workDay.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(CalendarTypeEnum.class),
				any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(pipelineLeadTimes, result);
	}

	@Test
	void shouldReturnPipeLineLeadTimeWhenDeployCommitShaIsDifferent() {
		String mockToken = "mockToken";
		GenerateReportRequest request = GenerateReportRequest.builder().build();
		pullRequestInfo = PullRequestInfo.builder()
			.mergedAt("2022-07-23T04:04:00.000+00:00")
			.createdAt("2022-07-23T04:03:00.000+00:00")
			.mergeCommitSha("222")
			.url("")
			.number(1)
			.build();
		pipelineLeadTimes = List.of(PipelineLeadTime.builder()
			.pipelineName("Name")
			.pipelineStep(PIPELINE_STEP)
			.leadTimes(List.of(LeadTime.builder()
				.commitId("111")
				.jobStartTime(1658549040000L)
				.jobFinishTime(1658549160000L)
				.pipelineLeadTime(1658549100000L)
				.pipelineCreateTime(1658549100000L)
				.prLeadTime(0L)
				.pipelineLeadTime(120000)
				.firstCommitTime(1658549040000L)
				.totalTime(120000)
				.isRevert(null)
				.build()))
			.build());
		when(gitHubFeignClient.getPullRequestListInfo(any(), any(), any())).thenReturn(List.of(pullRequestInfo));
		when(gitHubFeignClient.getPullRequestCommitInfo(any(), any(), any())).thenReturn(List.of(commitInfo));
		when(gitHubFeignClient.getCommitInfo(any(), any(), any()))
			.thenThrow(new NotFoundException("Failed to get commit"));

		List<PipelineLeadTime> result = githubService.fetchPipelinesLeadTime(deployTimes, repositoryMap, mockToken,
				request);

		assertEquals(pipelineLeadTimes, result);
	}

	@Test
	void shouldReturnAllOrganizationsWhenPagesIsEqualTo1() {
		String mockToken = "mockToken";
		List<OrganizationsInfoDTO> organizationsInfoDTOList = List.of(
				OrganizationsInfoDTO.builder().login("test-org1").build(),
				OrganizationsInfoDTO.builder().login("test-org2").build(),
				OrganizationsInfoDTO.builder().login("test-org3").build());
		PageOrganizationsInfoDTO pageOrganizationsInfoDTO = PageOrganizationsInfoDTO.builder()
			.totalPage(1)
			.pageInfo(organizationsInfoDTOList)
			.build();
		when(cachePageService.getGitHubOrganizations("Bearer " + mockToken, 1, 100))
			.thenReturn(pageOrganizationsInfoDTO);

		List<String> allOrganizations = githubService.getAllOrganizations(mockToken);

		assertEquals(List.of("test-org1", "test-org2", "test-org3"), allOrganizations);
	}

	@Test
	void shouldReturnAllOrganizationsWhenPagesIsMoreThan1() {
		String mockToken = "mockToken";
		List<OrganizationsInfoDTO> organizationsInfoDTOListPage1 = List.of(
				OrganizationsInfoDTO.builder().login("test-org1").build(),
				OrganizationsInfoDTO.builder().login("test-org2").build(),
				OrganizationsInfoDTO.builder().login("test-org3").build());
		PageOrganizationsInfoDTO pageOrganizationsInfoDTOPage1 = PageOrganizationsInfoDTO.builder()
			.totalPage(2)
			.pageInfo(organizationsInfoDTOListPage1)
			.build();
		List<OrganizationsInfoDTO> organizationsInfoDTOListPage2 = List.of(
				OrganizationsInfoDTO.builder().login("test-org4").build(),
				OrganizationsInfoDTO.builder().login("test-org5").build(),
				OrganizationsInfoDTO.builder().login("test-org6").build());
		PageOrganizationsInfoDTO pageOrganizationsInfoDTOPage2 = PageOrganizationsInfoDTO.builder()
			.totalPage(2)
			.pageInfo(organizationsInfoDTOListPage2)
			.build();
		when(cachePageService.getGitHubOrganizations("Bearer " + mockToken, 1, 100))
			.thenReturn(pageOrganizationsInfoDTOPage1);
		when(cachePageService.getGitHubOrganizations("Bearer " + mockToken, 2, 100))
			.thenReturn(pageOrganizationsInfoDTOPage2);

		List<String> allOrganizations = githubService.getAllOrganizations(mockToken);

		assertEquals(List.of("test-org1", "test-org2", "test-org3", "test-org4", "test-org5", "test-org6"),
				allOrganizations);
	}

	@Test
	void shouldReturnNoOrganizationsWhenOrganizationIsNullInTheFirstPage() {
		String mockToken = "mockToken";
		PageOrganizationsInfoDTO pageOrganizationsInfoDTOPage = PageOrganizationsInfoDTO.builder().totalPage(0).build();
		when(cachePageService.getGitHubOrganizations("Bearer " + mockToken, 1, 100))
			.thenReturn(pageOrganizationsInfoDTOPage);

		List<String> allOrganizations = githubService.getAllOrganizations(mockToken);

		assertEquals(0, allOrganizations.size());
	}

	@Test
	void shouldReturnAllReposWhenPagesIsEqualTo1() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		long endTime = 1719763199999L;
		List<ReposInfoDTO> reposInfoDTOList = List.of(
				ReposInfoDTO.builder().name("test-repo1").createdAt("2024-07-30T15:59:59Z").build(),
				ReposInfoDTO.builder().name("test-repo2").createdAt("2024-07-30T15:59:59Z").build(),
				ReposInfoDTO.builder().name("test-repo3").createdAt("2024-05-30T15:59:59Z").build());
		PageReposInfoDTO pageReposInfoDTO = PageReposInfoDTO.builder().totalPage(1).pageInfo(reposInfoDTOList).build();
		when(cachePageService.getGitHubRepos("Bearer " + mockToken, mockOrganization, 1, 100))
			.thenReturn(pageReposInfoDTO);

		List<String> allRepos = githubService.getAllRepos(mockToken, mockOrganization, endTime);

		assertEquals(List.of("test-repo3"), allRepos);
	}

	@Test
	void shouldReturnAllReposWhenPagesIsMoreThan1() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		long endTime = 1719763199999L;
		List<ReposInfoDTO> reposInfoDTOListPage1 = List.of(
				ReposInfoDTO.builder().name("test-repo1").createdAt("2024-07-30T15:59:59Z").build(),
				ReposInfoDTO.builder().name("test-repo2").createdAt("2024-07-30T15:59:59Z").build(),
				ReposInfoDTO.builder().createdAt("2024-05-30T15:59:59Z").name("test-repo3").build());
		PageReposInfoDTO pageReposInfoDTOPage1 = PageReposInfoDTO.builder()
			.totalPage(2)
			.pageInfo(reposInfoDTOListPage1)
			.build();
		List<ReposInfoDTO> reposInfoDTOListPage2 = List.of(
				ReposInfoDTO.builder().createdAt("2024-07-30T15:59:59Z").name("test-repo4").build(),
				ReposInfoDTO.builder().createdAt("2024-07-30T15:59:59Z").name("test-repo5").build(),
				ReposInfoDTO.builder().createdAt("2024-07-30T15:59:59Z").name("test-repo6").build());
		PageReposInfoDTO pageReposInfoDTOPage2 = PageReposInfoDTO.builder()
			.totalPage(2)
			.pageInfo(reposInfoDTOListPage2)
			.build();
		when(cachePageService.getGitHubRepos("Bearer " + mockToken, mockOrganization, 1, 100))
			.thenReturn(pageReposInfoDTOPage1);
		when(cachePageService.getGitHubRepos("Bearer " + mockToken, mockOrganization, 2, 100))
			.thenReturn(pageReposInfoDTOPage2);

		List<String> allRepos = githubService.getAllRepos(mockToken, mockOrganization, endTime);

		assertEquals(List.of("test-repo3"), allRepos);
	}

	@Test
	void shouldReturnNoReposWhenRepoIsNullInTheFirstPage() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		long endTime = 1L;
		PageReposInfoDTO pageReposInfoDTO = PageReposInfoDTO.builder().totalPage(0).build();
		when(cachePageService.getGitHubRepos("Bearer " + mockToken, mockOrganization, 1, 100))
			.thenReturn(pageReposInfoDTO);

		List<String> allRepos = githubService.getAllRepos(mockToken, mockOrganization, endTime);

		assertEquals(0, allRepos.size());
	}

	@Test
	void shouldReturnAllBranchesWhenPagesIsEqualTo1() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		List<BranchesInfoDTO> branchesInfoDTOList = List.of(BranchesInfoDTO.builder().name("test-branch1").build(),
				BranchesInfoDTO.builder().name("test-branch2").build(),
				BranchesInfoDTO.builder().name("test-branch3").build());
		PageBranchesInfoDTO pageBranchesInfoDTO = PageBranchesInfoDTO.builder()
			.totalPage(1)
			.pageInfo(branchesInfoDTOList)
			.build();
		when(cachePageService.getGitHubBranches("Bearer " + mockToken, mockOrganization, mockRepo, 1, 100))
			.thenReturn(pageBranchesInfoDTO);

		List<String> allBranches = githubService.getAllBranches(mockToken, mockOrganization, mockRepo);

		assertEquals(List.of("test-branch1", "test-branch2", "test-branch3"), allBranches);
	}

	@Test
	void shouldReturnAllBranchesWhenPagesIsMoreThan1() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		List<BranchesInfoDTO> branchesInfoDTOList1 = List.of(BranchesInfoDTO.builder().name("test-branch1").build(),
				BranchesInfoDTO.builder().name("test-branch2").build(),
				BranchesInfoDTO.builder().name("test-branch3").build());
		List<BranchesInfoDTO> branchesInfoDTOList2 = List.of(BranchesInfoDTO.builder().name("test-branch4").build(),
				BranchesInfoDTO.builder().name("test-branch5").build(),
				BranchesInfoDTO.builder().name("test-branch6").build());
		PageBranchesInfoDTO pageBranchesInfoDTOPage1 = PageBranchesInfoDTO.builder()
			.totalPage(2)
			.pageInfo(branchesInfoDTOList1)
			.build();
		PageBranchesInfoDTO pageBranchesInfoDTOPage2 = PageBranchesInfoDTO.builder()
			.totalPage(2)
			.pageInfo(branchesInfoDTOList2)
			.build();
		when(cachePageService.getGitHubBranches("Bearer " + mockToken, mockOrganization, mockRepo, 1, 100))
			.thenReturn(pageBranchesInfoDTOPage1);
		when(cachePageService.getGitHubBranches("Bearer " + mockToken, mockOrganization, mockRepo, 2, 100))
			.thenReturn(pageBranchesInfoDTOPage2);

		List<String> allBranches = githubService.getAllBranches(mockToken, mockOrganization, mockRepo);

		assertEquals(
				List.of("test-branch1", "test-branch2", "test-branch3", "test-branch4", "test-branch5", "test-branch6"),
				allBranches);
	}

	@Test
	void shouldReturnNoBranchesWhenBranchIsNullInTheFirstPage() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		PageBranchesInfoDTO pageBranchesInfoDTO = PageBranchesInfoDTO.builder().totalPage(0).build();
		when(cachePageService.getGitHubBranches("Bearer " + mockToken, mockOrganization, mockRepo, 1, 100))
			.thenReturn(pageBranchesInfoDTO);

		List<String> allBranches = githubService.getAllBranches(mockToken, mockOrganization, mockRepo);

		assertEquals(0, allBranches.size());
	}

	@Test
	void shouldReturnAllCrewsWhenPageMoreThan1() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		String mockBranch = "branch";
		long startTime = 1717171200000L;
		long endTime = 1719763199999L;
		PullRequestInfo pullRequestWhenMergeIsNull = PullRequestInfo.builder()
			.number(1)
			.createdAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test1").build())
			.build();
		PullRequestInfo pullRequestWhenCreateAndMergeTimeIsSuccess = PullRequestInfo.builder()
			.number(2)
			.createdAt("2024-06-30T15:59:59Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test2").build())
			.build();
		PullRequestInfo pullRequestWhenCreateIsAfterEndTime = PullRequestInfo.builder()
			.number(3)
			.createdAt("2024-06-30T16:59:59Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test3").build())
			.build();
		PullRequestInfo pullRequestWhenMergeIsBeforeStartTime = PullRequestInfo.builder()
			.number(4)
			.createdAt("2024-06-30T15:59:59Z")
			.mergedAt("2024-05-31T15:00:00Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test4").build())
			.build();
		PullRequestInfo pullRequestWhenMergeIsAfterEndTime = PullRequestInfo.builder()
			.number(5)
			.createdAt("2024-06-30T15:59:59Z")
			.mergedAt("2024-06-30T16:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test5").build())
			.build();
		PagePullRequestInfo pagePullRequestInfo = PagePullRequestInfo.builder()
			.totalPage(22)
			.pageInfo(List.of(pullRequestWhenMergeIsNull, pullRequestWhenCreateAndMergeTimeIsSuccess,
					pullRequestWhenCreateIsAfterEndTime, pullRequestWhenMergeIsBeforeStartTime,
					pullRequestWhenMergeIsAfterEndTime))
			.build();
		when(cachePageService.getGitHubPullRequest(eq("Bearer " + mockToken), eq(mockOrganization), eq(mockRepo),
				eq(mockBranch), anyInt(), eq(100)))
			.thenReturn(pagePullRequestInfo);

		List<String> allCrews = githubService.getAllCrews(mockToken, mockOrganization, mockRepo, mockBranch, startTime,
				endTime);

		assertEquals(List.of("test2"), allCrews);
	}

	@Test
	void shouldReturnAllCrewsWhenPageIsEqualTo1() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		String mockBranch = "branch";
		long startTime = 1717171200000L;
		long endTime = 1719763199999L;
		PullRequestInfo pullRequestWhenCreateIsBeforeStartTime = PullRequestInfo.builder()
			.number(1)
			.createdAt("2024-05-31T15:00:00Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test1").build())
			.build();
		PagePullRequestInfo pagePullRequestInfo = PagePullRequestInfo.builder()
			.totalPage(1)
			.pageInfo(List.of(pullRequestWhenCreateIsBeforeStartTime))
			.build();
		when(cachePageService.getGitHubPullRequest(eq("Bearer " + mockToken), eq(mockOrganization), eq(mockRepo),
				eq(mockBranch), anyInt(), eq(100)))
			.thenReturn(pagePullRequestInfo);

		List<String> allCrews = githubService.getAllCrews(mockToken, mockOrganization, mockRepo, mockBranch, startTime,
				endTime);

		assertEquals(0, allCrews.size());
	}

	@Test
	void shouldReturnAllCrewsWhenPageIsMoreThan1AndDontGoToNextPage() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		String mockBranch = "branch";
		long startTime = 1717171200000L;
		long endTime = 1719763199999L;
		PullRequestInfo pullRequestWhenCreateIsBeforeStartTime = PullRequestInfo.builder()
			.number(1)
			.createdAt("2024-05-31T15:00:00Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test1").build())
			.build();
		PagePullRequestInfo pagePullRequestInfo = PagePullRequestInfo.builder()
			.totalPage(2)
			.pageInfo(List.of(pullRequestWhenCreateIsBeforeStartTime))
			.build();
		when(cachePageService.getGitHubPullRequest(eq("Bearer " + mockToken), eq(mockOrganization), eq(mockRepo),
				eq(mockBranch), anyInt(), eq(100)))
			.thenReturn(pagePullRequestInfo);

		List<String> allCrews = githubService.getAllCrews(mockToken, mockOrganization, mockRepo, mockBranch, startTime,
				endTime);

		assertEquals(0, allCrews.size());
	}

	@Test
	void shouldReturnAllCrewsWhenPageIsMoreThan1AndGoToNextPageAndDontGoToNextPageTwice() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		String mockBranch = "branch";
		long startTime = 1717171200000L;
		long endTime = 1719763199999L;
		PullRequestInfo pullRequestWhenCreateIsAfterEndTime = PullRequestInfo.builder()
			.number(3)
			.createdAt("2024-06-30T16:59:59Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test3").build())
			.build();
		PullRequestInfo pullRequestWhenCreateIsBeforeStartTime = PullRequestInfo.builder()
			.number(1)
			.createdAt("2024-05-31T15:00:00Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("test1").build())
			.build();
		PagePullRequestInfo pagePullRequestInfo1 = PagePullRequestInfo.builder()
			.totalPage(2)
			.pageInfo(List.of(pullRequestWhenCreateIsAfterEndTime))
			.build();
		PagePullRequestInfo pagePullRequestInfo2 = PagePullRequestInfo.builder()
			.totalPage(2)
			.pageInfo(List.of(pullRequestWhenCreateIsBeforeStartTime))
			.build();
		when(cachePageService.getGitHubPullRequest("Bearer " + mockToken, mockOrganization, mockRepo, mockBranch, 1,
				100))
			.thenReturn(pagePullRequestInfo1);
		when(cachePageService.getGitHubPullRequest("Bearer " + mockToken, mockOrganization, mockRepo, mockBranch, 2,
				100))
			.thenReturn(pagePullRequestInfo2);

		List<String> allCrews = githubService.getAllCrews(mockToken, mockOrganization, mockRepo, mockBranch, startTime,
				endTime);

		assertEquals(0, allCrews.size());
	}

	@Test
	void shouldReturnNoCrewsWhenPullRequestIsNullInTheFirstPage() {
		String mockToken = "mockToken";
		String mockOrganization = "organization";
		String mockRepo = "repo";
		String mockBranch = "branch";
		long startTime = 1717171200000L;
		long endTime = 1719763199999L;
		PagePullRequestInfo pagePullRequestInfo = PagePullRequestInfo.builder().totalPage(0).build();
		when(cachePageService.getGitHubPullRequest("Bearer " + mockToken, mockOrganization, mockRepo, mockBranch, 1,
				100))
			.thenReturn(pagePullRequestInfo);

		List<String> allCrews = githubService.getAllCrews(mockToken, mockOrganization, mockRepo, mockBranch, startTime,
				endTime);

		assertEquals(0, allCrews.size());
	}

	@Test
	void shouldFetchReportData() {
		String mockToken = "mockToken";
		String mockOrganization = "mockOrg";
		String mockRepo = "mockRepo";
		GenerateReportRequest request = GenerateReportRequest.builder()
			.timezone("Asia/Shanghai")
			.calendarType(CalendarTypeEnum.CN)
			.startTime("1717171200000")
			.endTime("1719763199999")
			.codebaseSetting(CodebaseSetting.builder()
				.token(mockToken)
				.crews(List.of("mockCrew1", "mockCrew2"))
				.codebases(List.of(CodeBase.builder()
					.organization(mockOrganization)
					.repo(mockRepo)
					.branches(List.of("mockBranch1"))
					.build()))
				.build())
			.build();
		List<CommitInfo> commitInfos = List.of(CommitInfo.builder()
			.commit(Commit.builder()
				.committer(Committer.builder().date("2024-05-31T17:00:00Z").email("1").name("1").build())
				.author(Author.builder().date("1").email("1").name("1").build())
				.message("mockMessage")
				.build())
			.build());

		pullRequestInfo = PullRequestInfo.builder()
			.number(1)
			.createdAt("2024-05-31T17:00:00Z")
			.mergedAt("2024-06-30T15:59:59Z")
			.user(PullRequestInfo.PullRequestUser.builder().login("mockCrew1").build())
			.build();
		PagePullRequestInfo pagePullRequestInfo = PagePullRequestInfo.builder()
			.totalPage(1)
			.pageInfo(List.of(pullRequestInfo))
			.build();

		when(cachePageService.getGitHubPullRequest(eq("Bearer " + mockToken), eq(mockOrganization), eq(mockRepo),
				anyString(), anyInt(), eq(100)))
			.thenReturn(pagePullRequestInfo);
		when(gitHubFeignClient.getPullRequestCommitInfo("mockOrg/mockRepo", "1", "Bearer mockToken"))
			.thenReturn(commitInfos);
		when(workDay.calculateWorkTimeAndHolidayBetween(any(Long.class), any(Long.class), any(CalendarTypeEnum.class),
				any(ZoneId.class)))
			.thenAnswer(invocation -> {
				long firstParam = invocation.getArgument(0);
				long secondParam = invocation.getArgument(1);
				return WorkInfo.builder().workTime(secondParam - firstParam).build();
			});

		FetchedData.RepoData repoData = githubService.fetchRepoData(request);
		List<SourceControlLeadTime> sourceControlLeadTimes = repoData.getSourceControlLeadTimes();

		assertEquals(1, sourceControlLeadTimes.size());

		SourceControlLeadTime sourceControlLeadTime = sourceControlLeadTimes.get(0);
		assertEquals("mockOrg", sourceControlLeadTime.getOrganization());
		assertEquals("mockRepo", sourceControlLeadTime.getRepo());

		List<LeadTime> leadTimes = sourceControlLeadTime.getLeadTimes();

		assertEquals(1, leadTimes.size());

		LeadTime leadTime = leadTimes.get(0);
		assertEquals(1717174800000L, leadTime.getPrCreatedTime());
		assertEquals(1719763199000L, leadTime.getPrMergedTime());
		assertEquals(1717174800000L, leadTime.getFirstCommitTimeInPr());
		assertEquals(1719763199000L, leadTime.getFirstCommitTime());
		assertEquals(2588399000L, leadTime.getPrLeadTime());
		assertEquals(0L, leadTime.getPipelineLeadTime());
		assertEquals(2588399000L, leadTime.getTotalTime());
		assertEquals(0L, leadTime.getHolidays());
		assertEquals(Boolean.FALSE, leadTime.getIsRevert());
		assertNull(leadTime.getCommitId());
		assertNull(leadTime.getJobFinishTime());
		assertNull(leadTime.getJobStartTime());
		assertNull(leadTime.getNoPRCommitTime());
		assertNull(leadTime.getPipelineCreateTime());
	}

}
