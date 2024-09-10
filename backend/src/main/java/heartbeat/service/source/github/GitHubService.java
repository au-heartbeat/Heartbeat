package heartbeat.service.source.github;

import heartbeat.client.GitHubFeignClient;
import heartbeat.client.dto.codebase.github.BranchesInfoDTO;
import heartbeat.client.dto.codebase.github.CommitInfo;
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
import heartbeat.controller.report.dto.request.CodeBase;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.LeadTimeInfo;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.exception.BadRequestException;
import heartbeat.exception.BaseException;
import heartbeat.exception.InternalServerErrorException;
import heartbeat.exception.NotFoundException;
import heartbeat.exception.PermissionDenyException;
import heartbeat.exception.UnauthorizedException;
import heartbeat.service.pipeline.buildkite.CachePageService;
import heartbeat.service.report.WorkDay;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.service.report.model.WorkInfo;
import heartbeat.service.source.github.model.PipelineInfoOfRepository;
import heartbeat.service.source.github.model.PullRequestFinishedInfo;
import heartbeat.util.GithubUtil;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.IntStream;

import static java.util.Optional.ofNullable;

@Service
@RequiredArgsConstructor
@Log4j2
public class GitHubService {

	public static final String TOKEN_TITLE = "token ";

	public static final String BEARER_TITLE = "Bearer ";

	public static final int BATCH_SIZE = 10;

	public static final int PER_PAGE = 100;

	private final GitHubFeignClient gitHubFeignClient;

	private final CachePageService cachePageService;

	private final ThreadPoolTaskExecutor customTaskExecutor;

	private final WorkDay workDay;

	@PreDestroy
	public void shutdownExecutor() {
		customTaskExecutor.shutdown();
	}

	public void verifyToken(String githubToken) {
		try {
			String token = TOKEN_TITLE + githubToken;
			log.info("Start to request github with token");
			gitHubFeignClient.verifyToken(token);
			log.info("Successfully verify token from github");
		}
		catch (RuntimeException e) {
			Throwable cause = ofNullable(e.getCause()).orElse(e);
			log.error("Failed to call GitHub with token_error: {} ", cause.getMessage());
			if (cause instanceof BaseException baseException) {
				throw baseException;
			}
			throw new InternalServerErrorException(
					String.format("Failed to call GitHub with token_error: %s", cause.getMessage()));
		}
	}

	public void verifyCanReadTargetBranch(String repository, String branch, String githubToken) {
		try {
			String token = TOKEN_TITLE + githubToken;
			log.info("Start to request github branch: {}", branch);
			gitHubFeignClient.verifyCanReadTargetBranch(GithubUtil.getGithubUrlFullName(repository), branch, token);
			log.info("Successfully verify target branch for github, branch: {}", branch);
		}
		catch (NotFoundException e) {
			log.error("Failed to call GitHub with branch: {}, error: {} ", branch, e.getMessage());
			throw new NotFoundException(String.format("Unable to read target branch: %s", branch));
		}
		catch (PermissionDenyException e) {
			log.error("Failed to call GitHub token access error, error: {} ", e.getMessage());
			throw new UnauthorizedException("Unable to read target organization");
		}
		catch (UnauthorizedException e) {
			log.error("Failed to call GitHub with token_error: {}, error: {} ", branch, e.getMessage());
			throw new BadRequestException(String.format("Unable to read target branch: %s, with token error", branch));
		}
		catch (RuntimeException e) {
			Throwable cause = ofNullable(e.getCause()).orElse(e);
			log.error("Failed to call GitHub branch:{} with error: {} ", branch, cause.getMessage());
			if (cause instanceof BaseException baseException) {
				throw baseException;
			}
			throw new InternalServerErrorException(
					String.format("Failed to call GitHub branch: %s with error: %s", branch, cause.getMessage()));
		}
	}

