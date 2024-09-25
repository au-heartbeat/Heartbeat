import { MetricTypes } from '@src/constants/commons';
import { Calendar } from '@src/constants/resources';

export interface ReportRequestDTO extends IBasicReportRequestDTO {
  buildKiteSetting?: {
    type: string;
    token: string;
    pipelineCrews: string[];
    deploymentEnvList:
      | {
          id: string;
          name: string;
          orgId: string;
          orgName: string;
          repository: string;
          repoName: string;
          step: string;
          branches: string[];
        }[]
      | [];
  };
  codebaseSetting?: {
    type: string;
    token: string;
    crews: string[];
    codebases: {
      branches: string[];
      repo: string;
      organization: string;
    }[];
    leadTime: {
      id: string;
      name: string;
      orgId: string;
      orgName: string;
      repository: string;
      step: string;
      branches: string[];
    }[];
  };
}

interface ReworkSettingsRequest {
  reworkState?: string | null;
  excludedStates?: string[];
}

export interface IBasicReportRequestDTO {
  calendarType: Calendar;
  startTime: string | null;
  endTime: string | null;
  timezone: string;
  metrics: string[];
  jiraBoardSetting?: {
    token: string;
    type: string;
    site: string;
    projectKey: string;
    boardId: string;
    boardColumns: { name: string; value: string }[];
    treatFlagCardAsBlock: boolean;
    classificationNames: string[];
    users: string[];
    assigneeFilter: string;
    targetFields: { key: string; name: string; flag: boolean }[];
    overrideFields: { key: string; name: string; flag: boolean }[];
    reworkTimesSetting: ReworkSettingsRequest | null;
    doneColumn: string[];
  };
  csvTimeStamp?: number;
  metricTypes: MetricTypes[];
}

export interface CSVReportRequestDTO {
  dataType: string;
  reportId: number;
  startDate: string;
  endDate: string;
}
