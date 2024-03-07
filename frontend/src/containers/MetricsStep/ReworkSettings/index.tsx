import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { ReworkHeaderWrapper, ReworkSettingsWrapper, StyledLink } from './style';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { selectReworkTimesSettings } from '@src/context/Metrics/metricsSlice';
import { updateReworkTimesSettings } from '@src/context/Metrics/metricsSlice';
import MultiAutoComplete from '@src/components/Common/MultiAutoComplete';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { CYCLE_TIME_LIST } from '@src/constants/resources';
import { SingleSelection } from './SingleSelection';
import React, { useState } from 'react';

const url = 'XXX';

function ReworkSettings() {
  const [selectedReworkSettings, setSelectedReworkSettings] = useState<string[]>([]);
  const reworkTimesSettings = useAppSelector(selectReworkTimesSettings);
  const dispatch = useAppDispatch();

  const isAllSelected = CYCLE_TIME_LIST.length > 0 && selectedReworkSettings.length === CYCLE_TIME_LIST.length;

  const handleReworkSettingsChange = (_: React.SyntheticEvent, value: string[]) => {
    if (value[value.length - 1] === 'All') {
      setSelectedReworkSettings(selectedReworkSettings.length === CYCLE_TIME_LIST.length ? [] : CYCLE_TIME_LIST);
      return;
    }
    setSelectedReworkSettings([...value]);
  };

  return (
    <>
      <ReworkHeaderWrapper>
        <MetricsSettingTitle title='Rework times settings' />
        <StyledLink underline='none' href={url} target='_blank' rel='noopener'>
          <HelpOutlineOutlinedIcon fontSize='small' />
          How to setup
        </StyledLink>
      </ReworkHeaderWrapper>
      <ReworkSettingsWrapper>
        <SingleSelection
          options={CYCLE_TIME_LIST}
          label={'Rework to which state'}
          value={reworkTimesSettings.rework2State}
          onValueChange={(newValue: string) =>
            dispatch(updateReworkTimesSettings({ ...reworkTimesSettings, rework2State: newValue }))
          }
        />
        <MultiAutoComplete
          ariaLabel='Exclude which states (optional)'
          optionList={CYCLE_TIME_LIST}
          isError={false}
          isSelectAll={isAllSelected}
          onChangeHandler={handleReworkSettingsChange}
          selectedOption={selectedReworkSettings}
          textFieldLabel={'Exclude which states (optional)'}
          isBoardCrews={false}
        />
      </ReworkSettingsWrapper>
    </>
  );
}

export default ReworkSettings;
