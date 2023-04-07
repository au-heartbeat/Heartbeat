import { HttpClient } from '@src/clients/Httpclient'
import { ReportRes } from '@src/models/response/reportRes'
import { ReportReq } from '@src/models/request/reportReq'

export class ReportClient extends HttpClient {
  reportResponse: ReportRes = {
    velocity: {
      velocityForSP: '',
      velocityForCards: '',
    },
  }

  report = async (params: ReportReq) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.axiosInstance
        .post(
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
