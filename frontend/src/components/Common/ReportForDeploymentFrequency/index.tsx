import {
  BorderTableCell,
  ColumnTableCell,
  Container,
  Row,
  StyledTableCell,
} from '@src/components/Common/ReportForTwoColumns/style';
import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { transformEmoji } from '@src/components/Common/ReportForTwoColumns';
import { ReportSelectionTitle } from '@src/containers/MetricsStep/style';
import { Table, TableBody, TableHead, TableRow } from '@mui/material';
import React, { Fragment } from 'react';

interface ReportForDeploymentFrequencyProps {
  title: string;
  tableTitles: string[];
  data: ReportDataWithTwoColumns[];
}

export const ReportForDeploymentFrequency = ({ title, tableTitles, data }: ReportForDeploymentFrequencyProps) => {
  const renderRows = () => {
    return data.map((row) => (
      <Fragment key={row.id}>
        <Row aria-label={'tr'}>
          <ColumnTableCell>{transformEmoji(row, true)}</ColumnTableCell>
          {row.valueList.map((it) => (
            <BorderTableCell key={`${row.id}-${row.name}-${it.value}`}>{it.value}</BorderTableCell>
          ))}
        </Row>
      </Fragment>
    ));
  };

  return (
    <Container>
      <ReportSelectionTitle>{title}</ReportSelectionTitle>
      <Table aria-label={title}>
        <TableHead>
          <TableRow id={tableTitles.toString()}>
            <StyledTableCell>Name</StyledTableCell>
            {tableTitles.map((title, index) => (
              <StyledTableCell
                sx={{
                  wordBreak: 'break-all',
                }}
                key={`${index}-${title}`}
              >{`Value${title}`}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody key={tableTitles.toString()}>{renderRows()}</TableBody>
      </Table>
    </Container>
  );
};

export default ReportForDeploymentFrequency;
