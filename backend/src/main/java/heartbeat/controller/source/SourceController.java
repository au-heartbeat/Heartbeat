package heartbeat.controller.source;

import heartbeat.controller.source.dto.BranchRequest;
import heartbeat.controller.source.dto.BranchResponse;
import heartbeat.controller.source.dto.OrganizationRequest;
import heartbeat.controller.source.dto.OrganizationResponse;
import heartbeat.controller.source.dto.RepoRequest;
import heartbeat.controller.source.dto.RepoResponse;
import heartbeat.controller.source.dto.SourceControlDTO;
import heartbeat.controller.source.dto.VerifyBranchRequest;
import heartbeat.service.source.github.GitHubService;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@Tag(name = "Source Control")
@RequestMapping("/source-control")
@Validated
@Log4j2
public class SourceController {

	public static final String TOKEN_PATTER = "^(ghp|gho|ghu|ghs|ghr)_([a-zA-Z0-9]{36})$";

	private final GitHubService gitHubService;

	@PostMapping("/{sourceType}/verify")
	public ResponseEntity<Void> verifyToken(
			@Schema(type = "string", allowableValues = { "github" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable SourceType sourceType,
			@RequestBody @Valid SourceControlDTO sourceControlDTO) {
		log.info("Start to verify source type: {} token.", sourceType);
		if (Objects.requireNonNull(sourceType) == SourceType.GITHUB) {
			gitHubService.verifyToken(sourceControlDTO.getToken());
		}
		log.info("Successfully verify source type: {} token.", sourceType);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@PostMapping("/{sourceType}/repos/branches/verify")
	public ResponseEntity<Void> verifyBranch(
			@Schema(type = "string", allowableValues = { "github" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable SourceType sourceType,
			@RequestBody @Valid VerifyBranchRequest request) {
		log.info("Start to verify source type: {} branch: {}.", sourceType, request.getBranch());
		if (Objects.requireNonNull(sourceType) == SourceType.GITHUB) {
			gitHubService.verifyCanReadTargetBranch(request.getRepository(), request.getBranch(), request.getToken());
		}
		log.info("Successfully verify source type: {} branch: {}.", sourceType, request.getBranch());
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@PostMapping("/{sourceType}/organizations")
	public OrganizationResponse getAllOrganizations(
			@Schema(type = "string", allowableValues = { "github" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable SourceType sourceType,
			@RequestBody @Valid OrganizationRequest organizationRequest) {
		log.info("Start to get organizations, source type: {}", sourceType);
		List<String> allOrganizations = List.of();
		if (Objects.requireNonNull(sourceType) == SourceType.GITHUB) {
			allOrganizations = gitHubService.getAllOrganizations(organizationRequest.getToken());
		}
		log.info("Successfully get organizations, source type: {}", sourceType);
		return new OrganizationResponse(allOrganizations);
	}

	@PostMapping("/{sourceType}/repos")
	public RepoResponse getAllRepos(
			@Schema(type = "string", allowableValues = { "github" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable SourceType sourceType,
			@RequestBody @Valid RepoRequest repoRequest) {
		log.info("Start to get repos, source type: {}", sourceType);
		List<String> allRepos = List.of();
		if (Objects.requireNonNull(sourceType) == SourceType.GITHUB) {
			allRepos = gitHubService.getAllRepos(repoRequest.getToken(), repoRequest.getOrganization());
		}
		log.info("Successfully get repos, source type: {}", sourceType);
		return new RepoResponse(allRepos);
	}

	@PostMapping("/{sourceType}/branches")
	public BranchResponse getAllBranches(
			@Schema(type = "string", allowableValues = { "github" },
					accessMode = Schema.AccessMode.READ_ONLY) @PathVariable SourceType sourceType,
			@RequestBody @Valid BranchRequest branchRequest) {
		log.info("Start to get branches, source type: {}", sourceType);
		List<String> allBranches = List.of();
		if (Objects.requireNonNull(sourceType) == SourceType.GITHUB) {
			allBranches = gitHubService.getAllBranches(branchRequest.getToken(), branchRequest.getOrganization(),
					branchRequest.getRepo());
		}
		log.info("Successfully get branches, source type: {}", sourceType);
		return new BranchResponse(allBranches);
	}

}
