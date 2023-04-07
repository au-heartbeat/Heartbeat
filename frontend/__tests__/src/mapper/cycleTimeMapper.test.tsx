import { cycleTimeMapper } from '@src/mapper/CycleTimeMapper'
import { CycleTimeMetrics } from '@src/constants'

describe('cycleTime data mapper', () => {
  const mockCycleTimeRes = {
    totalTimeForCards: 423.59,
    averageCycleTimePerSP: '21.18',
    averageCycleTimePerCard: '30.26',
    swimlaneList: [
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
    ],
  }
  it('maps response cycleTime values to ui display value', () => {
    const expectedCycleValues = {
      [CycleTimeMetrics.AVERAGE_CYCLE_TIME]: ['21.18(days/SP)', '30.26(days/card)'],
      [CycleTimeMetrics.TOTAL_DEVELOPMENT_TIME_DIV_TOTAL_CYCLE_TIME]: '0.57',
      [CycleTimeMetrics.TOTAL_WAITING_TIME_DIV_TOTAL_CYCLE_TIME]: '0.01',
      [CycleTimeMetrics.TOTAL_BLOCK_TIME_DIV_TOTAL_CYCLE_TIME]: '',
      [CycleTimeMetrics.TOTAL_REVIEW_TIME_DIV_TOTAL_CYCLE_TIME]: '',
      [CycleTimeMetrics.TOTAL_TESTING_TIME_DIV_TOTAL_CYCLE_TIME]: '',
      [CycleTimeMetrics.AVERAGE_DEVELOPMENT_TIME]: ['12.13(days/SP)', '17.32(days/card)'],
      [CycleTimeMetrics.AVERAGE_WAITING_TIME]: ['0.16(days/SP)', '0.23(days/card)'],
      [CycleTimeMetrics.AVERAGE_BLOCK_TIME]: [],
      [CycleTimeMetrics.AVERAGE_REVIEW_TIME]: [],
      [CycleTimeMetrics.AVERAGE_TESTING_TIME]: [],
    }
    const mappedCycleValues = cycleTimeMapper(mockCycleTimeRes)

    expect(mappedCycleValues).toEqual(expectedCycleValues)
  })
})
