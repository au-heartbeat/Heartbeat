import { StyledTextField } from '@src/containers/MetricsStep/CycleTime/Table/style';
import React, { useState, useCallback, SyntheticEvent, useEffect } from 'react';
import { CYCLE_TIME_LIST, METRICS_CONSTANTS } from '@src/constants/resources';
import NewFunctionsLabel from '@src/components/Common/NewFunctionsLabel';
import { Z_INDEX } from '@src/constants/commons';
import { Autocomplete } from '@mui/material';

interface ICellAutoCompleteProps {
  name: string;
  defaultSelected: string;
  onSelect: (name: string, value: string) => void;
  customRenderInput?: React.FC;
}

const CellAutoComplete = ({ name, defaultSelected, onSelect, customRenderInput }: ICellAutoCompleteProps) => {
  const [selectedCycleTime, setSelectedCycleTime] = useState(defaultSelected);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    setSelectedCycleTime(defaultSelected);
  }, [defaultSelected]);

  const handleInputOnChange = useCallback(
    (event: SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue);
    },
    [setInputValue],
  );
  const handleSelectOnChange = useCallback(
    (event: SyntheticEvent, value: string) => {
      onSelect(name, value);
      setSelectedCycleTime(value);
    },
    [name, onSelect, setSelectedCycleTime],
  );

  const renderInput = customRenderInput || ((params) => <StyledTextField required {...params} label={''} />);

  return (
    <Autocomplete
      aria-label={`Cycle time select for ${name}`}
      disableClearable
      options={CYCLE_TIME_LIST}
      value={selectedCycleTime}
      onChange={handleSelectOnChange}
      inputValue={inputValue}
      onInputChange={handleInputOnChange}
      renderOption={(props, option: string) => {
        const value =
          option === METRICS_CONSTANTS.designValue || option === METRICS_CONSTANTS.waitingForDeploymentValue ? (
            <NewFunctionsLabel initVersion={'1.3.0'}>{option}</NewFunctionsLabel>
          ) : (
            option
          );
        return <li {...props}>{value}</li>;
      }}
      renderInput={renderInput}
      slotProps={{
        popper: {
          sx: {
            zIndex: Z_INDEX.DROPDOWN,
          },
        },
      }}
    />
  );
};

export default CellAutoComplete;
