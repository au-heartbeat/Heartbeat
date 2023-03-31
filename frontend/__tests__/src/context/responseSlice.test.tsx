import responseReducer, {
  updateJiraVerifyResponse,
  updatePipelineToolVerifyResponse,
  updateSourceControlVerifyResponse,
} from '@src/context/response/responseSlice'
import { MOCK_JIRA_VERIFY_RESPONSE, MOCK_RESPONSE_SLICE_INIT_STATE } from '../fixtures'

describe('response reducer', () => {
  it('should be default value when init response reducer', () => {
    const response = responseReducer(undefined, { type: 'unknown' })

    expect(response.users).toEqual([])
    expect(response.targetFields).toEqual([])
    expect(response.jiraColumns).toEqual([])
    expect(response.pipelineTool).toEqual([])
    expect(response.sourceControl).toEqual([])
  })

  it('should update jiraVerify response when get jiraVerify response', () => {
    const response = responseReducer(
      MOCK_RESPONSE_SLICE_INIT_STATE,
      updateJiraVerifyResponse(MOCK_JIRA_VERIFY_RESPONSE)
    )

    expect(response.jiraColumns).toEqual(MOCK_JIRA_VERIFY_RESPONSE.jiraColumns)
    expect(response.users).toEqual(MOCK_JIRA_VERIFY_RESPONSE.users)
    expect(response.targetFields).toEqual(MOCK_JIRA_VERIFY_RESPONSE.targetFields)
  })

  it('should update pipelineTool response when get pipelineTool response', () => {
    // const MOCK_PIPELINE_TOOL_RESPONSE = []
    const response = responseReducer(
      MOCK_RESPONSE_SLICE_INIT_STATE,
      updatePipelineToolVerifyResponse({
        pipelineTool: [],
      })
    )

    expect(response.pipelineTool).toEqual([])
  })

  it('should update sourceControl response when get sourceControl response', () => {
    const response = responseReducer(
      MOCK_RESPONSE_SLICE_INIT_STATE,
      updateSourceControlVerifyResponse({ sourceControl: [] })
    )

    expect(response.sourceControl).toEqual([])
  })
})
