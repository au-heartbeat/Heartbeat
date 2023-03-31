import jiraVerifyResponseReducer, { updateJiraVerifyResponse } from '@src/context/response/responseSlice'
import { MOCK_JIRA_VERIFY_RESPONSE, MOCK_RESPONSE_SLICE_INIT_STATE } from '../fixtures'

describe('jiraVerifyResponse reducer', () => {
  it('should show empty array when handle initial state', () => {
    const jiraVerifyResponse = jiraVerifyResponseReducer(undefined, { type: 'unknown' })

    expect(jiraVerifyResponse.jiraColumns).toEqual([])
    expect(jiraVerifyResponse.targetFields).toEqual([])
    expect(jiraVerifyResponse.users).toEqual([])
  })

  it('should store jiraColumns,targetFields,users data when get network jira verify response', () => {
    const jiraVerifyResponse = jiraVerifyResponseReducer(
      MOCK_RESPONSE_SLICE_INIT_STATE,
      updateJiraVerifyResponse({
        jiraColumns: MOCK_JIRA_VERIFY_RESPONSE.jiraColumns,
        targetFields: MOCK_JIRA_VERIFY_RESPONSE.targetFields,
        users: MOCK_JIRA_VERIFY_RESPONSE.users,
      })
    )

    expect(jiraVerifyResponse.jiraColumns).toEqual(MOCK_JIRA_VERIFY_RESPONSE.jiraColumns)
    expect(jiraVerifyResponse.targetFields).toEqual(MOCK_JIRA_VERIFY_RESPONSE.targetFields)
    expect(jiraVerifyResponse.users).toEqual(MOCK_JIRA_VERIFY_RESPONSE.users)
  })
})