	public List<PipelineLeadTime> fetchPipelinesLeadTime(List<DeployTimes> deployTimes,
			Map<String, String> repositories, String token, GenerateReportRequest request) {
		try {
			String realToken = BEARER_TITLE + token;
			List<PipelineInfoOfRepository> pipelineInfoOfRepositories = getInfoOfRepositories(deployTimes,
					repositories);

			List<CompletableFuture<PipelineLeadTime>> pipelineLeadTimeFutures = pipelineInfoOfRepositories.stream()
				.map(item -> {
					if (item.getPassedDeploy() == null || item.getPassedDeploy().isEmpty()) {
						return CompletableFuture.completedFuture(PipelineLeadTime.builder().build());
					}

					List<CompletableFuture<LeadTime>> leadTimeFutures = getLeadTimeFutures(realToken, item, request);

					CompletableFuture<List<LeadTime>> allLeadTimesFuture = CompletableFuture
						.allOf(leadTimeFutures.toArray(new CompletableFuture[0]))
						.thenApply(v -> leadTimeFutures.stream()
							.map(CompletableFuture::join)
							.filter(Objects::nonNull)
							.toList());

					return allLeadTimesFuture.thenApply(leadTimes -> PipelineLeadTime.builder()
						.pipelineName(item.getPipelineName())
						.pipelineStep(item.getPipelineStep())
						.leadTimes(leadTimes)
						.build());
				})
				.toList();

			return pipelineLeadTimeFutures.stream().map(CompletableFuture::join).toList();
		}
		catch (RuntimeException e) {
			Throwable cause = ofNullable(e.getCause()).orElse(e);
			log.error("Failed to get pipeline leadTimes_error: {}", cause.getMessage());
			if (cause instanceof BaseException baseException) {
				throw baseException;
			}
			throw new InternalServerErrorException(
					String.format("Failed to get pipeline leadTimes, cause is: %s", cause.getMessage()));
		}

	}

	private List<CompletableFuture<LeadTime>> getLeadTimeFutures(String realToken, PipelineInfoOfRepository item,
			GenerateReportRequest request) {
		return item.getPassedDeploy().stream().map(deployInfo -> {
			CompletableFuture<List<PullRequestInfo>> pullRequestInfoFuture = CompletableFuture.supplyAsync(() -> {
				try {
					return gitHubFeignClient.getPullRequestListInfo(item.getRepository(), deployInfo.getCommitId(),
							realToken);
				}
				catch (NotFoundException e) {
					return Collections.emptyList();
				}
			});
			return pullRequestInfoFuture.thenApply(pullRequestInfos -> getLeadTimeByPullRequest(realToken, item,
					deployInfo, pullRequestInfos, request));
		}).filter(Objects::nonNull).toList();
	}

	private List<PipelineInfoOfRepository> getInfoOfRepositories(List<DeployTimes> deployTimes,
			Map<String, String> repositories) {
		return deployTimes.stream().map(deployTime -> {
			String repository = GithubUtil.getGithubUrlFullName(repositories.get(deployTime.getPipelineId()));
			List<DeployInfo> validPassedDeploy = deployTime.getPassed() == null ? null
					: deployTime.getPassed()
						.stream()
						.filter(deployInfo -> deployInfo.getJobName().equals(deployTime.getPipelineStep()))
						.toList();
			return PipelineInfoOfRepository.builder()
				.repository(repository)
				.passedDeploy(validPassedDeploy)
				.pipelineStep(deployTime.getPipelineStep())
				.pipelineName(deployTime.getPipelineName())
				.build();
		}).toList();
	}

	private LeadTime getLeadTimeByPullRequest(String realToken, PipelineInfoOfRepository item, DeployInfo deployInfo,
			List<PullRequestInfo> pullRequestInfos, GenerateReportRequest request) {
		LeadTime noPrLeadTime = parseNoMergeLeadTime(deployInfo, item, realToken);
		if (pullRequestInfos.isEmpty()) {
			return noPrLeadTime;
		}

		Optional<PullRequestInfo> mergedPull = pullRequestInfos.stream()
			.filter(gitHubPull -> gitHubPull.getMergedAt() != null
					&& gitHubPull.getUrl().contains(item.getRepository()))
			.min(Comparator.comparing(PullRequestInfo::getNumber));

		if (mergedPull.isEmpty()) {
			return noPrLeadTime;
		}

		List<CommitInfo> commitInfos = gitHubFeignClient.getPullRequestCommitInfo(item.getRepository(),
				mergedPull.get().getNumber().toString(), realToken);
		CommitInfo firstCommitInfo = commitInfos.get(0);
		if (!mergedPull.get().getMergeCommitSha().equals(deployInfo.getCommitId())) {
			return noPrLeadTime;
		}
		return mapLeadTimeWithInfo(mergedPull.get(), deployInfo, firstCommitInfo, request);
	}

