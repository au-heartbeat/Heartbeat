import { CycleTimeRes } from '@src/models/response/reportRes'
import { CycleTimeMetrics, METRICS_CONSTANTS, Unit } from '@src/constants'

export const cycleTimeMapper = ({
  swimlaneList,
  totalTimeForCards,
  averageCycleTimePerSP,
  averageCycleTimePerCard,
}: CycleTimeRes) => {
  const getSwimlaneByItemName = (itemName: string) => {
    return swimlaneList.find((item) => item.optionalItemName === itemName)
  }

  const calPerColumnTotalTimeDivTotalTime = (itemName: string) => {
    const swimlane = getSwimlaneByItemName(itemName)
    return swimlane ? (parseFloat(swimlane.totalTime) / totalTimeForCards).toFixed(2) : ''
  }

  const getAverageTimeForPerColumn = (itemName: string) => {
    const swimlane = getSwimlaneByItemName(itemName)
    return swimlane
      ? [`${swimlane.averageTimeForSP}${Unit.PER_SP}`, `${swimlane.averageTimeForCards}${Unit.PER_CARD}`]
      : []
  }

  return {
    [CycleTimeMetrics.AVERAGE_CYCLE_TIME]: [
      `${averageCycleTimePerSP}${Unit.PER_SP}`,
      `${averageCycleTimePerCard}${Unit.PER_CARD}`,
    ],
    [CycleTimeMetrics.TOTAL_DEVELOPMENT_TIME_DIV_TOTAL_CYCLE_TIME]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.inDevValue
    ),
    [CycleTimeMetrics.TOTAL_WAITING_TIME_DIV_TOTAL_CYCLE_TIME]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.waitingValue
    ),
    [CycleTimeMetrics.TOTAL_BLOCK_TIME_DIV_TOTAL_CYCLE_TIME]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.blockValue
    ),
    [CycleTimeMetrics.TOTAL_REVIEW_TIME_DIV_TOTAL_CYCLE_TIME]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.reviewValue
    ),
    [CycleTimeMetrics.TOTAL_TESTING_TIME_DIV_TOTAL_CYCLE_TIME]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.testingValue
    ),
    [CycleTimeMetrics.AVERAGE_DEVELOPMENT_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.inDevValue),
    [CycleTimeMetrics.AVERAGE_WAITING_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.waitingValue),
    [CycleTimeMetrics.AVERAGE_BLOCK_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.blockValue),
    [CycleTimeMetrics.AVERAGE_REVIEW_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.reviewValue),
    [CycleTimeMetrics.AVERAGE_TESTING_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.testingValue),
  }
}
