import { HttpClient } from '@src/clients/Httpclient'
import { ReportReq } from '@src/clients/report/dto/requestDTO'

export class ReportClient extends HttpClient {
  reportResponse = {
    velocity: {
      velocityForSP: '',
      velocityForCards: '',
    },
    cycleTime: {
      averageCircleTimePerCard: '',
      averageCycleTimePerSP: '',
      totalTimeForCards: 0,
      swimlaneList: [
        {
          optionalItemName: '',
          averageTimeForSP: '',
          averageTimeForCards: '',
          totalTime: '',
        },
      ],
    },
    classification: [
      {
        fieldName: '',
        pairs: [],
      },
    ],
    deploymentFrequency: {
      avgDeploymentFrequency: {
        name: '',
        deploymentFrequency: '',
      },
      deploymentFrequencyOfPipelines: [],
    },
    leadTimeForChanges: {
      leadTimeForChangesOfPipelines: [],
      avgLeadTimeForChanges: {
        name: '',
        mergeDelayTime: 1,
        pipelineDelayTime: 1,
        totalDelayTime: 1,
      },
    },
    changeFailureRate: {
      avgChangeFailureRate: {
        name: '',
        failureRate: '',
      },
      changeFailureRateOfPipelines: [],
    },
  }

  report = async (params: ReportReq) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.axiosInstance
        .post(
          // `http://localhost:4323/api/v1/report`,
          `/report`,
          {},
          {
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            params: params,
          }
        )
        .then((res) => {
          this.reportResponse = res.data
        })
    } catch (e) {
      throw e
    }
    return {
      response: this.reportResponse,
    }
  }
}

export const reportClient = new ReportClient()
