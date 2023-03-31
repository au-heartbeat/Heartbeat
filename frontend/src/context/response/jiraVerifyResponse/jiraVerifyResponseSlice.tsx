import { createSlice } from '@reduxjs/toolkit'

export interface jiraVerifyResponseState {
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[]
  targetFields: { name: string; key: string; flag: boolean }[]
  users: string[]
}

export const initialState: jiraVerifyResponseState = {
  jiraColumns: [],
  targetFields: [],
  users: [],
}

export const jiraVerifyResponseSlice = createSlice({
  name: 'jiraVerifyResponse',
  initialState,
  reducers: {
    updateJiraVerifyResponse: (state, action) => {
      const { jiraColumns, targetFields, users } = action.payload
      state.jiraColumns = jiraColumns
      state.targetFields = targetFields
      state.users = users
    },
  },
})

export default jiraVerifyResponseSlice.reducer
