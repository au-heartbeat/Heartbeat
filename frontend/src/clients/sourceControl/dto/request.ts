import { SourceControlTypes } from '@src/constants/resources';

export interface SourceControlVerifyRequestDTO {
  type: SourceControlTypes;
  token: string;
  site?: string;
}

export interface SourceControlInfoRequestDTO {
  type: SourceControlTypes;
  branch: string;
  repository: string;
  token: string;
  site?: string;
}

export interface SourceControlGetOrganizationRequestDTO {
  token: string;
  type: SourceControlTypes;
  site?: string;
}

export interface SourceControlGetRepoRequestDTO {
  token: string;
  organization: string;
  endTime: number;
  type: SourceControlTypes;
  site?: string;
}

export interface SourceControlGetBranchRequestDTO {
  token: string;
  organization: string;
  repo: string;
  type: SourceControlTypes;
  site?: string;
}

export interface SourceControlGetCrewRequestDTO {
  token: string;
  organization: string;
  repo: string;
  branch: string;
  startTime: number;
  endTime: number;
  type: SourceControlTypes;
  site?: string;
}
