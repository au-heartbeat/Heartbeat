package heartbeat.service.pipeline.buildkite;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import heartbeat.client.BuildKiteFeignClient;
import heartbeat.client.GitHubFeignClient;
import heartbeat.client.dto.codebase.github.BranchesInfoDTO;
import heartbeat.client.dto.codebase.github.OrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PageBranchesInfoDTO;
import heartbeat.client.dto.codebase.github.PageOrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PagePullRequestInfo;
import heartbeat.client.dto.codebase.github.PageReposInfoDTO;
import heartbeat.client.dto.codebase.github.PullRequestInfo;
import heartbeat.client.dto.codebase.github.ReposInfoDTO;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteJob;
import heartbeat.client.dto.pipeline.buildkite.BuildKitePipelineDTO;
import heartbeat.client.dto.pipeline.buildkite.PageStepsInfoDto;
import heartbeat.exception.BaseException;
import heartbeat.exception.InternalServerErrorException;
import heartbeat.exception.NotFoundException;
import heartbeat.exception.PermissionDenyException;
import heartbeat.exception.RequestFailedException;
import heartbeat.exception.UnauthorizedException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CachePageServiceTest {

	@Mock
	BuildKiteFeignClient buildKiteFeignClient;

	@Mock
	GitHubFeignClient gitHubFeignClient;

	@InjectMocks
	CachePageService cachePageService;

	public static final String MOCK_TOKEN = "mock_token";

	public static final String TEST_ORG_ID = "test_org_id";

	private static final String MOCK_START_TIME = "1661702400000";

	private static final String MOCK_END_TIME = "1662739199000";

	public static final String TEST_JOB_NAME = "testJob";

	public static final String TEST_PIPELINE_ID = "test_pipeline_id";

	public static final String TOTAL_PAGE_HEADER = """
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?page=1&per_page=100>; rel="first",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?page=1&per_page=100>; rel="prev",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?per_page=100&page=2>; rel="next",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?page=3&per_page=100>; rel="last"
			""";

	public static final String NONE_PAGE_HEADER = """
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?pages=1&per_page=100>; rel="first",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?pages=1&per_page=100>; rel="prev",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?per_page=100&pages=2>; rel="next",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?pages=3&per_page=100>; rel="last"
			""";

	public static final String NONE_TOTAL_PAGE_HEADER = """
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?page=1&per_page=100>; rel="first",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?page=1&per_page=100>; rel="prev",
			<https://api.buildkite.com/v2/organizations/test_org_id/pipelines/test_pipeline_id/builds?per_page=100&page=2>; rel="next"
			""";

	public static final String GITHUB_TOTAL_PAGE_HEADER = """
			<https://api.github.com/repositories/517512988/branches?per_page=100&page=2>; rel="next",
			<https://api.github.com/repositories/517512988/branches?per_page=100&page=2>; rel="last"
			""";

	@Test
	void shouldReturnPageStepsInfoDtoWhenFetchPageStepsInfoSuccessGivenNullLinkHeader() {
		BuildKiteJob testJob = BuildKiteJob.builder().name(TEST_JOB_NAME).build();
		List<BuildKiteBuildInfo> buildKiteBuildInfoList = new ArrayList<>();
		buildKiteBuildInfoList.add(BuildKiteBuildInfo.builder()
			.jobs(List.of(testJob))
			.author(BuildKiteBuildInfo.Author.builder().name("xx").build())
			.build());
		ResponseEntity<List<BuildKiteBuildInfo>> responseEntity = new ResponseEntity<>(buildKiteBuildInfoList,
				HttpStatus.OK);
		when(buildKiteFeignClient.getPipelineSteps(anyString(), anyString(), anyString(), anyString(), anyString(),
				anyString(), anyString(), any()))
			.thenReturn(responseEntity);

		PageStepsInfoDto pageStepsInfoDto = cachePageService.fetchPageStepsInfo(MOCK_TOKEN, TEST_ORG_ID,
				TEST_PIPELINE_ID, "1", "100", MOCK_START_TIME, MOCK_END_TIME, List.of("main"));

		assertNotNull(pageStepsInfoDto);
		assertThat(pageStepsInfoDto.getFirstPageStepsInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageStepsInfoDto.getTotalPage()).isEqualTo(1);
	}

	@Test
	void shouldReturnPageStepsInfoDtoWhenFetchPageStepsInfoSuccessGivenValidLinkHeader() {
		HttpHeaders httpHeaders = buildHttpHeaders(TOTAL_PAGE_HEADER);
		List<BuildKiteBuildInfo> buildKiteBuildInfoList = new ArrayList<>();
		BuildKiteJob testJob = BuildKiteJob.builder().name(TEST_JOB_NAME).build();
		buildKiteBuildInfoList.add(BuildKiteBuildInfo.builder().jobs(List.of(testJob)).build());
		ResponseEntity<List<BuildKiteBuildInfo>> responseEntity = new ResponseEntity<>(buildKiteBuildInfoList,
				httpHeaders, HttpStatus.OK);
		when(buildKiteFeignClient.getPipelineSteps(anyString(), anyString(), anyString(), anyString(), anyString(),
				anyString(), anyString(), any()))
			.thenReturn(responseEntity);

		PageStepsInfoDto pageStepsInfoDto = cachePageService.fetchPageStepsInfo(MOCK_TOKEN, TEST_ORG_ID,
				TEST_PIPELINE_ID, "1", "100", MOCK_START_TIME, MOCK_END_TIME, List.of("main"));

		assertNotNull(pageStepsInfoDto);
		assertThat(pageStepsInfoDto.getFirstPageStepsInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageStepsInfoDto.getTotalPage()).isEqualTo(3);
	}

	@Test
	void shouldReturnPageStepsInfoDtoWhenFetchPageStepsInfoSuccessGivenExistButNotMatchedLinkHeader() {
		HttpHeaders httpHeaders = buildHttpHeaders(NONE_TOTAL_PAGE_HEADER);
		List<BuildKiteBuildInfo> buildKiteBuildInfoList = new ArrayList<>();
		BuildKiteJob testJob = BuildKiteJob.builder().name(TEST_JOB_NAME).build();
		buildKiteBuildInfoList.add(BuildKiteBuildInfo.builder().jobs(List.of(testJob)).build());
		ResponseEntity<List<BuildKiteBuildInfo>> responseEntity = new ResponseEntity<>(buildKiteBuildInfoList,
				httpHeaders, HttpStatus.OK);
		when(buildKiteFeignClient.getPipelineSteps(anyString(), anyString(), anyString(), anyString(), anyString(),
				anyString(), anyString(), any()))
			.thenReturn(responseEntity);

		PageStepsInfoDto pageStepsInfoDto = cachePageService.fetchPageStepsInfo(MOCK_TOKEN, TEST_ORG_ID,
				TEST_PIPELINE_ID, "1", "100", MOCK_START_TIME, MOCK_END_TIME, List.of("main"));

		assertNotNull(pageStepsInfoDto);
		assertThat(pageStepsInfoDto.getFirstPageStepsInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageStepsInfoDto.getTotalPage()).isEqualTo(1);
	}

	@Test
	void shouldReturnPageStepsInfoDtoWhenFetchPageStepsInfoSuccessGivenExistButNotMatchedPageLinkHeader() {
		HttpHeaders httpHeaders = buildHttpHeaders(NONE_PAGE_HEADER);
		List<BuildKiteBuildInfo> buildKiteBuildInfoList = new ArrayList<>();
		BuildKiteJob testJob = BuildKiteJob.builder().name(TEST_JOB_NAME).build();
		buildKiteBuildInfoList.add(BuildKiteBuildInfo.builder().jobs(List.of(testJob)).build());
		ResponseEntity<List<BuildKiteBuildInfo>> responseEntity = new ResponseEntity<>(buildKiteBuildInfoList,
				httpHeaders, HttpStatus.OK);
		when(buildKiteFeignClient.getPipelineSteps(anyString(), anyString(), anyString(), anyString(), anyString(),
				anyString(), anyString(), any()))
			.thenReturn(responseEntity);

		PageStepsInfoDto pageStepsInfoDto = cachePageService.fetchPageStepsInfo(MOCK_TOKEN, TEST_ORG_ID,
				TEST_PIPELINE_ID, "1", "100", MOCK_START_TIME, MOCK_END_TIME, List.of("main"));

		assertNotNull(pageStepsInfoDto);
		assertThat(pageStepsInfoDto.getFirstPageStepsInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageStepsInfoDto.getTotalPage()).isEqualTo(1);
	}

	@Test
	void shouldReturnPagePipelineInfoDtoWhenFetchPageStepsInfoSuccessGivenNullLinkHeader() throws IOException {
		HttpHeaders httpHeaders = buildHttpHeaders(TOTAL_PAGE_HEADER);
		ResponseEntity<List<BuildKitePipelineDTO>> responseEntity = getResponseEntity(httpHeaders,
				"src/test/java/heartbeat/controller/pipeline/buildKitePipelineInfoData.json");
		when(buildKiteFeignClient.getPipelineInfo(MOCK_TOKEN, TEST_ORG_ID, "1", "100")).thenReturn(responseEntity);

		var pageStepsInfoDto = cachePageService.getPipelineInfoList(TEST_ORG_ID, MOCK_TOKEN, "1", "100");

		assertNotNull(pageStepsInfoDto);
		assertThat(pageStepsInfoDto.getFirstPageInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageStepsInfoDto.getTotalPage()).isEqualTo(3);
	}

	@Test
	void shouldReturnPagePipelineInfoDtoWhenFetchPagePipelineInfoSuccessGivenExistButNotMatchedLinkHeader()
			throws IOException {
		HttpHeaders httpHeaders = buildHttpHeaders(NONE_TOTAL_PAGE_HEADER);
		ResponseEntity<List<BuildKitePipelineDTO>> responseEntity = getResponseEntity(httpHeaders,
				"src/test/java/heartbeat/controller/pipeline/buildKitePipelineInfoData.json");
		when(buildKiteFeignClient.getPipelineInfo(MOCK_TOKEN, TEST_ORG_ID, "1", "100")).thenReturn(responseEntity);

		var pagePipelineInfoDTO = cachePageService.getPipelineInfoList(TEST_ORG_ID, MOCK_TOKEN, "1", "100");

		assertNotNull(pagePipelineInfoDTO);
		assertThat(pagePipelineInfoDTO.getFirstPageInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pagePipelineInfoDTO.getTotalPage()).isEqualTo(1);
	}

	@Test
	void shouldReturnPageOrganizationsInfoDtoWhenFetchPageOrganizationsInfoSuccessGivenExist() throws IOException {
		HttpHeaders httpHeaders = buildGitHubHttpHeaders();
		ResponseEntity<List<OrganizationsInfoDTO>> responseEntity = getResponseEntity(httpHeaders,
				"src/test/java/heartbeat/controller/pipeline/githubOrganization.json");
		when(gitHubFeignClient.getAllOrganizations(MOCK_TOKEN, 100, 1)).thenReturn(responseEntity);

		PageOrganizationsInfoDTO pageOrganizationsInfoDTO = cachePageService.getGitHubOrganizations(MOCK_TOKEN, 1, 100);

		assertNotNull(pageOrganizationsInfoDTO);
		assertThat(pageOrganizationsInfoDTO.getPageInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageOrganizationsInfoDTO.getTotalPage()).isEqualTo(2);
	}

	@Test
	void shouldThrowExceptionWhenFetchPageOrganizationsInfoThrow500() {
		when(gitHubFeignClient.getAllOrganizations(MOCK_TOKEN, 100, 1)).thenThrow(new RequestFailedException(500, "error"));

		InternalServerErrorException internalServerErrorException = assertThrows(InternalServerErrorException.class, () -> cachePageService.getGitHubOrganizations(MOCK_TOKEN, 1, 100));

		assertEquals(500, internalServerErrorException.getStatus());
		assertEquals("Error to get paginated github organization info, page: 1, exception: heartbeat.exception.RequestFailedException: Request failed with status statusCode 500, error: error",
			internalServerErrorException.getMessage());
	}

	@ParameterizedTest
	@MethodSource("baseExceptionProvider")
	void shouldThrowExceptionWhenFetchPageOrganizationInfoThrow4xx(BaseException e, int errorCode) {
		when(gitHubFeignClient.getAllOrganizations(MOCK_TOKEN, 100, 1))
			.thenThrow(e);

		BaseException baseException = assertThrows(BaseException.class,
			() -> cachePageService.getGitHubOrganizations(MOCK_TOKEN, 1, 100));

		assertEquals(errorCode, baseException.getStatus());
		assertEquals("error",
			baseException.getMessage());
	}

	@Test
	void shouldReturnPageReposInfoDtoWhenFetchPageReposInfoSuccessGivenExist() throws IOException {
		String organization = "test-org";
		HttpHeaders httpHeaders = buildGitHubHttpHeaders();
		ResponseEntity<List<ReposInfoDTO>> responseEntity = getResponseEntity(httpHeaders,
				"src/test/java/heartbeat/controller/pipeline/githubRepo.json");
		when(gitHubFeignClient.getAllRepos(MOCK_TOKEN, organization, 100, 1)).thenReturn(responseEntity);

		PageReposInfoDTO pageReposInfoDTO = cachePageService.getGitHubRepos(MOCK_TOKEN, organization, 1, 100);

		assertNotNull(pageReposInfoDTO);
		assertThat(pageReposInfoDTO.getPageInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageReposInfoDTO.getTotalPage()).isEqualTo(2);
	}

	@Test
	void shouldThrowExceptionWhenFetchPageRepoInfoThrow500() {
		String organization = "test-org";
		when(gitHubFeignClient.getAllRepos(MOCK_TOKEN, organization, 100, 1))
			.thenThrow(new RequestFailedException(500, "error"));

		InternalServerErrorException internalServerErrorException = assertThrows(InternalServerErrorException.class,
				() -> cachePageService.getGitHubRepos(MOCK_TOKEN, organization, 1, 100));

		assertEquals(500, internalServerErrorException.getStatus());
		assertEquals(
				"Error to get paginated github repo info, page: 1, exception: heartbeat.exception.RequestFailedException: Request failed with status statusCode 500, error: error",
				internalServerErrorException.getMessage());
	}

	@ParameterizedTest
	@MethodSource("baseExceptionProvider")
	void shouldThrowExceptionWhenFetchPageRepoInfoThrow4xx(BaseException e, int errorCode) {
		String organization = "test-org";
		when(gitHubFeignClient.getAllRepos(MOCK_TOKEN, organization, 100, 1)).thenThrow(e);

		BaseException baseException = assertThrows(BaseException.class,
				() -> cachePageService.getGitHubRepos(MOCK_TOKEN, organization, 1, 100));

		assertEquals(errorCode, baseException.getStatus());
		assertEquals("error", baseException.getMessage());
	}

	@Test
	void shouldReturnPageBranchesInfoDtoWhenFetchPageBranchesInfoSuccessGivenExist() throws IOException {
		String organization = "test-org";
		String repo = "test-repo";
		HttpHeaders httpHeaders = buildGitHubHttpHeaders();
		ResponseEntity<List<BranchesInfoDTO>> responseEntity = getResponseEntity(httpHeaders,
				"src/test/java/heartbeat/controller/pipeline/githubBranch.json");
		when(gitHubFeignClient.getAllBranches(MOCK_TOKEN, organization, repo, 100, 1)).thenReturn(responseEntity);

		PageBranchesInfoDTO pageBranchesInfoDTO = cachePageService.getGitHubBranches(MOCK_TOKEN, organization, repo, 1,
				100);

		assertNotNull(pageBranchesInfoDTO);
		assertThat(pageBranchesInfoDTO.getPageInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pageBranchesInfoDTO.getTotalPage()).isEqualTo(2);
	}

	@Test
	void shouldThrowExceptionWhenFetchPageBranchInfoThrow500() {
		String organization = "test-org";
		String repo = "test-repo";
		when(gitHubFeignClient.getAllBranches(MOCK_TOKEN, organization, repo, 100, 1))
			.thenThrow(new RequestFailedException(500, "error"));

		InternalServerErrorException internalServerErrorException = assertThrows(InternalServerErrorException.class,
				() -> cachePageService.getGitHubBranches(MOCK_TOKEN, organization, repo, 1, 100));

		assertEquals(500, internalServerErrorException.getStatus());
		assertEquals(
				"Error to get paginated github branch info, page: 1, exception: heartbeat.exception.RequestFailedException: Request failed with status statusCode 500, error: error",
				internalServerErrorException.getMessage());
	}

	@ParameterizedTest
	@MethodSource("baseExceptionProvider")
	void shouldThrowExceptionWhenFetchPageBranchInfoThrow4xx(BaseException e, int errorCode) {
		String organization = "test-org";
		String repo = "test-repo";
		when(gitHubFeignClient.getAllBranches(MOCK_TOKEN, organization, repo, 100, 1)).thenThrow(e);

		BaseException baseException = assertThrows(BaseException.class,
				() -> cachePageService.getGitHubBranches(MOCK_TOKEN, organization, repo, 1, 100));

		assertEquals(errorCode, baseException.getStatus());
		assertEquals("error", baseException.getMessage());
	}

	@Test
	void shouldReturnPagePullRequestInfoDtoWhenFetchPullRequestInfoSuccessGivenExist() throws IOException {
		String organization = "test-org";
		String repo = "test-repo";
		String branch = "test-branch";
		HttpHeaders httpHeaders = buildGitHubHttpHeaders();
		ResponseEntity<List<PullRequestInfo>> responseEntity = getResponseEntity(httpHeaders,
				"src/test/java/heartbeat/controller/pipeline/githubPullRequest.json");
		when(gitHubFeignClient.getAllPullRequests(MOCK_TOKEN, organization, repo, 100, 1, branch, "all"))
			.thenReturn(responseEntity);

		PagePullRequestInfo pagePullRequestInfo = cachePageService.getGitHubPullRequest(MOCK_TOKEN, organization, repo,
				branch, 1, 100);

		assertNotNull(pagePullRequestInfo);
		assertThat(pagePullRequestInfo.getPageInfo()).isEqualTo(responseEntity.getBody());
		assertThat(pagePullRequestInfo.getTotalPage()).isEqualTo(2);
	}

	@Test
	void shouldThrowExceptionWhenFetchPagePullRequestInfoThrow500() {
		String organization = "test-org";
		String repo = "test-repo";
		String branch = "test-branch";
		when(gitHubFeignClient.getAllPullRequests(MOCK_TOKEN, organization, repo, 100, 1, branch, "all"))
			.thenThrow(new RequestFailedException(500, "error"));

		InternalServerErrorException internalServerErrorException = assertThrows(InternalServerErrorException.class,
				() -> cachePageService.getGitHubPullRequest(MOCK_TOKEN, organization, repo, branch, 1, 100));
		assertEquals(500, internalServerErrorException.getStatus());
		assertEquals(
				"Error to get paginated github pull request info, page: 1, exception: heartbeat.exception.RequestFailedException: Request failed with status statusCode 500, error: error",
				internalServerErrorException.getMessage());
	}

	@ParameterizedTest
	@MethodSource("baseExceptionProvider")
	void shouldThrowExceptionWhenFetchPagePullRequestInfoThrow4xx(BaseException e, int errorCode) {
		String organization = "test-org";
		String repo = "test-repo";
		String branch = "test-branch";
		when(gitHubFeignClient.getAllPullRequests(MOCK_TOKEN, organization, repo, 100, 1, branch, "all")).thenThrow(e);

		BaseException baseException = assertThrows(BaseException.class,
				() -> cachePageService.getGitHubPullRequest(MOCK_TOKEN, organization, repo, branch, 1, 100));

		assertEquals(errorCode, baseException.getStatus());
		assertEquals("error", baseException.getMessage());
	}

	private static <T> ResponseEntity<List<T>> getResponseEntity(HttpHeaders httpHeaders, String pathname)
			throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		List<T> pipelineDTOS = mapper.readValue(new File(pathname), new TypeReference<>() {
		});
		return new ResponseEntity<>(pipelineDTOS, httpHeaders, HttpStatus.OK);
	}

	private HttpHeaders buildHttpHeaders(String totalPageHeader) {
		List<String> linkHeader = new ArrayList<>();
		linkHeader.add(totalPageHeader);
		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.addAll(HttpHeaders.LINK, linkHeader);
		return httpHeaders;
	}

	private HttpHeaders buildGitHubHttpHeaders() {
		return buildHttpHeaders(GITHUB_TOTAL_PAGE_HEADER);
	}

	static Stream<Arguments> baseExceptionProvider() {
		return Stream.of(Arguments.of(new PermissionDenyException("error"), 403),
				Arguments.of(new UnauthorizedException("error"), 401), Arguments.of(new NotFoundException("error"), 404)

		);
	}

}
