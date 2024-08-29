export interface SourceControlGetOrganizationResponseDTO {
  name: string[];
}

export interface SourceControlGetRepoResponseDTO {
  name: string[];
}

export interface SourceControlGetBranchResponseDTO {
  name: string[];
}

export interface SourceControlGetCrewResponseDTO {
  crews: string[];
}

export interface ISourceControlGetOrganizationResponseDTO {
  code: number | string | undefined | null;
  data?: SourceControlGetOrganizationResponseDTO;
  errorTitle: string;
  errorMessage: string;
}

export interface ISourceControlGetRepoResponseDTO {
  code: number | string | undefined | null;
  data?: SourceControlGetRepoResponseDTO;
  errorTitle: string;
  errorMessage: string;
}

export interface ISourceControlGetBranchResponseDTO {
  code: number | string | undefined | null;
  data?: SourceControlGetBranchResponseDTO;
  errorTitle: string;
  errorMessage: string;
}

export interface ISourceControlGetCrewResponseDTO {
  code: number | string | undefined | null;
  data?: SourceControlGetCrewResponseDTO;
  errorTitle: string;
  errorMessage: string;
}
