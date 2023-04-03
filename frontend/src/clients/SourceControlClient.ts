import { HttpClient } from '@src/clients/Httpclient'
import { AxiosError } from 'axios'
import { verifyException } from '@src/exceptions/VerifyException'

export interface getVerifySourceControlParams {
  type: string
  token: string
  startTime: string | null
  endTime: string | null
}

export class SourceControlClient extends HttpClient {
  isSourceControlVerify = false
  response = {}

  getVerifySourceControl = async (params: getVerifySourceControlParams) => {
    try {
      const result = await this.axiosInstance.get('/source-control', { params: { ...params } }).then((res) => res)
      this.handleSourceControlVerifySucceed(result.data)
    } catch (e) {
      this.isSourceControlVerify = false
      verifyException((e as AxiosError).response?.status, params)
    }
    return {
      response: this.response,
      isSourceControlVerify: this.isSourceControlVerify,
    }
  }

  handleSourceControlVerifySucceed = (res: object) => {
    this.isSourceControlVerify = true
    this.response = res
  }
}

export const sourceControlClient = new SourceControlClient()
