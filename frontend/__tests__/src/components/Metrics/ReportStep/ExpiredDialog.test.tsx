import { act, getByText, queryByText, render, waitFor } from '@testing-library/react'
import { setupStore } from '../../../utils/setupStoreUtil'
import { ExpiredDialog } from '@src/components/Metrics/ReportStep/ExpiredDialog'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

describe('ExpiredDialog', () => {
  it('should show expired dialog when Given isExpired is true And not show expired dialog when Click No button', async () => {
    const handleOkFn = jest.fn()

    const { getByText, queryByText } = render(
      <Provider store={setupStore()}>
        <ExpiredDialog isExpired={true} handleOk={handleOkFn}></ExpiredDialog>
      </Provider>
    )
    expect(getByText('Export CSV files have been expired')).toBeInTheDocument()

    await userEvent.click(getByText('No'))
    await waitFor(() => {
      expect(queryByText('Export CSV files have been expired')).not.toBeInTheDocument()
    })
  })

  it('should not show expired dialog when isExpired is false ', async () => {
    const handleOkFn = jest.fn()

    const { queryByText } = render(
      <Provider store={setupStore()}>
        <ExpiredDialog isExpired={false} handleOk={handleOkFn}></ExpiredDialog>
      </Provider>
    )
    expect(queryByText('Export CSV files have been expired')).not.toBeInTheDocument()
  })

  it('should close expired dialog when Given isExpired is true And click Ok button', async () => {
    const handleOkFn = jest.fn()

    const { getByText, queryByText } = render(
      <Provider store={setupStore()}>
        <ExpiredDialog isExpired={true} handleOk={handleOkFn}></ExpiredDialog>
      </Provider>
    )
    expect(getByText('Export CSV files have been expired')).toBeInTheDocument()

    await userEvent.click(getByText('Yes'))
    expect(handleOkFn).toBeCalled()
  })
})
