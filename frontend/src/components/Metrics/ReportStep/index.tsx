import { Velocity } from '@src/components/Metrics/ReportStep/Velocity'
import { useEffect, useState } from 'react'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { Loading } from '@src/components/Loading'
import { CycleTimeReport } from '@src/components/Metrics/ReportStep/CycleTime'

export const ReportStep = () => {
  const { generateReport, isLoading } = useGenerateReportEffect()
  const [velocityData, setVelocityData] = useState({
    velocityForSP: '2',
    velocityForCards: '2',
  })
  const [cycleTimeData, setCycleTimeData] = useState({
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
  })

  useEffect(() => {
    generateReport().then((res) => {
      if (res) {
        setVelocityData(res.response?.velocity)
        setCycleTimeData(res.response?.cycleTime)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      {isLoading ? <Loading /> : <Velocity title={'Velocity'} velocityData={velocityData} />}
      {isLoading ? <Loading /> : <CycleTimeReport title={'CycleTime'} cycleTimeData={cycleTimeData} />}
    </>
  )
}
