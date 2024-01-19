import React, { useCallback } from 'react';
import { FormControlLabel, Radio, Table, TableBody, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { useAppSelector } from '@src/hooks';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import {
  saveCycleTimeSettings,
  saveDoneColumn,
  selectMetricsContent,
  setCycleTimeSettingsType,
} from '@src/context/Metrics/metricsSlice';
import {
  CYCLE_TIME_SETTINGS_TYPES,
  DONE,
  METRICS_CONSTANTS,
  METRICS_CYCLE_SETTING_TABLE_HEADER_BY_COLUMN,
  METRICS_CYCLE_SETTING_TABLE_HEADER_BY_STATUS,
} from '@src/constants/resources';
import { theme } from '@src/theme';
import CellAutoComplete from '@src/containers/MetricsStep/CycleTime/Table/CellAutoComplete';
import {
  StyledRadioGroup,
  StyledTableHeaderCell,
  StyledTableRowCell,
} from '@src/containers/MetricsStep/CycleTime/Table/style';
import EllipsisText from '@src/components/Common/EllipsisText';

const CycleTimeTable = () => {
  const dispatch = useAppDispatch();
  const { cycleTimeSettings, cycleTimeSettingsType } = useAppSelector(selectMetricsContent);
  const isColumnAsKey = cycleTimeSettingsType === CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN;

  const resetRealDoneColumn = useCallback(
    (name: string, value: string) => {
      if (value === DONE) {
        dispatch(saveDoneColumn([]));
      }

      const optionNamesWithDone = cycleTimeSettings
        .filter(({ value }) => value === DONE)
        .map(({ column, status }) => (isColumnAsKey ? column : status));

      if (optionNamesWithDone.includes(name)) {
        dispatch(saveDoneColumn([]));
      }
    },
    [cycleTimeSettings, dispatch, isColumnAsKey],
  );

  const saveCycleTimeOptions = useCallback(
    (name: string, value: string) => {
      const newCycleTimeSettings = cycleTimeSettings.map((item) =>
        (isColumnAsKey ? item.column === name : item.status === name)
          ? {
              ...item,
              value,
            }
          : item
      );
      resetRealDoneColumn(name, value);
      dispatch(saveCycleTimeSettings(newCycleTimeSettings));
    },
    [cycleTimeSettings, dispatch, isColumnAsKey, resetRealDoneColumn]
  );

  const header = isColumnAsKey
    ? METRICS_CYCLE_SETTING_TABLE_HEADER_BY_COLUMN
    : METRICS_CYCLE_SETTING_TABLE_HEADER_BY_STATUS;

  const data = isColumnAsKey
    ? [...new Set(cycleTimeSettings.map(({ column }) => column))].map((uniqueColumn) => {
        const statuses = cycleTimeSettings
          .filter(({ column }) => column === uniqueColumn)
          .map(({ status }) => status)
          .join(', ');
        const value =
          cycleTimeSettings.find(({ column }) => column === uniqueColumn)?.value || METRICS_CONSTANTS.cycleTimeEmptyStr;
        return [uniqueColumn, statuses, value];
      })
    : cycleTimeSettings.map(({ status, column, value }) => [status, column, value]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCycleTimeSettingsType(event.target.value));
    dispatch(
      saveCycleTimeSettings(
        cycleTimeSettings.map((item) => ({
          ...item,
          value: METRICS_CONSTANTS.cycleTimeEmptyStr,
        }))
      )
    );
  };

  return (
    <>
      <StyledRadioGroup aria-label='cycleTimeSettingsType' value={cycleTimeSettingsType} onChange={handleTypeChange}>
        <FormControlLabel
          value={CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN}
          control={<Radio />}
          label='By Board Column mapping'
        />
        <FormControlLabel
          value={CYCLE_TIME_SETTINGS_TYPES.BY_STATUS}
          control={<Radio />}
          label='By Board Status mapping'
        />
      </StyledRadioGroup>
      <TableContainer sx={{ mb: '2rem' }}>
        <Table aria-label='sticky table'>
          <TableHead>
            <TableRow>
              {header.map(({ emphasis, text }, index) => (
                <StyledTableHeaderCell length={header.length} key={index}>
                  {emphasis ? (
                    <>
                      <span>{text}</span>
                      <span style={{ color: theme.components?.errorMessage.color }}> *</span>
                    </>
                  ) : (
                    text
                  )}
                </StyledTableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow hover key={index}>
                <StyledTableRowCell>{row[0]}</StyledTableRowCell>
                <StyledTableRowCell>
                  <Tooltip title={row[1]} arrow>
                    <EllipsisText fitContent>{row[1]}</EllipsisText>
                  </Tooltip>
                </StyledTableRowCell>
                <StyledTableRowCell>
                  <CellAutoComplete name={row[0]} defaultSelected={row[2]} onSelect={saveCycleTimeOptions} />
                </StyledTableRowCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CycleTimeTable;
