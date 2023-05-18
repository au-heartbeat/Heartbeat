import { HttpClient } from '@src/clients/Httpclient'
import { HttpStatusCode } from 'axios'
import { BoardRequestDTO } from '@src/clients/board/dto/request'

export interface IResponse {
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[]
  targetFields: { key: string; name: string; flag: boolean }[]
  users: string[]
}
export class BoardClient extends HttpClient {
  isBoardVerify = false
  isNoDoneCard = false
  response: IResponse | object = {}

  getVerifyBoard = async (params: BoardRequestDTO) => {
    try {
      const boardType = params.type === 'Classic Jira' ? 'classic-jira' : params.type.toLowerCase()
      const result = await this.axiosInstance.get(`/boards/${boardType}`, { params })
      result.status === HttpStatusCode.NoContent
        ? this.handleBoardNoDoneCard()
        : this.handleBoardVerifySucceed(result.data)
    } catch (e) {
      this.isBoardVerify = false
      throw e
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
