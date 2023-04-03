import { HttpClient } from '@src/clients/Httpclient'
import { AxiosError, HttpStatusCode } from 'axios'
import { InternalServerException } from '@src/exceptions/InternalServerException'
import { reportResponseProps } from '@src/types/reportResponse'

export interface generateReportParams {
  metrics: string[]
  pipeline?: {
    type: string
    token: string
  }
  board?: {
    token: string
    type: string
    site: string
    email: string
    projectKey: string
    boardId: string
  }
  sourceControl?: {
    type: string
    token: string
  }
  calendarType: string
  startTime: string | null
  endTime: string | null
}

export class ReportClient extends HttpClient {
  reportResponse: reportResponseProps = {
    velocity: {
      velocityForSP: '',
      velocityForCards: '',
    },
  }

  reporting = async (params: generateReportParams) => {
    try {
      await this.axiosInstance.post(`/report`, { params }).then((res) => {
        this.reportResponse = res.data
      })
    } catch (e) {
      const code = (e as AxiosError).response?.status
      if (code === HttpStatusCode.InternalServerError) {
        throw new InternalServerException('report', 'Internal server error')
      }
      throw new Error('Can not match this metric')
    }
    return {
      response: this.reportResponse,
    }
  }
}

export const reportClient = new ReportClient()
