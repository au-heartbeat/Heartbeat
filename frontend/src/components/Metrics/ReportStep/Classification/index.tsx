import React from 'react'
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Container, Row } from '@src/components/Common/ReportForTwoColumns/style'
import { ReportDataWithThreeColumns } from '@src/hooks/reportMapper/reportUIDataStructure'

interface ClassificationProps {
  title: string
  classificationData: ReportDataWithThreeColumns[]
}

export const Classification = ({ title, classificationData }: ClassificationProps) => {
  return (
    <>
      <MetricsSettingTitle title={title} />
      <Container>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='left'>Name</TableCell>
              <TableCell align='left'>Subtitle</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody key='classification-list'>
            {classificationData.map(({ id, name, valuesList }) => (
              <React.Fragment key={id}>
                <TableRow>
                  <TableCell align='left' rowSpan={valuesList.length + 1}>
                    {name}
                  </TableCell>
                </TableRow>
                {valuesList.map((e) => (
                  <Row key={e.name}>
                    <TableCell align='left'>{e.name}</TableCell>
                    <TableCell align='left'>{e.value}</TableCell>
                  </Row>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  )
}
