package heartbeat.client;

import heartbeat.client.decoder.GitHubFeignClientDecoder;
import heartbeat.client.dto.codebase.github.BranchesInfoDTO;
import heartbeat.client.dto.codebase.github.CommitInfo;
import heartbeat.client.dto.codebase.github.OrganizationsInfoDTO;

import heartbeat.client.dto.codebase.github.PullRequestInfo;
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

import java.net.URI;
import java.util.List;

@FeignClient(name = "githubFeignClient", url = "${github.url}", configuration = GitHubFeignClientDecoder.class)
public interface GitHubFeignClient {

	@GetMapping(path = "/octocat")
	void verifyToken(URI uri, @RequestHeader("Authorization") String token);

	@GetMapping(path = "/repos/{repository}/branches/{branchName}")
	void verifyCanReadTargetBranch(URI uri, @PathVariable String repository, @PathVariable String branchName,
			@RequestHeader("Authorization") String token);

	@Cacheable(cacheNames = "commitInfo", key = "#uri+'-'+#repository+'-'+#commitId+'-'+#token")
	@GetMapping(path = "/repos/{repository}/commits/{commitId}")
	@ResponseStatus(HttpStatus.OK)
	CommitInfo getCommitInfo(URI uri, @PathVariable String repository, @PathVariable String commitId,
			@RequestHeader("Authorization") String token);

	@Cacheable(cacheNames = "pullRequestCommitInfo", key = "#uri+'-'+#repository+'-'+#mergedPullNumber+'-'+#token")
	@GetMapping(path = "/repos/{repository}/pulls/{mergedPullNumber}/commits")
	@ResponseStatus(HttpStatus.OK)
	List<CommitInfo> getPullRequestCommitInfo(URI uri, @PathVariable String repository,
			@PathVariable String mergedPullNumber, @RequestHeader("Authorization") String token);

	@Cacheable(cacheNames = "pullRequestListInfo", key = "#uri+'-'+#repository+'-'+#deployId+'-'+#token")
	@GetMapping(path = "/repos/{repository}/commits/{deployId}/pulls")
	@ResponseStatus(HttpStatus.OK)
	List<PullRequestInfo> getPullRequestListInfo(URI uri, @PathVariable String repository,
			@PathVariable String deployId, @RequestHeader("Authorization") String token);

	@GetMapping(path = "/user/orgs")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<OrganizationsInfoDTO>> getAllOrganizations(URI uri,
			@RequestHeader("Authorization") String token, @RequestParam("per_page") int perPage,
			@RequestParam("page") int page);

	@GetMapping(path = "/orgs/{org}/repos")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<ReposInfoDTO>> getAllRepos(URI uri, @RequestHeader("Authorization") String token,
			@PathVariable("org") String org, @RequestParam("per_page") int perPage, @RequestParam("page") int page);

	@GetMapping(path = "/repos/{org}/{repo}/branches")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<BranchesInfoDTO>> getAllBranches(URI uri, @RequestHeader("Authorization") String token,
			@PathVariable("org") String org, @PathVariable("repo") String repo, @RequestParam("per_page") int perPage,
			@RequestParam("page") int page);

	@GetMapping(path = "/repos/{org}/{repo}/pulls")
	@ResponseStatus(HttpStatus.OK)
	ResponseEntity<List<PullRequestInfo>> getAllPullRequests(URI uri, @RequestHeader("Authorization") String token,
			@PathVariable("org") String org, @PathVariable("repo") String repo, @RequestParam("per_page") int perPage,
			@RequestParam("page") int page, @RequestParam("base") String base, @RequestParam("state") String state);

}
