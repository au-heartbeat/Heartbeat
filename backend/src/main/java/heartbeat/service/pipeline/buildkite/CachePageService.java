package heartbeat.service.pipeline.buildkite;

import heartbeat.client.BuildKiteFeignClient;
import heartbeat.client.GitHubFeignClient;
import heartbeat.client.dto.codebase.github.BranchesInfoDTO;
import heartbeat.client.dto.codebase.github.OrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PageBranchesInfoDTO;
import heartbeat.client.dto.codebase.github.PageOrganizationsInfoDTO;
import heartbeat.client.dto.codebase.github.PagePullRequestInfoDTO;
import heartbeat.client.dto.codebase.github.PageReposInfoDTO;
import heartbeat.client.dto.codebase.github.PullRequestInfoDTO;
import heartbeat.client.dto.codebase.github.ReposInfoDTO;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.PageBuildKitePipelineInfoDTO;
import heartbeat.client.dto.pipeline.buildkite.PageStepsInfoDto;
import heartbeat.exception.BaseException;
import heartbeat.exception.InternalServerErrorException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Log4j2
public class CachePageService {

	public static final String BUILD_KITE_LINK_HEADER = HttpHeaders.LINK;

	public static final String PARSE_TOTAL_PAGE_LOG = "Successfully parse the total page_total page: {}";

	private final BuildKiteFeignClient buildKiteFeignClient;

	private final GitHubFeignClient gitHubFeignClient;

	@Cacheable(cacheNames = "pageStepsInfo", key = "#realToken+'-'+#orgId+'-'+#pipelineId+'-'+#page+'-'+#perPage+'-'"
			+ "+#createdFrom+'-'+#createdTo+'-'+(#branches!=null ? #branches.toString() : '')")
	public PageStepsInfoDto fetchPageStepsInfo(String realToken, String orgId, String pipelineId, String page,
			String perPage, String createdFrom, String createdTo, List<String> branches) {
		ResponseEntity<List<BuildKiteBuildInfo>> pipelineStepsInfo = buildKiteFeignClient.getPipelineSteps(realToken,
				orgId, pipelineId, page, perPage, createdFrom, createdTo, branches);

		log.info(
				"Successfully get paginated pipeline steps pagination info, orgId: {},pipelineId: {}, createdFrom: {},  createdTo: {}, result status code: {}, page:{}",
				orgId, pipelineId, createdFrom, createdTo, pipelineStepsInfo.getStatusCode(), page);

		int totalPage = parseTotalPage(pipelineStepsInfo.getHeaders().get(BUILD_KITE_LINK_HEADER));
		log.info(PARSE_TOTAL_PAGE_LOG, totalPage);
		List<BuildKiteBuildInfo> firstPageStepsInfo = pipelineStepsInfo.getBody();
		return PageStepsInfoDto.builder().firstPageStepsInfo(firstPageStepsInfo).totalPage(totalPage).build();
	}

	@Cacheable(cacheNames = "pagePipelineInfo", key = "#buildKiteToken+'-'+#orgSlug+'-'+#page+'-'+#perPage")
	public PageBuildKitePipelineInfoDTO getPipelineInfoList(String orgSlug, String buildKiteToken, String page,
			String perPage) {
		var pipelineInfoResponse = buildKiteFeignClient.getPipelineInfo(buildKiteToken, orgSlug, page, perPage);
		log.info("Successfully get paginated pipeline info pagination info, orgSlug: {}, page:{}", orgSlug, 1);

		int totalPage = parseTotalPage(pipelineInfoResponse.getHeaders().get(BUILD_KITE_LINK_HEADER));
		log.info(PARSE_TOTAL_PAGE_LOG, totalPage);

		return PageBuildKitePipelineInfoDTO.builder()
			.firstPageInfo(pipelineInfoResponse.getBody())
			.totalPage(totalPage)
			.build();
	}

	@Cacheable(cacheNames = "pageOrganization", key = "#token+'-'+#page+'-'+#perPage")
	public PageOrganizationsInfoDTO getGitHubOrganizations(String token, int page, int perPage) {
		try {
			log.info("Start to get paginated github organization info, page: {}", page);
			ResponseEntity<List<OrganizationsInfoDTO>> allOrganizations = gitHubFeignClient.getAllOrganizations(token,
					perPage, page);
			log.info("Successfully get paginated github organization info, page: {}", page);
			int totalPage = parseTotalPage(allOrganizations.getHeaders().get(BUILD_KITE_LINK_HEADER));
			return PageOrganizationsInfoDTO.builder().pageInfo(allOrganizations.getBody()).totalPage(totalPage).build();
		}
		catch (BaseException e) {
			log.info("Error to get paginated github organization info, page: {}, exception: {}", page, e);
			if (e.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
				throw new InternalServerErrorException(String
					.format("Error to get paginated github organization info, page: %s, exception: %s", page, e));
			}
			throw e;
		}
	}

