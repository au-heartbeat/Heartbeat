import pipelineVerifyResponseReducer, { updatePipelineToolVerifyResponse } from '@src/context/response/responseSlice'
import { MOCK_RESPONSE_SLICE_INIT_STATE } from '../fixtures'

describe('pipelineToolVerifyResponse reducer', () => {
  it('should show empty array when handle initial state', () => {
    const pipelineVerifyResponse = pipelineVerifyResponseReducer(undefined, { type: 'unknown' })

    expect(pipelineVerifyResponse.pipelineTool).toEqual([])
  })

  it('should store pipelineTool data when get network pipelineTool verify response', () => {
    const mockPipelineToolVerifyResponse = {
      pipelineTool: [],
    }

    const jiraVerifyResponse = pipelineVerifyResponseReducer(
      MOCK_RESPONSE_SLICE_INIT_STATE,
      updatePipelineToolVerifyResponse({
        pipelineTool: mockPipelineToolVerifyResponse.pipelineTool,
      })
    )

    expect(jiraVerifyResponse.pipelineTool).toEqual(mockPipelineToolVerifyResponse.pipelineTool)
  })
})
