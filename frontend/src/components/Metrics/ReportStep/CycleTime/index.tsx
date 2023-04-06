import MetricsSettingTitle from '@src/components/Common/MetricsSettingTitle'
import { TableBody, TableCell, TableHead, TableRow, Table } from '@mui/material'
import { Container, Row } from '@src/components/Metrics/ReportStep/style'
import { CycleTime } from '@src/types/reportResponse'
import { TIME_UNIT } from '@src/constants'

interface CycleTimeProps {
  title: string
  cycleTimeData: CycleTime
}

export const CycleTimeReport = ({ title, cycleTimeData }: CycleTimeProps) => {
  const updatedSwimlaneList = cycleTimeData.swimlaneList
    .map((item) => ({
      ...item,
      optionalItemName:
        item.optionalItemName === 'Waiting for testing'
          ? 'Waiting'
          : item.optionalItemName === 'In Dev'
          ? 'Development'
          : item.optionalItemName,
    }))
    .filter((item) => !['Analysis', 'Done'].includes(item.optionalItemName))

  const averageTimeProportion = updatedSwimlaneList.map((item) => ({
    name: item.optionalItemName,
    value: (parseFloat(item.totalTime) / cycleTimeData.totalTimeForCards).toFixed(2),
  }))

  const averageTime = updatedSwimlaneList.map((item) => ({
    name: item.optionalItemName,
    averageTimeForSp: item.averageTimeForSP,
    averageTimeForCards: item.averageTimeForCards,
  }))

  return (
    <>
      <MetricsSettingTitle title={title} />
      <Container>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align={'inherit'}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={2}>Average Cycle Time</TableCell>
              <TableCell align='inherit'>{cycleTimeData.averageCycleTimePerSP + TIME_UNIT.Velocity}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align='inherit'>{cycleTimeData.averageCircleTimePerCard + TIME_UNIT.Throughput} </TableCell>
            </TableRow>
            {averageTimeProportion.map(({ name, value }) => (
              <Row key={name}>
                <TableCell align='inherit'>Total {name} Time / Total Cycle Time </TableCell>
                <TableCell align='inherit'>{value}</TableCell>
              </Row>
            ))}
            {averageTime.map(({ name, averageTimeForCards, averageTimeForSp }) => (
              <>
                <TableRow>
                  <TableCell rowSpan={2}>Average {name} Time</TableCell>
                  <TableCell align='inherit'>{averageTimeForSp + TIME_UNIT.Velocity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align='inherit'>{averageTimeForCards + TIME_UNIT.Throughput}</TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  )
}
