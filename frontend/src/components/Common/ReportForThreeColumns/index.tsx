import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle'
import { Container, Row } from '@src/components/Common/ReportForTwoColumns/style'
import { ReportDataWithThreeColumns } from '@src/models/reportUIDataStructure'
import React, { Fragment } from 'react'

interface ReportForThreeColumnsProps {
  title: string
  fieldName: string
  listName: string
  data: ReportDataWithThreeColumns[]
}
export const ReportForThreeColumns = ({ title, fieldName, listName, data }: ReportForThreeColumnsProps) => {
  const renderRows = () => {
    return data.map((row) => (
      <Fragment key={row.id}>
        <TableRow>
          <TableCell rowSpan={row.values.length + 1}>{row.name}</TableCell>
        </TableRow>
        {row.values.map((values) => (
          <Row key={values.name}>
            <TableCell>{values.name}</TableCell>
            <TableCell>{values.value}</TableCell>
          </Row>
        ))}
      </Fragment>
    ))
  }

  return (
    <>
      <MetricsSettingTitle title={title} />
      <Container>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{fieldName}</TableCell>
              <TableCell>{listName}</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </Container>
    </>
  )
}

export default ReportForThreeColumns
