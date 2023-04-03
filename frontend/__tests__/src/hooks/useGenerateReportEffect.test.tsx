import { act, renderHook } from '@testing-library/react'
import { ERROR_MESSAGE_TIME_DURATION } from '@src/constants'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { reportClient } from '@src/clients/ReportClient'
import { MOCK_GENERATE_REPORT_REQUEST_PARAMS } from '../fixtures'

describe('use generate report effect', () => {
  it('should init data state when render hook', async () => {
    const { result } = renderHook(() => useGenerateReportEffect())

    expect(result.current.isLoading).toEqual(false)
  })
  it('should set error message when generate report throw error', async () => {
    jest.useFakeTimers()
    reportClient.reporting = jest.fn().mockImplementation(() => {
      throw new Error('error')
    })
    const { result } = renderHook(() => useGenerateReportEffect())

    expect(result.current.isLoading).toEqual(false)

    act(() => {
      result.current.generateReport(MOCK_GENERATE_REPORT_REQUEST_PARAMS)
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION)
    })

    expect(result.current.errorMessage).toEqual('')
  })
})
