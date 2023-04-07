import { render } from '@testing-library/react'
import { CycleTimeReport } from '@src/components/Metrics/ReportStep/CycleTime'
import { CycleTimeMetrics } from '../../../fixtures'

describe('CycleTime component', () => {
  const mockTitle = 'mock Cycle time '
  const mockCycleTimeData = {
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
  }

  const setup = () => render(<CycleTimeReport title={mockTitle} cycleTimeData={mockCycleTimeData} />)

  test('renders the component with the correct title and data', () => {
    const { getByText } = setup()

    expect(getByText(CycleTimeMetrics.AVERAGE_CYCLE_TIME)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.AVERAGE_DEVELOPMENT_TIME)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.AVERAGE_BLOCK_TIME)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.AVERAGE_TESTING_TIME)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.AVERAGE_REVIEW_TIME)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.AVERAGE_WAITING_TIME)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.BLOCK_PROPORTION)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.REVIEW_PROPORTION)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.DEVELOPMENT_PROPORTION)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.TESTING_PROPORTION)).toBeInTheDocument()
    expect(getByText(CycleTimeMetrics.WAITING_PROPORTION)).toBeInTheDocument()
  })
})
