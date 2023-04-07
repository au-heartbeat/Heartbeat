import { render, waitFor } from '@testing-library/react'
import { ReportStep } from '@src/components/Metrics/ReportStep'
import { REQUIRED_DATA_LIST } from '../../../fixtures'
import { setupStore } from '../../../utils/setupStoreUtil'
import { Provider } from 'react-redux'

jest.mock('@src/hooks/useGenerateReportEffect', () => ({
  useGenerateReportEffect: () => ({
    generateReport: jest.fn(() =>
      Promise.resolve({
        response: {
          velocity: { velocityForSP: '3', velocityForCards: '4' },
          cycleTime: {
            averageCircleTimePerCard: '30.26',
            averageCycleTimePerSP: '21.18',
            totalTimeForCards: 423.59,
            swimlaneList: [
              {
                optionalItemName: 'Analysis',
                averageTimeForSP: '8.36',
                averageTimeForCards: '11.95',
                totalTime: '167.27',
              },
              {
                optionalItemName: 'In Dev',
                averageTimeForSP: '12.13',
                averageTimeForCards: '17.32',
                totalTime: '242.51',
              },
              {
                optionalItemName: 'Waiting for testing',
                averageTimeForSP: '0.16',
                averageTimeForCards: '0.23',
                totalTime: '3.21',
              },
              {
                optionalItemName: 'Done',
                averageTimeForSP: '86.20',
                averageTimeForCards: '123.14',
                totalTime: '1723.99',
              },
              {
                optionalItemName: 'Block',
                averageTimeForSP: '8.54',
                averageTimeForCards: '12.20',
                totalTime: '170.80',
              },
              {
                optionalItemName: 'Review',
                averageTimeForSP: '0.26',
                averageTimeForCards: '0.36',
                totalTime: '5.10',
              },
              {
                optionalItemName: 'Testing',
                averageTimeForSP: '0.10',
                averageTimeForCards: '0.14',
                totalTime: '1.97',
              },
            ],
          },
        },
      })
    ),
    isLoading: false,
  }),
}))
let store = null

describe('Export Step', () => {
  store = setupStore()
  const setup = () => {
    store = setupStore()
    return render(
      <Provider store={store}>
        <ReportStep />
      </Provider>
    )
  }
  afterEach(() => {
    store = null
  })
  it('should render export page', async () => {
    const { getByText } = setup()

    await waitFor(() => {
      expect(getByText(REQUIRED_DATA_LIST[0])).toBeInTheDocument()
      expect(getByText(REQUIRED_DATA_LIST[1])).toBeInTheDocument()
    })
  })

  it('should renders the velocity component with correct props', async () => {
    const { getByText } = setup()

    await waitFor(() => {
      expect(getByText('3')).toBeInTheDocument()
      expect(getByText('4')).toBeInTheDocument()
    })
  })

  it('should render the cycleTime component with correct props', async () => {
    const { getByText } = setup()

    await waitFor(() => {
      expect(getByText('30.26(days/card)')).toBeInTheDocument()
      expect(getByText('21.18(days/SP)')).toBeInTheDocument()
      expect(getByText('12.13(days/SP)')).toBeInTheDocument()
      expect(getByText('17.32(days/card)')).toBeInTheDocument()
    })
  })
})
