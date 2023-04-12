import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle'
import { TableBody, TableCell, TableHead, TableRow, Table } from '@mui/material'
import { Container, Row } from '@src/components/Metrics/ReportStep/Velocity/style'
import { ReportMetrics } from '@src/models/reportUiState'

interface VelocityProps {
  title: string
  velocityData: ReportMetrics[]
}

export const Velocity = ({ title, velocityData }: VelocityProps) => {
  return (
    <>
      <MetricsSettingTitle title={title} />
      <Container>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='left'>Name</TableCell>
              <TableCell align='center'>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {velocityData.map(({ id, name, value }) => (
              <Row key={id}>
                <TableCell align='left'>{name}</TableCell>
                <TableCell align='center'>{value}</TableCell>
              </Row>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  )
}
