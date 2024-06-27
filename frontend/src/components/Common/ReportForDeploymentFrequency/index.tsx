import {
  BorderTableCell,
  ColumnTableCell,
  Container,
  Row,
  StyledTableCell,
} from '@src/components/Common/ReportForDeploymentFrequency/style';
import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { EmojiWrap, StyledAvatar, StyledTypography } from '@src/constants/emojis/style';
import { getEmojiUrls, removeExtraEmojiName } from '@src/constants/emojis/emoji';
import { ReportSelectionTitle } from '@src/containers/MetricsStep/style';
import { Table, TableBody, TableHead, TableRow } from '@mui/material';
import React, { Fragment } from 'react';

interface ReportForTwoColumnsProps {
  title: string;
  tableTitles: string[];
  data: ReportDataWithTwoColumns[];
}

export const ReportForDeploymentFrequency = ({ title, tableTitles, data }: ReportForTwoColumnsProps) => {
  const transformEmoji = (row: ReportDataWithTwoColumns) => {
    if (typeof row.name != 'string') {
      return row.name;
    }
    const name = row.name as string;
    const emojiUrls: string[] = getEmojiUrls(name);
    if (name.includes(':') && emojiUrls.length > 0) {
      const [prefix, suffix] = name.split('/');
      return (
        <EmojiWrap>
          <StyledTypography>{prefix}/</StyledTypography>
          {emojiUrls.map((url) => (
            <StyledAvatar key={url} src={url} />
          ))}
          <StyledTypography>{removeExtraEmojiName(suffix)}</StyledTypography>
        </EmojiWrap>
      );
    }
    return <StyledTypography>{name}</StyledTypography>;
  };

  console.log('data');
  console.log(data);
  const renderRows = () => {
    return data.map((row) => (
      <Fragment key={row.id}>
        <Row aria-label={'tr'}>
          <ColumnTableCell>{transformEmoji(row)}</ColumnTableCell>
          {row.valueList.map((it) => (
            <BorderTableCell key={`${row.id}-${row.name}-${it.value}`}>{it.value}</BorderTableCell>
          ))}
        </Row>
      </Fragment>
    ));
  };

  return (
    <>
      <Container>
        <ReportSelectionTitle>{title}</ReportSelectionTitle>
        <Table aria-label={title}>
          <TableHead>
            <TableRow id={tableTitles.toString()}>
              <StyledTableCell>Name</StyledTableCell>
              {tableTitles.map((title, index) => (
                <StyledTableCell key={`${index}-${title}`}>{`Value${title}`}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody key={tableTitles.toString()}>{renderRows()}</TableBody>
        </Table>
      </Container>
    </>
  );
};

export default ReportForDeploymentFrequency;
