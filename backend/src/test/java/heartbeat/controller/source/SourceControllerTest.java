package heartbeat.controller.source;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import heartbeat.controller.source.dto.BranchRequest;
import heartbeat.controller.source.dto.CrewRequest;
import heartbeat.controller.source.dto.OrganizationRequest;
import heartbeat.controller.source.dto.RepoRequest;
import heartbeat.controller.source.dto.SourceControlDTO;
import heartbeat.controller.source.dto.VerifyBranchRequest;
import heartbeat.service.source.github.GitHubService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static heartbeat.TestFixtures.GITHUB_REPOSITORY;
import static heartbeat.TestFixtures.GITHUB_TOKEN;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SourceController.class)
@ExtendWith(SpringExtension.class)
@AutoConfigureJsonTesters
class SourceControllerTest {

	public static final String BAD_SOURCE_TYPE = "GitHub";

	public static final String NORMAL_SOURCE_TYPE = "github";

	public static final String MAIN_BRANCH = "main";

	public static final String EMPTY_BRANCH_NAME = "  ";

	@MockBean
	private GitHubService gitHubService;

	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldReturnNoContentStatusWhenVerifyToken() throws Exception {
		doNothing().when(gitHubService).verifyToken(GITHUB_TOKEN);
		SourceControlDTO sourceControlDTO = SourceControlDTO.builder().token(GITHUB_TOKEN).build();

		mockMvc
			.perform(post("/source-control/{sourceType}/verify", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(sourceControlDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());

		verify(gitHubService, times(1)).verifyToken(GITHUB_TOKEN);
	}

	@Test
	void shouldReturnNoContentStatusWhenVerifyTargetBranch() throws Exception {
		VerifyBranchRequest verifyBranchRequest = VerifyBranchRequest.builder()
			.repository(GITHUB_REPOSITORY)
			.token(GITHUB_TOKEN)
			.branch(MAIN_BRANCH)
			.build();
		doNothing().when(gitHubService).verifyCanReadTargetBranch(any(), any(), any());

		mockMvc
			.perform(post("/source-control/{sourceType}/repos/branches/verify", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(verifyBranchRequest))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());

		verify(gitHubService, times(1)).verifyCanReadTargetBranch(GITHUB_REPOSITORY, MAIN_BRANCH, GITHUB_TOKEN);
	}

	@Test
	void shouldReturnBadRequestGivenRequestBodyIsNullWhenVerifyToken() throws Exception {
		SourceControlDTO sourceControlDTO = SourceControlDTO.builder().build();

		final var response = mockMvc
			.perform(post("/source-control/{sourceType}/verify", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(sourceControlDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andReturn()
			.getResponse();

		final var content = response.getContentAsString();
		final var result = JsonPath.parse(content).read("$.token").toString();
		assertThat(result).contains("Token cannot be empty.");
	}

	@Test
	void shouldReturnBadRequestGivenTokenIsNullWhenVerifyBranch() throws Exception {
		VerifyBranchRequest verifyBranchRequest = VerifyBranchRequest.builder()
			.repository(GITHUB_REPOSITORY)
			.branch(MAIN_BRANCH)
			.build();

		final var response = mockMvc
			.perform(post("/source-control/{sourceType}/repos/branches/verify", NORMAL_SOURCE_TYPE, MAIN_BRANCH)
				.content(new ObjectMapper().writeValueAsString(verifyBranchRequest))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andReturn()
			.getResponse();

		final var content = response.getContentAsString();
		final var result = JsonPath.parse(content).read("$.token").toString();
		assertThat(result).contains("Token cannot be empty.");
	}

	@Test
	void shouldReturnBadRequestGivenRepositoryIsNullWhenVerifyBranch() throws Exception {
		VerifyBranchRequest verifyBranchRequest = VerifyBranchRequest.builder()
			.token(GITHUB_TOKEN)
			.branch(MAIN_BRANCH)
			.build();

		final var response = mockMvc
			.perform(post("/source-control/{sourceType}/repos/branches/verify", NORMAL_SOURCE_TYPE, MAIN_BRANCH)
				.content(new ObjectMapper().writeValueAsString(verifyBranchRequest))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andReturn()
			.getResponse();

		final var content = response.getContentAsString();
		final var result = JsonPath.parse(content).read("$.repository").toString();
		assertThat(result).contains("Repository is required.");
	}

	@Test
	void shouldReturnBadRequestGivenSourceTypeIsWrongWhenVerifyToken() throws Exception {
		SourceControlDTO sourceControlDTO = SourceControlDTO.builder().token(GITHUB_TOKEN).build();

		mockMvc
			.perform(post("/source-control/{sourceType}/verify", BAD_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(sourceControlDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest());
	}

	@Test
	void shouldReturnBadRequestGivenSourceTypeIsWrongWhenVerifyBranch() throws Exception {
		VerifyBranchRequest request = VerifyBranchRequest.builder()
			.repository(GITHUB_REPOSITORY)
			.token(GITHUB_TOKEN)
			.branch(MAIN_BRANCH)
			.build();

		mockMvc
			.perform(post("/source-control/{sourceType}/repos/branches/verify", BAD_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest());
	}

	@ParameterizedTest
	@NullSource
	@ValueSource(strings = { EMPTY_BRANCH_NAME, "" })
	void shouldReturnBadRequestGivenSourceTypeIsBlankWhenVerifyBranch(String branch) throws Exception {
		VerifyBranchRequest request = VerifyBranchRequest.builder()
			.token(GITHUB_TOKEN)
			.repository(GITHUB_REPOSITORY)
			.branch(branch)
			.build();

		var response = mockMvc
			.perform(post("/source-control/{sourceType}/repos/branches/verify", NORMAL_SOURCE_TYPE, EMPTY_BRANCH_NAME)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andReturn()
			.getResponse();

		final var content = response.getContentAsString();
		final var result = JsonPath.parse(content).read("$.branch").toString();
		assertThat(result).contains("Branch cannot be empty.");
	}

	@ParameterizedTest
	@ValueSource(strings = { "12345", EMPTY_BRANCH_NAME, "" })
	void shouldReturnBadRequestGivenRequestParamPatternIsIncorrectWhenVerifyToken(String token) throws Exception {
		SourceControlDTO sourceControlDTO = SourceControlDTO.builder().token(token).build();

		final var response = mockMvc
			.perform(post("/source-control/{sourceType}/verify", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(sourceControlDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andReturn()
			.getResponse();

		final var content = response.getContentAsString();
		final var result = JsonPath.parse(content).read("$.token").toString();
		assertThat(result).isEqualTo("token's pattern is incorrect");
	}

	@ParameterizedTest
	@ValueSource(strings = { "12345", "   ", "" })
	void shouldReturnBadRequestGivenRequestParamPatternIsIncorrectWhenVerifyBranch(String token) throws Exception {
		VerifyBranchRequest request = VerifyBranchRequest.builder()
			.token(token)
			.branch(MAIN_BRANCH)
			.repository(GITHUB_REPOSITORY)
			.build();

		final var response = mockMvc
			.perform(post("/source-control/{sourceType}/repos/branches/verify", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest())
			.andReturn()
			.getResponse();

		final var content = response.getContentAsString();
		final var result = JsonPath.parse(content).read("$.token").toString();
		assertThat(result).isEqualTo("token's pattern is incorrect");
	}

	@Test
	void shouldReturnAllOrganizationsWhenAllSuccess() throws Exception {
		OrganizationRequest request = OrganizationRequest.builder().token(GITHUB_TOKEN).build();

		when(gitHubService.getAllOrganizations(GITHUB_TOKEN)).thenReturn(List.of("test-org1"));

		mockMvc
			.perform(post("/source-control/{sourceType}/organizations", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name.length()").value(1))
			.andExpect(jsonPath("$.name[0]").value("test-org1"))
			.andReturn()
			.getResponse();

		verify(gitHubService).getAllOrganizations(GITHUB_TOKEN);
	}

	@Test
	void shouldReturnAllReposWhenAllSuccess() throws Exception {
		String mockOrganization = "organization";
		long endTime = 1L;
		RepoRequest request = RepoRequest.builder()
			.token(GITHUB_TOKEN)
			.organization(mockOrganization)
			.endTime(endTime)
			.build();

		when(gitHubService.getAllRepos(GITHUB_TOKEN, mockOrganization, endTime)).thenReturn(List.of("test-repo1"));

		mockMvc
			.perform(post("/source-control/{sourceType}/repos", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name.length()").value(1))
			.andExpect(jsonPath("$.name[0]").value("test-repo1"))
			.andReturn()
			.getResponse();

		verify(gitHubService).getAllRepos(GITHUB_TOKEN, mockOrganization, endTime);
	}

	@Test
	void shouldReturnAllBranchesWhenAllSuccess() throws Exception {
		String mockOrganization = "organization";
		String mockRepo = "repo";
		BranchRequest request = BranchRequest.builder()
			.token(GITHUB_TOKEN)
			.repo(mockRepo)
			.organization(mockOrganization)
			.build();

		when(gitHubService.getAllBranches(GITHUB_TOKEN, mockOrganization, mockRepo))
			.thenReturn(List.of("test-branch1"));

		mockMvc
			.perform(post("/source-control/{sourceType}/branches", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name.length()").value(1))
			.andExpect(jsonPath("$.name[0]").value("test-branch1"))
			.andReturn()
			.getResponse();

		verify(gitHubService).getAllBranches(GITHUB_TOKEN, mockOrganization, mockRepo);
	}

	@Test
	void shouldReturnAllCrewsWhenAllSuccess() throws Exception {
		String mockOrganization = "organization";
		String mockRepo = "repo";
		String mockBranch = "branch";
		long startTime = 1717171200000L;
		long endTime = 1719763199999L;
		CrewRequest request = CrewRequest.builder()
			.token(GITHUB_TOKEN)
			.repo(mockRepo)
			.organization(mockOrganization)
			.branch(mockBranch)
			.startTime(startTime)
			.endTime(endTime)
			.build();

		when(gitHubService.getAllCrews(GITHUB_TOKEN, mockOrganization, mockRepo, mockBranch, startTime, endTime))
			.thenReturn(List.of("test-crew1"));

		mockMvc
			.perform(post("/source-control/{sourceType}/crews", NORMAL_SOURCE_TYPE)
				.content(new ObjectMapper().writeValueAsString(request))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.crews.length()").value(1))
			.andExpect(jsonPath("$.crews[0]").value("test-crew1"))
			.andReturn()
			.getResponse();

		verify(gitHubService).getAllCrews(GITHUB_TOKEN, mockOrganization, mockRepo, mockBranch, startTime, endTime);
	}

}
