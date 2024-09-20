type ResponseCodeType = number | string | undefined | null;

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
  code: ResponseCodeType;
  data?: SourceControlGetOrganizationResponseDTO;
  errorTitle: string;
  errorMessage: string;
}

export interface ISourceControlGetRepoResponseDTO {
  code: ResponseCodeType;
  data?: SourceControlGetRepoResponseDTO;
  errorTitle: string;
  errorMessage: string;
}

export interface ISourceControlGetBranchResponseDTO {
  code: ResponseCodeType;
  data?: SourceControlGetBranchResponseDTO;
  errorTitle: string;
  errorMessage: string;
}