	private LeadTime parseNoMergeLeadTime(DeployInfo deployInfo, PipelineInfoOfRepository item, String realToken) {
		long jobFinishTime = Instant.parse(deployInfo.getJobFinishTime()).toEpochMilli();
		long jobStartTime = Instant.parse(deployInfo.getJobStartTime()).toEpochMilli();
		long pipelineCreateTime = Instant.parse(deployInfo.getPipelineCreateTime()).toEpochMilli();
		long prLeadTime = 0;
		long firstCommitTime;
		CommitInfo commitInfo = new CommitInfo();
		try {
			commitInfo = gitHubFeignClient.getCommitInfo(item.getRepository(), deployInfo.getCommitId(), realToken);
		}
		catch (Exception e) {
			log.error("Failed to get commit info_repoId: {},commitId: {}, error: {}", item.getRepository(),
					deployInfo.getCommitId(), e.getMessage());
		}

		Long noPRCommitTime = null;
		if (commitInfo.getCommit() != null && commitInfo.getCommit().getCommitter() != null
				&& commitInfo.getCommit().getCommitter().getDate() != null) {
			noPRCommitTime = Instant.parse(commitInfo.getCommit().getCommitter().getDate()).toEpochMilli();
			firstCommitTime = noPRCommitTime;
		}
		else {
			firstCommitTime = jobStartTime;
		}

		return LeadTime.builder()
			.commitId(deployInfo.getCommitId())
			.pipelineCreateTime(pipelineCreateTime)
			.jobFinishTime(jobFinishTime)
			.jobStartTime(jobStartTime)
			.noPRCommitTime(noPRCommitTime)
			.firstCommitTime(firstCommitTime)
			.pipelineLeadTime(jobFinishTime - firstCommitTime)
			.totalTime(jobFinishTime - firstCommitTime)
			.prLeadTime(prLeadTime)
			.isRevert(isRevert(commitInfo))
			.holidays(0)
			.build();
	}

	private Boolean isRevert(CommitInfo commitInfo) {
		Boolean isRevert = null;
		if (commitInfo.getCommit() != null && commitInfo.getCommit().getMessage() != null) {
			isRevert = commitInfo.getCommit().getMessage().toLowerCase().startsWith("revert");
		}
		return isRevert;
	}

