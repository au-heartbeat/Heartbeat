import { BOARD_TYPES } from '@src/constants'

export interface IBoardVerifyResponseState {
  jiraColumns: IVerifyJiraColumns[]
  targetFields: { name: string; key: string; flag: boolean }[]
  users: string[]
}
export interface IBoardState {
  config: { type: string; boardId: string; email: string; projectKey: string; site: string; token: string }
  isVerified: boolean
  isShow: boolean
  verifiedResponse: IBoardVerifyResponseState
}

export interface IVerifyJiraColumns {
  key: string
  value: { name: string; statuses: string[] }
}

export const initialVerifiedBoardState: IBoardVerifyResponseState = {
  jiraColumns: [],
  targetFields: [],
  users: [],
}

export const initialBoardState: IBoardState = {
  config: { type: BOARD_TYPES.JIRA, boardId: '', email: '', projectKey: '', site: '', token: '' },
  isVerified: false,
  isShow: false,
  verifiedResponse: initialVerifiedBoardState,
}
