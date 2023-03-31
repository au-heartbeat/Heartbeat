import { createSlice } from '@reduxjs/toolkit'

export interface sourceControlVerifyResponseState {
  sourceControl: []
}

export const initialState: sourceControlVerifyResponseState = {
  sourceControl: [],
}

export const sourceControlVerifyResponseSlice = createSlice({
  name: 'sourceControlVerifyResponse',
  initialState,
  reducers: {
    updateSourceControlVerifyResponse: (state, action) => {
      const { sourceControl } = action.payload
      state.sourceControl = sourceControl
    },
  },
})

export default sourceControlVerifyResponseSlice.reducer