	@Cacheable(cacheNames = "pageRepo", key = "#token+'-'+#organization+'-'+#page+'-'+#perPage")
	public PageReposInfoDTO getGitHubRepos(String token, String organization, int page, int perPage) {
		try {
			log.info("Start to get paginated github repo info, page: {}", page);
			ResponseEntity<List<ReposInfoDTO>> allRepos = gitHubFeignClient.getAllRepos(token, organization, perPage,
					page);
			log.info("Successfully get paginated github repo info, page: {}", page);
			int totalPage = parseTotalPage(allRepos.getHeaders().get(BUILD_KITE_LINK_HEADER));
			return PageReposInfoDTO.builder().pageInfo(allRepos.getBody()).totalPage(totalPage).build();
		}
		catch (BaseException e) {
			log.info("Error to get paginated github repo info, page: {}, exception: {}", page, e);
			if (e.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
				throw new InternalServerErrorException(
						String.format("Error to get paginated github repo info, page: %s, exception: %s", page, e));
			}
			throw e;
		}
	}

	@Cacheable(cacheNames = "pageBranch", key = "#token+'-'+#organization+'-'+#repo+'-'+#page+'-'+#perPage")
	public PageBranchesInfoDTO getGitHubBranches(String token, String organization, String repo, int page,
			int perPage) {
		try {
			log.info("Start to get paginated github branch info, page: {}", page);
			ResponseEntity<List<BranchesInfoDTO>> allRepos = gitHubFeignClient.getAllBranches(token, organization, repo,
					perPage, page);
			log.info("Successfully get paginated github branch info, page: {}", page);
			int totalPage = parseTotalPage(allRepos.getHeaders().get(BUILD_KITE_LINK_HEADER));
			return PageBranchesInfoDTO.builder().pageInfo(allRepos.getBody()).totalPage(totalPage).build();
		}
		catch (BaseException e) {
			log.info("Error to get paginated github branch info, page: {}, exception: {}", page, e);
			if (e.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
				throw new InternalServerErrorException(
						String.format("Error to get paginated github branch info, page: %s, exception: %s", page, e));
			}
			throw e;
		}
	}

	@Cacheable(cacheNames = "pagePullRequest",
			key = "#token+'-'+#organization+'-'+#repo+'-'+#branch+'-'+#page+'-'+#perPage")
	public PagePullRequestInfoDTO getGitHubPullRequest(String token, String organization, String repo, String branch,
			int page, int perPage) {
		try {
			log.info("Start to get paginated github pull request info, page: {}", page);
			ResponseEntity<List<PullRequestInfoDTO>> allPullRequests = gitHubFeignClient.getAllPullRequests(token,
					organization, repo, perPage, page, branch, "all");
			log.info("Successfully get paginated github pull request info, page: {}", page);
			int totalPage = parseTotalPage(allPullRequests.getHeaders().get(BUILD_KITE_LINK_HEADER));
			return PagePullRequestInfoDTO.builder().pageInfo(allPullRequests.getBody()).totalPage(totalPage).build();
		}
		catch (BaseException e) {
			log.info("Error to get paginated github pull request info, page: {}, exception: {}", page, e);
			if (e.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
				throw new InternalServerErrorException(String
					.format("Error to get paginated github pull request info, page: %s, exception: %s", page, e));
			}
			throw e;
		}
	}

	private int parseTotalPage(@Nullable List<String> linkHeader) {
		if (linkHeader == null) {
			return 1;
		}
		String lastLink = linkHeader.stream().map(link -> link.replaceAll("per_page=\\d+", "")).findFirst().orElse("");
		int lastIndex = lastLink.indexOf("rel=\"last\"");
		if (lastIndex == -1) {
			return 1;
		}
		String beforeLastRel = lastLink.substring(0, lastIndex);
		Matcher matcher = Pattern.compile("page=(\\d+)").matcher(beforeLastRel);

		String lastNumber = null;
		while (matcher.find()) {
			lastNumber = matcher.group(1);
		}
		if (lastNumber != null) {
			return Integer.parseInt(lastNumber);
		}
		else {
			return 1;
		}
	}

}
