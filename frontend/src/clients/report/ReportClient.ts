import { ReportCallbackResponse, ReportURLsResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import { ReportRequestDTO } from '@src/clients/report/dto/request';
import { HttpClient } from '@src/clients/HttpClient';
import { AxiosResponse } from 'axios';

const REPORT_PATH = '/reports';

export interface IPollingRes {
  status: number;
  response: ReportResponseDTO;
}

export class ReportClient extends HttpClient {
  status = 0;
  reportCallbackResponse: ReportCallbackResponse = {
    callbackUrl: '',
    interval: 0,
  };
  reportResponse: ReportResponseDTO = {
    velocity: {
      velocityForSP: 0,
      velocityForCards: 0,
    },
    cycleTime: {
      averageCycleTimePerCard: 0,
      averageCycleTimePerSP: 0,
      totalTimeForCards: 0,
      swimlaneList: [
        {
          optionalItemName: '',
          averageTimeForSP: 0,
          averageTimeForCards: 0,
          totalTime: 0,
        },
      ],
    },
    rework: {
      totalReworkTimes: 0,
      reworkState: 'Done',
      fromAnalysis: 0,
      fromDesign: 0,
      fromInDev: 0,
      fromBlock: 0,
      fromWaitingForTesting: 0,
      fromTesting: 0,
      fromReview: 0,
      fromWaitingForDeployment: 0,
      fromDone: 0,
      totalReworkCards: 0,
      throughput: 1,
      reworkCardsRatio: 0,
    },
    classificationList: [
      {
        fieldName: '',
        totalCardCount: 1,
        storyPoints: 1,
        classificationInfos: [],
      },
    ],
    deploymentFrequency: {
      avgDeploymentFrequency: {
        name: '',
        deploymentFrequency: 0,
      },
      deploymentFrequencyOfPipelines: [],
      totalDeployTimes: 0,
    },
    leadTimeForChanges: {
      leadTimeForChangesOfPipelines: [],
      avgLeadTimeForChanges: {
        name: '',
        prLeadTime: 1,
        pipelineLeadTime: 1,
        totalDelayTime: 1,
      },
    },
    pipelineChangeFailureRate: {
      avgPipelineChangeFailureRate: {
        name: '',
        totalTimes: 0,
        totalFailedTimes: 0,
        failureRate: 0.0,
      },
      pipelineChangeFailureRateOfPipelines: [],
    },
    reportMetricsError: {
      boardMetricsError: null,
      pipelineMetricsError: null,
      sourceControlMetricsError: null,
    },
    pipelineMeanTimeToRecovery: null,
    exportValidityTime: null,
    boardMetricsCompleted: false,
    doraMetricsCompleted: false,
    overallMetricsCompleted: false,
    allMetricsCompleted: false,
    isSuccessfulCreateCsvFile: false,
  };

  generateReportId = async () => {
    return this.axiosInstance.post(REPORT_PATH).then((res) => res.data);
  };

  retrieveByUrl = async (params: ReportRequestDTO, url: string) => {
    await this.axiosInstance
      .post(url, params, {})
      .then((res) => {
        this.reportCallbackResponse = res.data;
      })
      .catch((e) => {
        throw e;
      });
    return this.reportCallbackResponse;
  };

  polling = async (url: string): Promise<IPollingRes> => {
    await this.axiosInstance
      .get(url)
      .then((res) => {
        this.status = res.status;
        this.reportResponse = res.data;
      })
      .catch((e) => {
        throw e;
      });
    return {
      status: this.status,
      response: this.reportResponse,
    };
  };

  getReportUrlAndMetrics = (reportId: string) => {
    return this.axiosInstance.get<ReportURLsResponse, AxiosResponse<ReportURLsResponse>, unknown>(
      `${REPORT_PATH}/${reportId}`,
    );
  };

  getReportDetail = (reportUrl: string) => {
    return this.axiosInstance.get<ReportResponseDTO, AxiosResponse<ReportResponseDTO>, unknown>(reportUrl);
  };
}

export const reportClient = new ReportClient();
