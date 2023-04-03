import { HttpClient } from '@src/clients/Httpclient'
import { AxiosError, HttpStatusCode } from 'axios'
import { verifyException } from '@src/exceptions/VerifyException'

export interface getVerifyBoardParams {
  token: string
  type: string
  site: string
  projectKey: string
  startTime: string | null
  endTime: string | null
  boardId: string
}

export class BoardClient extends HttpClient {
  isBoardVerify = false
  isNoDoneCard = false
  response = {}

  getVerifyBoard = async (params: getVerifyBoardParams) => {
    try {
      const boardType = params.type === 'Classic Jira' ? 'classic-jira' : params.type.toLowerCase()
      const result = await this.axiosInstance.get(`/boards/${boardType}`, { params }).then((res) => res)
      result.status === HttpStatusCode.NoContent
        ? this.handleBoardNoDoneCard()
        : this.handleBoardVerifySucceed(result.data)
    } catch (e) {
      this.isBoardVerify = false
      verifyException((e as AxiosError).response?.status, params)
    }
    return {
      response: this.response,
      isBoardVerify: this.isBoardVerify,
      isNoDoneCard: this.isNoDoneCard,
    }
  }

  handleBoardNoDoneCard = () => {
    this.isBoardVerify = false
    this.isNoDoneCard = true
  }

  handleBoardVerifySucceed = (res: object) => {
    this.isBoardVerify = true
    this.response = res
  }
}

export const boardClient = new BoardClient()
