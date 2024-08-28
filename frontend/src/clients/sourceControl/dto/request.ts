import { SourceControlTypes } from '@src/constants/resources';

export interface SourceControlVerifyRequestDTO {
  type: SourceControlTypes;
  token: string;
}

export interface SourceControlInfoRequestDTO {
  type: SourceControlTypes;
  branch: string;
  repository: string;
  token: string;
}

export interface SourceControlGetOrganizationRequestDTO {
  token: string;
  type: SourceControlTypes;
}

export interface SourceControlGetRepoRequestDTO {
  token: string;
  organization: string;
  type: SourceControlTypes;
}

export interface SourceControlGetBranchRequestDTO {
  token: string;
  organization: string;
  repo: string;
  type: SourceControlTypes;
}

export interface SourceControlGetCrewRequestDTO {
  token: string;
  organization: string;
  repo: string;
  branch: string;
  startTime: number;
  endTime: number;
  type: SourceControlTypes;
}
