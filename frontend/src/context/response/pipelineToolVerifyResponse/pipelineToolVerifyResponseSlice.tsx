import { createSlice } from '@reduxjs/toolkit'

export interface pipelineToolVerifyResponseState {
  pipelineTool: []
}

export const initialState: pipelineToolVerifyResponseState = {
  pipelineTool: [],
}

export const pipelineToolVerifyResponseSlice = createSlice({
  name: 'pipelineToolVerifyResponse',
  initialState,
  reducers: {
    updatePipelineToolVerifyResponse: (state, action) => {
      const { pipelineTool } = action.payload
      state.pipelineTool = pipelineTool
    },
  },
})

export default pipelineToolVerifyResponseSlice.reducer