	public LeadTime mapLeadTimeWithInfo(PullRequestInfo pullRequestInfo, DeployInfo deployInfo, CommitInfo commitInfo,
			GenerateReportRequest request) {
		log.info("Start to calculate base lead time");
		if (pullRequestInfo.getMergedAt() == null) {
			return null;
		}
		long prCreatedTime = Instant.parse(pullRequestInfo.getCreatedAt()).toEpochMilli();
		long prMergedTime = Instant.parse(pullRequestInfo.getMergedAt()).toEpochMilli();
		Long jobFinishTime = ofNullable(deployInfo.getJobFinishTime()).map(it -> Instant.parse(it).toEpochMilli())
			.orElse(null);
		Long jobStartTime = ofNullable(deployInfo.getJobStartTime()).map(it -> Instant.parse(it).toEpochMilli())
			.orElse(null);
		Long pipelineCreateTime = ofNullable(deployInfo.getPipelineCreateTime())
			.map(it -> Instant.parse(it).toEpochMilli())
			.orElse(null);
		String commitId = ofNullable(deployInfo.getCommitId()).orElse(commitInfo.getCommitId());
		long firstCommitTimeInPr;
		if (commitInfo.getCommit() != null && commitInfo.getCommit().getCommitter() != null
				&& commitInfo.getCommit().getCommitter().getDate() != null) {
			firstCommitTimeInPr = Instant.parse(commitInfo.getCommit().getCommitter().getDate()).toEpochMilli();
		}
		else {
			firstCommitTimeInPr = 0;
		}

		long pipelineLeadTime = ofNullable(jobFinishTime).map(it -> it - prMergedTime).orElse(0L);
		long prLeadTime;
		long totalTime;
		long holidays = 0;
		Boolean isRevert = isRevert(commitInfo);
		if (Boolean.TRUE.equals(isRevert) || isNoFirstCommitTimeInPr(firstCommitTimeInPr)) {
			prLeadTime = 0;
		}
		else {
			WorkInfo workInfo = workDay.calculateWorkTimeAndHolidayBetween(firstCommitTimeInPr, prMergedTime,
					request.getCalendarType(), request.getTimezoneByZoneId());
			prLeadTime = workInfo.getWorkTime();
			holidays = workInfo.getHolidays();
		}
		if (prLeadTime < 0) {
			log.error(
					"calculate work time error, because the work time is negative, request start time: {},"
							+ " request end time: {}, first commit time in pr: {}, pr merged time: {}, author: {},"
							+ " pull request url: {}",
					request.getStartTime(), request.getEndTime(), firstCommitTimeInPr, prMergedTime,
					commitInfo.getCommit().getAuthor(), pullRequestInfo.getUrl());
			prLeadTime = 0;
		}
		totalTime = prLeadTime + pipelineLeadTime;

		log.info("Successfully to calculate base lead time");
		return LeadTime.builder()
			.pipelineLeadTime(pipelineLeadTime)
			.prLeadTime(prLeadTime)
			.firstCommitTimeInPr(firstCommitTimeInPr)
			.prMergedTime(prMergedTime)
			.totalTime(totalTime)
			.prCreatedTime(prCreatedTime)
			.commitId(commitId)
			.pullNumber(pullRequestInfo.getNumber())
			.committer(pullRequestInfo.getUser().getLogin())
			.jobFinishTime(jobFinishTime)
			.jobStartTime(jobStartTime)
			.firstCommitTime(prMergedTime)
			.pipelineCreateTime(pipelineCreateTime)
			.isRevert(isRevert)
			.holidays(holidays)
			.build();
	}

	private static boolean isNoFirstCommitTimeInPr(long firstCommitTimeInPr) {
		return firstCommitTimeInPr == 0;
	}

	public CommitInfo fetchCommitInfo(String commitId, String repositoryId, String token) {
		try {
			String realToken = BEARER_TITLE + token;
			log.info("Start to get commit info, repoId: {},commitId: {}", repositoryId, commitId);
			CommitInfo commitInfo = gitHubFeignClient.getCommitInfo(repositoryId, commitId, realToken);
			log.info("Successfully get commit info, repoId: {},commitId: {}, author: {}", repositoryId, commitId,
					commitInfo.getCommit().getAuthor());
			return commitInfo;
		}
		catch (RuntimeException e) {
			Throwable cause = ofNullable(e.getCause()).orElse(e);
			log.error("Failed to get commit info_repoId: {},commitId: {}, error: {}", repositoryId, commitId,
					cause.getMessage());
			if (cause instanceof NotFoundException) {
				return null;
			}
			if (cause instanceof BaseException baseException) {
				throw baseException;
			}
			throw new InternalServerErrorException(String.format("Failed to get commit info_repoId: %s,cause is: %s",
					repositoryId, cause.getMessage()));
		}
	}

	public List<String> getAllOrganizations(String token) {
		log.info("Start to get all organizations");
		int initPage = 1;
		String realToken = BEARER_TITLE + token;
		PageOrganizationsInfoDTO pageOrganizationsInfoDTO = cachePageService.getGitHubOrganizations(realToken, initPage,
				PER_PAGE);
		List<OrganizationsInfoDTO> firstPageStepsInfo = pageOrganizationsInfoDTO.getPageInfo();
		int totalPage = pageOrganizationsInfoDTO.getTotalPage();
		log.info("Successfully parse the total page_total page of organizations: {}", totalPage);
		List<String> organizationNames = new ArrayList<>();
		if (Objects.nonNull(firstPageStepsInfo)) {
			organizationNames.addAll(firstPageStepsInfo.stream().map(OrganizationsInfoDTO::getLogin).toList());
		}
		if (totalPage > 1) {
			for (int i = initPage + 1; i < totalPage + 1; i = i + BATCH_SIZE) {
				List<OrganizationsInfoDTO> organizationNamesOtherFirstPageList = IntStream
					.range(i, Math.min(i + BATCH_SIZE, totalPage + 1))
					.parallel()
					.mapToObj(page -> cachePageService.getGitHubOrganizations(realToken, page, PER_PAGE).getPageInfo())
					.flatMap(Collection::stream)
					.toList();
				List<String> orgNamesOtherFirstPage = organizationNamesOtherFirstPageList.stream()
					.map(OrganizationsInfoDTO::getLogin)
					.toList();
				organizationNames.addAll(orgNamesOtherFirstPage);
			}
		}
		log.info("Successfully to get all organizations");
		return organizationNames;
	}

