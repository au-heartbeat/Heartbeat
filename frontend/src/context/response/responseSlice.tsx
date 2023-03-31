import { createSlice } from '@reduxjs/toolkit'
import {
  initialState as jiraVerifyResponseInitialState,
  jiraVerifyResponseSlice,
} from '@src/context/response/jiraVerifyResponse/jiraVerifyResponseSlice'
import {
  initialState as pipelineToolVerifyResponseInitialState,
  pipelineToolVerifyResponseSlice,
} from '@src/context/response/pipelineToolVerifyResponse/pipelineToolVerifyResponseSlice'
import {
  initialState as sourceControlVerifyResponseInitialState,
  sourceControlVerifyResponseSlice,
} from '@src/context/response/sourceControlVerifyResponse/sourceControlVerifyResponseSlice'
import { RootState } from '@src/store'

export const responseSlice = createSlice({
  name: 'response',
  initialState: {
    ...jiraVerifyResponseInitialState,
    ...pipelineToolVerifyResponseInitialState,
    ...sourceControlVerifyResponseInitialState,
  },
  reducers: {
    ...jiraVerifyResponseSlice.caseReducers,
    ...pipelineToolVerifyResponseSlice.caseReducers,
    ...sourceControlVerifyResponseSlice.caseReducers,
  },
})

export const { updateJiraVerifyResponse, updatePipelineToolVerifyResponse, updateSourceControlVerifyResponse } =
  responseSlice.actions

export const selectUsers = (state: RootState) => state.response.users
export const selectJiraColumns = (state: RootState) => state.response.jiraColumns
export const selectTargetFields = (state: RootState) => state.response.targetFields

export default responseSlice.reducer
