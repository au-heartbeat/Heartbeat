import {
  BorderTableCell,
  ColumnTableCell,
  Container,
  Row,
  StyledTableCell,
} from '@src/components/Common/ReportForTwoColumns/style';
import { ReportDataForMultipleValueColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { EmojiWrap, StyledAvatar, StyledTypography } from '@src/constants/emojis/style';
import { getEmojiUrls, removeExtraEmojiName } from '@src/constants/emojis/emoji';
import { ReportSelectionTitle } from '@src/containers/MetricsStep/style';
import { ErrorMessagePrompt } from '@src/components/ErrorMessagePrompt';
import { Table, TableBody, TableHead, TableRow } from '@mui/material';
import { AVERAGE_FIELD } from '@src/constants/resources';
import { Loading } from '@src/components/Loading';
import { styled } from '@mui/material/styles';
import { Optional } from '@src/utils/types';
import React, { Fragment } from 'react';
import { theme } from '@src/theme';
import { isEmpty } from 'lodash';

interface ReportDetailTableContainsSubtitleProps {
  title: string;
  units: string[];
  fieldName: string;
  listName: string;
  data: Optional<ReportDataForMultipleValueColumns[]>;
  errorMessage?: string;
  isGray?: boolean;
}

export const StyledLoadingWrapper = styled('div')({
  position: 'relative',
  height: '12rem',
  width: '100%',
});

export const ReportDetailTableContainsSubtitle = ({
  title,
  units,
  fieldName,
  listName,
  data,
  errorMessage,
  isGray = false,
}: ReportDetailTableContainsSubtitleProps) => {
  const emojiRow = (row: ReportDataForMultipleValueColumns) => {
    const { name } = row;
    const emojiUrls: string[] = getEmojiUrls(name);
    if (name.includes(':') && emojiUrls.length > 0) {
      const [prefix, suffix] = row.name.split('/');
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

  const renderRowValueColumn = (values: string[], isGray: boolean) => {
    return values.map((it, index) => (
      <BorderTableCell
        aria-label={'td'}
        key={`${index}-${it}`}
        sx={{
          wordBreak: 'break-all',
        }}
        style={{
          color: isGray ? 'gray' : theme.palette.secondary.contrastText,
        }}
      >
        {it}
      </BorderTableCell>
    ));
  };

  const renderRows = () =>
    data?.slice(0, data?.length === 2 && data[1]?.name === AVERAGE_FIELD ? 1 : data?.length).map((row) => {
      if (isEmpty(row.valueList)) {
        row.valueList = [
          {
            name: '--',
            values: ['--', '--'],
          },
        ];
      }
      return (
        <Fragment key={row.id}>
          <TableRow aria-label={'tr'}>
            <ColumnTableCell
              rowSpan={row.valueList.length + 1}
              sx={{
                wordBreak: 'break-all',
              }}
            >
              {emojiRow(row)}
            </ColumnTableCell>
          </TableRow>
          {row.valueList.map((valuesList) => (
            <Row aria-label={'tr'} key={valuesList.name}>
              <BorderTableCell
                aria-label={'td'}
                sx={{
                  wordBreak: 'break-all',
                }}
                style={{
                  color:
                    isGray && valuesList.name === 'Pipeline Lead Time' ? 'gray' : theme.palette.secondary.contrastText,
                }}
              >
                {valuesList.name}
              </BorderTableCell>
              {renderRowValueColumn(valuesList.values, isGray && valuesList.name === 'Pipeline Lead Time')}
            </Row>
          ))}
        </Fragment>
      );
    });

  const renderLoading = () => (
    <>
      {!errorMessage && !data && (
        <StyledLoadingWrapper>
          <Loading size='1.5rem' backgroundColor='transparent' />
        </StyledLoadingWrapper>
      )}
    </>
  );

  const renderData = () => (
    <>
      {!errorMessage && data && (
        <Table aria-label={title}>
          <TableHead>
            <TableRow>
              <StyledTableCell>{fieldName}</StyledTableCell>
              <StyledTableCell>{listName}</StyledTableCell>
              {units.map((it, index) => (
                <StyledTableCell
                  sx={{
                    wordBreak: 'break-all',
                  }}
                  key={`${index}-${it}`}
                >{`Value${it}`}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      )}
    </>
  );

  return (
    <Container>
      <ReportSelectionTitle>{title}</ReportSelectionTitle>
      {errorMessage && <ErrorMessagePrompt errorMessage={errorMessage} style={{ marginBottom: '1.5rem' }} />}
      {renderLoading()}
      {renderData()}
    </Container>
  );
};

export default ReportDetailTableContainsSubtitle;