	public List<String> getAllRepos(String token, String organization, long endTime) {
		log.info("Start to get all repos, organization: {}, endTime: {}", organization, endTime);
		Instant endTimeInstant = Instant.ofEpochMilli(endTime);
		int initPage = 1;
		String realToken = BEARER_TITLE + token;
		PageReposInfoDTO pageReposInfoDTO = cachePageService.getGitHubRepos(realToken, organization, initPage,
				PER_PAGE);
		List<ReposInfoDTO> firstPageStepsInfo = pageReposInfoDTO.getPageInfo();
		int totalPage = pageReposInfoDTO.getTotalPage();
		log.info("Successfully parse the total page_total page of repos: {}", totalPage);
		List<String> repoNames = new ArrayList<>();
		if (Objects.nonNull(firstPageStepsInfo)) {
			repoNames.addAll(firstPageStepsInfo.stream()
				.filter(it -> Instant.parse(it.getCreatedAt()).isBefore(endTimeInstant))
				.map(ReposInfoDTO::getName)
				.toList());
		}
		if (totalPage > 1) {
			for (int i = initPage + 1; i < totalPage + 1; i = i + BATCH_SIZE) {
				List<ReposInfoDTO> repoNamesOtherFirstPageList = IntStream
					.range(i, Math.min(i + BATCH_SIZE, totalPage + 1))
					.parallel()
					.mapToObj(page -> cachePageService.getGitHubRepos(realToken, organization, page, PER_PAGE)
						.getPageInfo())
					.flatMap(Collection::stream)
					.filter(it -> Instant.parse(it.getCreatedAt()).isBefore(endTimeInstant))
					.toList();
				List<String> repoName = repoNamesOtherFirstPageList.stream().map(ReposInfoDTO::getName).toList();
				repoNames.addAll(repoName);
			}
		}
		log.info("Successfully to get all repos, organization: {}", organization);
		return repoNames;
	}

	public List<String> getAllBranches(String token, String organization, String repo) {
		log.info("Start to get all branches, organization: {}, repo: {}", organization, repo);
		int initPage = 1;
		String realToken = BEARER_TITLE + token;
		PageBranchesInfoDTO pageBranchesInfoDTO = cachePageService.getGitHubBranches(realToken, organization, repo,
				initPage, PER_PAGE);
		List<BranchesInfoDTO> firstPageStepsInfo = pageBranchesInfoDTO.getPageInfo();
		int totalPage = pageBranchesInfoDTO.getTotalPage();
		log.info("Successfully parse the total page_total page of branches: {}", totalPage);
		List<String> branchNames = new ArrayList<>();
		if (Objects.nonNull(firstPageStepsInfo)) {
			branchNames.addAll(firstPageStepsInfo.stream().map(BranchesInfoDTO::getName).toList());
		}
		if (totalPage > 1) {
			for (int i = initPage + 1; i < totalPage + 1; i = i + BATCH_SIZE) {
				List<BranchesInfoDTO> branchNamesOtherFirstPageList = IntStream
					.range(i, Math.min(i + BATCH_SIZE, totalPage + 1))
					.parallel()
					.mapToObj(page -> cachePageService.getGitHubBranches(realToken, organization, repo, page, PER_PAGE)
						.getPageInfo())
					.flatMap(Collection::stream)
					.toList();
				List<String> branchNamesOtherFirstPage = branchNamesOtherFirstPageList.stream()
					.map(BranchesInfoDTO::getName)
					.toList();
				branchNames.addAll(branchNamesOtherFirstPage);
			}
		}
		log.info("Successfully to get all branches, organization: {}, repo: {}", organization, repo);
		return branchNames;
	}

