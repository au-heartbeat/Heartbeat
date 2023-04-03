import { HttpClient } from '@src/clients/Httpclient'
import { AxiosError } from 'axios'
import { verifyException } from '@src/exceptions/VerifyException'

export interface getVerifyPipelineToolParams {
  type: string
  token: string
  startTime: string | null
  endTime: string | null
}

export class PipelineToolClient extends HttpClient {
  isPipelineToolVerified = false
  response = {}

  verifyPipelineTool = async (params: getVerifyPipelineToolParams) => {
    try {
      const result = await this.axiosInstance.get(`/pipelines/${params.type}`, { params: { ...params } })
      this.handlePipelineToolVerifySucceed(result.data)
    } catch (e) {
      this.isPipelineToolVerified = false
      verifyException((e as AxiosError).response?.status, params)
    }
    return {
      response: this.response,
      isPipelineToolVerified: this.isPipelineToolVerified,
    }
  }
  handlePipelineToolVerifySucceed = (res: object) => {
    this.isPipelineToolVerified = true
    this.response = res
  }
}

export const pipelineToolClient = new PipelineToolClient()
