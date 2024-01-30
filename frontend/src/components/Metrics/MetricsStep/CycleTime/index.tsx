import React, { useCallback } from 'react'
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle'
import FlagCard from '@src/components/Metrics/MetricsStep/CycleTime/FlagCard'
import { FormSelectPart } from '@src/components/Metrics/MetricsStep/CycleTime/FormSelectPart'
import { useAppDispatch } from '@src/hooks/useAppDispatch'
import {
  saveCycleTimeSettings,
  saveDoneColumn,
  selectCycleTimeWarningMessage,
  selectMetricsContent,
  setCycleTimeSettingsType,
} from '@src/context/Metrics/metricsSlice'
import { useAppSelector } from '@src/hooks'
import { WarningNotification } from '@src/components/Common/WarningNotification'
import { CYCLE_TIME_SETTINGS_TYPES, DONE, METRICS_CONSTANTS, TIPS } from '@src/constants/resources'
import {
  CycleTimeContainer,
  StyledRadioGroup,
  StyledTooltip,
  TitleAndTooltipContainer,
  TooltipContainer,
} from '@src/components/Metrics/MetricsStep/CycleTime/style'
import { FormControlLabel, IconButton, Radio } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

interface cycleTimeProps {
  title: string
}

export const CycleTime = ({ title }: cycleTimeProps) => {
  const dispatch = useAppDispatch()
  const { cycleTimeSettings, cycleTimeSettingsType } = useAppSelector(selectMetricsContent)
  const isColumnAsKey = cycleTimeSettingsType === CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN
  const warningMessage = useAppSelector(selectCycleTimeWarningMessage)

  const resetRealDoneColumn = useCallback(
    (name: string, value: string) => {
      if (value === DONE) {
        dispatch(saveDoneColumn([]))
      }

      const optionNamesWithDone = cycleTimeSettings.filter(({ value }) => value === DONE).map(({ column }) => column)

      if (optionNamesWithDone.includes(name)) {
        dispatch(saveDoneColumn([]))
      }
    },
    [cycleTimeSettings, dispatch, isColumnAsKey]
  )

  const saveCycleTimeOptions = useCallback(
    (name: string, value: string) => {
      const newCycleTimeSettings = cycleTimeSettings.map((item) =>
        (isColumnAsKey ? item.column === name : item.status === name)
          ? {
              ...item,
              value,
            }
          : item
      )

      isColumnAsKey && resetRealDoneColumn(name, value)
      dispatch(saveCycleTimeSettings(newCycleTimeSettings))
    },
    [cycleTimeSettings, dispatch, isColumnAsKey, resetRealDoneColumn]
  )

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCycleTimeSettingsType(event.target.value))
    dispatch(
      saveCycleTimeSettings(
        cycleTimeSettings.map((item) => ({
          ...item,
          value: METRICS_CONSTANTS.cycleTimeEmptyStr,
        }))
      )
    )
    dispatch(saveDoneColumn([]))
  }

  const data = isColumnAsKey
    ? [...new Set(cycleTimeSettings.map(({ column }) => column))].map((uniqueColumn) => {
        const statuses = cycleTimeSettings
          .filter(({ column }) => column === uniqueColumn)
          .map(({ status }) => status)
          .join(', ')
        const value =
          cycleTimeSettings.find(({ column }) => column === uniqueColumn)?.value || METRICS_CONSTANTS.cycleTimeEmptyStr
        return [uniqueColumn, statuses, value]
      })
    : cycleTimeSettings.map(({ status, column, value }) => [status, column, value])

  return (
    <div aria-label='Cycle time settings section'>
      <TitleAndTooltipContainer>
        <MetricsSettingTitle title={title} />
        <TooltipContainer data-test-id={'tooltip'}>
          <StyledTooltip title={TIPS.CYCLE_TIME}>
            <IconButton aria-label='info'>
              <InfoOutlinedIcon />
            </IconButton>
          </StyledTooltip>
        </TooltipContainer>
      </TitleAndTooltipContainer>
      <StyledRadioGroup aria-label='cycleTimeSettingsType' value={cycleTimeSettingsType} onChange={handleTypeChange}>
        <FormControlLabel value={CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN} control={<Radio />} label='By Column' />
        <FormControlLabel value={CYCLE_TIME_SETTINGS_TYPES.BY_STATUS} control={<Radio />} label='By Status' />
      </StyledRadioGroup>
      <CycleTimeContainer>
        {warningMessage && <WarningNotification message={warningMessage} />}
        <FormSelectPart selectedOptions={data} saveCycleTimeOptions={saveCycleTimeOptions} />
        <FlagCard />
      </CycleTimeContainer>
    </div>
  )
}
