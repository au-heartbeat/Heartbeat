package heartbeat.client;

import heartbeat.client.decoder.GitHubFeignClientDecoder;
import heartbeat.client.dto.codebase.github.BranchesInfoDTO;
import heartbeat.client.dto.codebase.github.CommitInfo;
import heartbeat.client.dto.codebase.github.OrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PullRequestInfo;

import heartbeat.client.dto.codebase.github.PullRequestInfoDTO;
import heartbeat.client.dto.codebase.github.ReposInfoDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@FeignClient(name = "githubFeignClient", url = "${github.url}", configuration = GitHubFeignClientDecoder.class)
public interface GitHubFeignClient {

	@GetMapping(path = "/octocat")
	void verifyToken(@RequestHeader("Authorization") String token);

	@GetMapping(path = "/repos/{repository}/branches/{branchName}")
	void verifyCanReadTargetBranch(@PathVariable String repository, @PathVariable String branchName,
			@RequestHeader("Authorization") String token);

	@Cacheable(cacheNames = "commitInfo", key = "#repository+'-'+#commitId+'-'+#token")
	@GetMapping(path = "/repos/{repository}/commits/{commitId}")
	@ResponseStatus(HttpStatus.OK)
	CommitInfo getCommitInfo(@PathVariable String repository, @PathVariable String commitId,
			@RequestHeader("Authorization") String token);

	@Cacheable(cacheNames = "pullRequestCommitInfo", key = "#repository+'-'+#mergedPullNumber+'-'+#token")
	@GetMapping(path = "/repos/{repository}/pulls/{mergedPullNumber}/commits")
	@ResponseStatus(HttpStatus.OK)
	List<CommitInfo> getPullRequestCommitInfo(@PathVariable String repository, @PathVariable String mergedPullNumber,
			@RequestHeader("Authorization") String token);

	@Cacheable(cacheNames = "pullRequestListInfo", key = "#repository+'-'+#deployId+'-'+#token")
	@GetMapping(path = "/repos/{repository}/commits/{deployId}/pulls")
	@ResponseStatus(HttpStatus.OK)
	List<PullRequestInfo> getPullRequestListInfo(@PathVariable String repository, @PathVariable String deployId,
			@RequestHeader("Authorization") String token);

	@GetMapping(path = "/user/orgs")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<OrganizationsInfoDTO>> getAllOrganizations(@RequestHeader("Authorization") String token,
			@RequestParam("per_page") int perPage, @RequestParam("page") int page);

	@GetMapping(path = "/orgs/{org}/repos")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<ReposInfoDTO>> getAllRepos(@RequestHeader("Authorization") String token,
			@PathVariable("org") String org, @RequestParam("per_page") int perPage, @RequestParam("page") int page);

	@GetMapping(path = "/repos/{org}/{repo}/branches")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<BranchesInfoDTO>> getAllBranches(@RequestHeader("Authorization") String token,
			@PathVariable("org") String org, @PathVariable("repo") String repo, @RequestParam("per_page") int perPage,
			@RequestParam("page") int page);

	@GetMapping(path = "/repos/{org}/{repo}/pulls")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<PullRequestInfoDTO>> getAllPullRequests(@RequestHeader("Authorization") String token,
			@PathVariable("org") String org, @PathVariable("repo") String repo, @RequestParam("per_page") int perPage,
			@RequestParam("page") int page, @RequestParam("base") String base, @RequestParam("state") String state);

}