	public List<String> getAllCrews(String token, String organization, String repo, String branch, long startTime,
			long endTime) {
		log.info("Start to get all crews, organization: {}, repo: {}, branch: {}, startTime: {}, endTime: {}",
				organization, repo, branch, startTime, endTime);
		String realToken = BEARER_TITLE + token;
		List<PullRequestInfo> validPullRequestInfo = getValidPullRequestInfo(realToken, organization, repo, branch,
				startTime, endTime);
		List<String> crews = validPullRequestInfo.stream()
			.map(PullRequestInfo::getUser)
			.map(PullRequestInfo.PullRequestUser::getLogin)
			.distinct()
			.toList();
		log.info("Successfully to get all crews, organization: {}, repo: {}, branch: {}, startTime: {}, endTime: {}",
				organization, repo, branch, startTime, endTime);
		return crews;
	}

	private PullRequestFinishedInfo filterPullRequestByTimeRange(List<PullRequestInfo> pullRequestInfoList,
			long startTime, long endTime) {
		log.info("Start to filter pull request, startTime: {}, endTime: {}", startTime, endTime);
		Instant startTimeInstant = Instant.ofEpochMilli(startTime);
		Instant endTimeInstant = Instant.ofEpochMilli(endTime);
		List<PullRequestInfo> validPullRequestList = new ArrayList<>();
		boolean isGetNextPage = true;
		for (PullRequestInfo PullRequestInfo : pullRequestInfoList) {
			if (!Objects.nonNull(PullRequestInfo.getMergedAt())) {
				continue;
			}
			Instant createdAt = Instant.parse(PullRequestInfo.getCreatedAt());
			Instant mergedAt = Instant.parse(PullRequestInfo.getMergedAt());
			if (createdAt.isAfter(startTimeInstant) && !createdAt.isAfter(endTimeInstant)
					&& mergedAt.isAfter(startTimeInstant) && !mergedAt.isAfter(endTimeInstant)) {
				validPullRequestList.add(PullRequestInfo);
			}
			if (createdAt.isBefore(startTimeInstant)) {
				isGetNextPage = false;
			}
		}
		log.info(
				"Successfully to filter pull request, startTime: {}, endTime: {}, should get next page pull request: {}",
				startTime, endTime, isGetNextPage);
		return PullRequestFinishedInfo.builder()
			.isGetNextPage(isGetNextPage)
			.pullRequestInfoList(validPullRequestList)
			.build();
	}

	public FetchedData.RepoData fetchRepoData(GenerateReportRequest request) {
		log.info("Start to fetch repo data");
		long startTime = Long.parseLong(request.getStartTime());
		long endTime = Long.parseLong(request.getEndTime());
		String token = ofNullable(request.getCodebaseSetting().getToken()).orElse("");
		String realToken = BEARER_TITLE + token;
		List<String> crews = request.getCodebaseSetting().getCrews();

		List<SourceControlLeadTime> sourceControlLeadTimes = request.getCodebaseSetting()
			.getCodebases()
			.stream()
			.map(codeBase -> {
				String organization = codeBase.getOrganization();
				String repo = codeBase.getRepo();
				List<String> branches = codeBase.getBranches();
				return branches.stream().map(branch -> {
					List<LeadTime> leadTimes = getValidPullRequestInfo(realToken, organization, repo, branch, startTime,
							endTime)
						.stream()
						.filter(pullRequestInfo -> {
							if (crews.isEmpty()) {
								return true;
							}
							return crews.stream()
								.anyMatch(crew -> Objects.equals(pullRequestInfo.getUser().getLogin(), crew));
						})
						.map(pullRequestInfo -> {
							String pullNumber = pullRequestInfo.getNumber().toString();
							log.info("Start to get first code commit, organization: {}, repo: {}, pull number: {}",
									organization, repo, pullNumber);
							CommitInfo firstCodeCommit = gitHubFeignClient
								.getPullRequestCommitInfo(String.format("%s/%s", organization, repo), pullNumber,
										realToken)
								.get(0);
							log.info(
									"Successfully to get first code commit, organization: {}, repo: {}, pull number: {}",
									organization, repo, pullNumber);
							return Pair.of(pullRequestInfo, firstCodeCommit);
						})
						.map(pair -> mapLeadTimeWithInfo(pair.getLeft(), new DeployInfo(), pair.getRight(), request))
						.toList();
					return SourceControlLeadTime.builder()
						.repo(repo)
						.organization(organization)
						.branch(branch)
						.leadTimes(leadTimes)
						.build();
				}).toList();
			})
			.flatMap(Collection::stream)
			.toList();

		log.info("Successfully fetch repo data");
		return FetchedData.RepoData.builder().sourceControlLeadTimes(sourceControlLeadTimes).build();
	}

