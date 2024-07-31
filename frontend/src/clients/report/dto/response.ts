import { ReportDataWithThreeColumns, ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { Nullable } from '@src/utils/types';

export interface ReportResponseDTO {
  velocity: Nullable<VelocityResponse>;
  cycleTime: Nullable<CycleTimeResponse>;
  rework: Nullable<ReworkTimeResponse>;
  classificationList: Nullable<ClassificationResponse[]>;
  deploymentFrequency: Nullable<DeploymentFrequencyResponse>;
  pipelineMeanTimeToRecovery: Nullable<PipelineMeanTimeToRecoveryResponse>;
  leadTimeForChanges: Nullable<LeadTimeForChangesResponse>;
  pipelineChangeFailureRate: Nullable<PipelineChangeFailureRateResponse>;
  exportValidityTime: Nullable<number>;
  boardMetricsCompleted: boolean | null;
  doraMetricsCompleted: boolean | null;
  overallMetricsCompleted: boolean;
  allMetricsCompleted: boolean;
  reportMetricsError: AllErrorResponse;
  isSuccessfulCreateCsvFile: boolean;
  [key: string]: unknown;
}

export interface VelocityResponse {
  velocityForSP: number;
  velocityForCards: number;
}

export interface AllErrorResponse {
  boardMetricsError: ErrorResponse | null;
  pipelineMetricsError: ErrorResponse | null;
  sourceControlMetricsError: ErrorResponse | null;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export interface CycleTimeResponse {
  totalTimeForCards: number;
  averageCycleTimePerCard: number;
  averageCycleTimePerSP: number;
  swimlaneList: Array<Swimlane>;
}

export interface ReworkTimeResponse {
  totalReworkTimes: number;
  reworkState: string;
  fromAnalysis: number | null;
  fromInDev: number | null;
  fromBlock: number | null;
  fromWaitingForTesting: number | null;
  fromTesting: number | null;
  fromReview: number | null;
  fromDone: number | null;
  totalReworkCards: number;
  reworkCardsRatio: number;
  throughput: number;
}

export interface ClassificationResponse {
  fieldName: string;
  totalCardCount: number;
  classificationInfos: Array<ClassificationInfoList>;
}

export interface DeploymentFrequencyResponse {
  avgDeploymentFrequency: AVGDeploymentFrequency;
  deploymentFrequencyOfPipelines: DeploymentFrequencyOfPipeline[];
  totalDeployTimes: number;
}

export interface LeadTimeForChangesResponse {
  leadTimeForChangesOfPipelines: Array<LeadTimeOfPipeline>;
  avgLeadTimeForChanges: AvgLeadTime;
}

export interface PipelineChangeFailureRateResponse {
  avgPipelineChangeFailureRate: AvgFailureRate;
  pipelineChangeFailureRateOfPipelines: FailureRateOfPipeline[];
}

export interface Swimlane {
  optionalItemName: string;
  averageTimeForSP: number;
  averageTimeForCards: number;
  totalTime: number;
}

export interface AVGDeploymentFrequency {
  name: string;
  step?: string;
  deploymentFrequency: number;
}

export interface DeploymentDateCount {
  date: string;
  count: number;
}

export interface DeploymentFrequencyOfPipeline {
  name: string;
  step: string;
  deployTimes: number;
  deploymentFrequency: number;
  dailyDeploymentCounts: DeploymentDateCount[];
}

export interface LeadTimeOfPipeline {
  name: string;
  step: string;
  prLeadTime: number;
  pipelineLeadTime: number;
  totalDelayTime: number;
}

export interface AvgLeadTime {
  name: string;
  step?: string;
  prLeadTime: number;
  pipelineLeadTime: number;
  totalDelayTime: number;
}

export interface FailureRateOfPipeline {
  name: string;
  step: string;
  failedTimesOfPipeline: number;
  totalTimesOfPipeline: number;
  failureRate: number;
}

export interface AvgFailureRate {
  name: string;
  step?: string;
  totalTimes: number;
  totalFailedTimes: number;
  failureRate: number;
}

export interface PipelineMeanTimeToRecoveryOfPipeline {
  name: string;
  step: string;
  timeToRecovery: number;
}

export interface AvgPipelineMeanTimeToRecovery {
  name: string;
  timeToRecovery: number;
}

export interface PipelineMeanTimeToRecoveryResponse {
  avgPipelineMeanTimeToRecovery: AvgPipelineMeanTimeToRecovery;
  pipelineMeanTimeToRecoveryOfPipelines: PipelineMeanTimeToRecoveryOfPipeline[];
}

export interface ClassificationInfoList {
  name: string;
  value: number;
  cardCount: number;
}

export interface ReportCallbackResponse {
  callbackUrl: string;
  interval: number;
}

export interface ReportResponse {
  velocityList?: ReportDataWithTwoColumns[] | null;
  cycleTimeList?: ReportDataWithTwoColumns[] | null;
  rework?: Nullable<ReworkTimeResponse>;
  cycleTime?: Nullable<CycleTimeResponse>;
  reworkList?: ReportDataWithTwoColumns[] | null;
  classification?: ReportDataWithThreeColumns[] | null;
  deploymentFrequencyList?: ReportDataWithTwoColumns[] | null;
  pipelineMeanTimeToRecoveryList?: ReportDataWithTwoColumns[] | null;
  leadTimeForChangesList?: ReportDataWithThreeColumns[] | null;
  pipelineChangeFailureRateList?: ReportDataWithTwoColumns[] | null;
  exportValidityTimeMin?: number | null;
  classificationCardCount?: ReportDataWithThreeColumns[] | null;
}

export interface ReportURLsResponse {
  metrics: string[];
  pipelines: string[];
  reportURLs: string[];
  classificationNames: string[];
}
