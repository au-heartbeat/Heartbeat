import { cycleTimeMapper } from '@src/hooks/reportMapper/cycleTime'

describe('cycleTime data mapper', () => {
  const mockCycleTimeRes = {
    totalTimeForCards: 423.59,
    averageCycleTimePerSP: '21.18',
    averageCircleTimePerCard: '30.26',
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
    const expectedCycleValues = [
      { id: 0, name: 'Average cycle time', value: ['21.18(days/SP)', '30.26(days/card)'] },
      { id: 1, name: 'Total development time / Total cycle time', value: ['0.57'] },
      { id: 2, name: 'Total waiting time / Total cycle time', value: ['0.01'] },
      { id: 3, name: 'Total block time / Total cycle time', value: [] },
      { id: 4, name: 'Total review time / Total cycle time', value: [] },
      { id: 5, name: 'Total testing time / Total cycle time', value: [] },
      { id: 6, name: 'Average development time', value: ['12.13(days/SP)', '17.32(days/card)'] },
      { id: 7, name: 'Average waiting time', value: ['0.16(days/SP)', '0.23(days/card)'] },
      { id: 8, name: 'Average block time', value: [] },
      { id: 9, name: 'Average review time', value: [] },
      { id: 10, name: 'Average testing time', value: [] },
    ]
    const mappedCycleValues = cycleTimeMapper(mockCycleTimeRes)

    expect(mappedCycleValues).toEqual(expectedCycleValues)
  })
})