	private List<PullRequestInfo> getValidPullRequestInfo(String realToken, String organization, String repo,
			String branch, long startTime, long endTime) {
		log.info("Start to get all pull request, organization: {}, repo: {}, branch: {}, startTime: {}, endTime: {}",
				organization, repo, branch, startTime, endTime);
		int initPage = 1;

		List<PullRequestInfo> pullRequestInfoList = new ArrayList<>();
		PagePullRequestInfo pagePullRequestInfo = cachePageService.getGitHubPullRequest(realToken, organization, repo,
				branch, initPage, PER_PAGE);
		List<PullRequestInfo> firstPageStepsInfo = pagePullRequestInfo.getPageInfo();
		int totalPage = pagePullRequestInfo.getTotalPage();
		log.info("Successfully parse the total page_total page of pull requests: {}", totalPage);
		if (Objects.nonNull(firstPageStepsInfo)) {
			PullRequestFinishedInfo pullRequestFinishedInfo = filterPullRequestByTimeRange(firstPageStepsInfo,
					startTime, endTime);
			pullRequestInfoList.addAll(pullRequestFinishedInfo.getPullRequestInfoList());
			boolean isGetNextPage = pullRequestFinishedInfo.isGetNextPage();
			if (totalPage > 1 && isGetNextPage) {
				for (int i = initPage + 1; i < totalPage + 1; i = i + BATCH_SIZE) {
					List<PullRequestFinishedInfo> pullRequestFinishedInfoList = IntStream
						.range(i, Math.min(i + BATCH_SIZE, totalPage + 1))
						.parallel()
						.mapToObj(page -> cachePageService
							.getGitHubPullRequest(realToken, organization, repo, branch, page, PER_PAGE)
							.getPageInfo())
						.map(it -> filterPullRequestByTimeRange(it, startTime, endTime))
						.toList();
					pullRequestFinishedInfoList.forEach(it -> pullRequestInfoList.addAll(it.getPullRequestInfoList()));
					boolean isGoToNextBatch = pullRequestFinishedInfoList.stream().anyMatch(it -> !it.isGetNextPage());
					if (isGoToNextBatch) {
						break;
					}
				}
			}
		}
		log.info(
				"Successfully to get all pull request, organization: {}, repo: {}, branch: {}, startTime: {}, endTime: {}",
				organization, repo, branch, startTime, endTime);
		return pullRequestInfoList;
	}

	public List<PipelineCSVInfo> generateCSVForSourceControl(FetchedData.RepoData repoData, List<CodeBase> codeBases) {
		return codeBases.stream().parallel().map(codeBase -> {
			String organization = codeBase.getOrganization();
			String repo = codeBase.getRepo();
			return repoData.getSourceControlLeadTimes()
				.stream()
				.filter(sourceControlLeadTime -> Objects.equals(sourceControlLeadTime.getRepo(), repo)
						&& Objects.equals(sourceControlLeadTime.getOrganization(), organization))
				.map(sourceControlLeadTime -> sourceControlLeadTime.getLeadTimes()
					.stream()
					.map(leadTime -> PipelineCSVInfo.builder()
						.organizationName(organization)
						.repoName(repo)
						.branchName(sourceControlLeadTime.getBranch())
						.leadTimeInfo(new LeadTimeInfo(leadTime))
						.build())
					.toList())
				.flatMap(Collection::stream)
				.toList();
		}).flatMap(Collection::stream).toList();
	}

}
