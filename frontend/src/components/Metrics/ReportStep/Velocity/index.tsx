import MetricsSettingTitle from '@src/components/Common/MetricsSettingTitle'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Container, Row } from '@src/components/Metrics/ReportStep/Velocity/style'
import { UIVelocityMetric } from '@src/models/reportUiState'

interface VelocityProps {
  title: string
  velocityData: UIVelocityMetric
}

interface VelocityMetricRow {
  name: string
  value: string
}

export const Velocity = ({ title, velocityData }: VelocityProps) => {
  const velocityRows: VelocityMetricRow[] = Object.entries(velocityData).map(([name, value]) => ({
    name,
    value,
  }))

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
            {velocityRows.map(({ name, value }) => (
              <Row key={name}>
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
