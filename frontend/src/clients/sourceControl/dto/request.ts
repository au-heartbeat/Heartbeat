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
