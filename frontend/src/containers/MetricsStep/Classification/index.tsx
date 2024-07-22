import {
  saveClassificationCharts,
  saveTargetFields,
  selectClassificationCharts,
  selectClassificationWarningMessage,
} from '@src/context/Metrics/metricsSlice';
import { TypedStyledAutocompleted, ITargetFieldType } from '@src/components/Common/MultiAutoComplete/styles';
import { Checkbox, createFilterOptions, FilterOptionsState, TextField } from '@mui/material';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import { FormGroupWrapper } from '@src/components/Common/FormGroupWrapper';
import { formatDuplicatedNameWithSuffix } from '@src/utils/util';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { ALL_OPTION_META } from '@src/constants/resources';
import { Z_INDEX } from '@src/constants/commons';
import { useAppSelector } from '@src/hooks';
import React from 'react';

export interface classificationProps {
  title: string;
  label: string;
  targetFields: ITargetFieldType[];
}

const ALL_OPTION_KEY = 'all';

export const Classification = ({ targetFields, title, label }: classificationProps) => {
  const dispatch = useAppDispatch();
  const targetFieldsWithSuffix = formatDuplicatedNameWithSuffix(targetFields);
  const classificationWarningMessage = useAppSelector(selectClassificationWarningMessage);
  const selectedOptions = targetFieldsWithSuffix.filter(({ flag }) => flag);
  const chartOptions = selectedOptions;
  const storedSelectedCharts = useAppSelector(selectClassificationCharts);
  const selectedCharts = chartOptions.filter(({ key }) =>
    storedSelectedCharts.find(({ key: matchedKey }) => matchedKey === key),
  );
  const isAllSelected = selectedOptions.length > 0 && selectedOptions.length === targetFieldsWithSuffix.length;
  const isChartAllSelected = selectedCharts.length > 0 && selectedCharts.length === chartOptions.length;

  const handleChange = (_: React.SyntheticEvent, value: ITargetFieldType[]) => {
    let nextSelectedOptions: ITargetFieldType[];
    if (value.length === 0) {
      nextSelectedOptions = [];
    } else {
      nextSelectedOptions =
        value[value.length - 1].key === ALL_OPTION_KEY ? (isAllSelected ? [] : targetFieldsWithSuffix) : value;
    }
    const updatedTargetFields = targetFields.map((targetField) => ({
      ...targetField,
      flag: !!nextSelectedOptions.find((option) => option.key === targetField.key),
    }));
    dispatch(saveTargetFields(updatedTargetFields));
    updateClassificationChartsWhenTargetSelectionChange(updatedTargetFields);
  };

  const handleChartChange = (_: React.SyntheticEvent, value: ITargetFieldType[]) => {
    let nextSelectedOptions: ITargetFieldType[];
    if (value.length === 0) {
      nextSelectedOptions = [];
    } else {
      nextSelectedOptions =
        value[value.length - 1].key === ALL_OPTION_KEY ? (isChartAllSelected ? [] : chartOptions) : value;
    }
    dispatch(saveClassificationCharts(nextSelectedOptions));
  };

  const updateClassificationChartsWhenTargetSelectionChange = (updatedTargetFields: ITargetFieldType[]) => {
    const updatedSelectedCharts = selectedCharts.filter(({ key }) =>
      updatedTargetFields.find(({ key: targetKey, flag }) => targetKey === key && flag),
    );
    dispatch(saveClassificationCharts(updatedSelectedCharts));
  };

  const filterOptions =
    (isAllSelected: boolean) =>
    (options: ITargetFieldType[], params: FilterOptionsState<ITargetFieldType>): ITargetFieldType[] => {
      const filtered = createFilterOptions<ITargetFieldType>()(options, params);
      const allOption = {
        flag: isAllSelected,
        name: ALL_OPTION_META.label,
        key: ALL_OPTION_META.key,
      };
      return [allOption, ...filtered];
    };

  const disableChartOption = (option: ITargetFieldType) => {
    if (selectedCharts.length >= 4) {
      return !selectedCharts.find(({ key }) => option.key === key) || option.key === ALL_OPTION_KEY;
    }
    return chartOptions.length > 4 && option.key === ALL_OPTION_KEY;
  };

  return (
    <>
      <MetricsSettingTitle title={title} />
      {classificationWarningMessage && <WarningNotification message={classificationWarningMessage} />}
      <FormGroupWrapper>
        <TypedStyledAutocompleted
          aria-label='Classification Setting AutoComplete'
          multiple
          options={targetFieldsWithSuffix}
          disableCloseOnSelect
          value={selectedOptions}
          filterOptions={filterOptions(isAllSelected)}
          getOptionLabel={(option) => option.name}
          onChange={(event, value) => handleChange(event, value as ITargetFieldType[])}
          renderOption={(props, option: ITargetFieldType, state) => {
            const selectAllProps = option.key === ALL_OPTION_KEY ? { checked: isAllSelected } : {};
            return (
              <li {...props} data-testid={option.key}>
                <Checkbox style={{ marginRight: '0.5rem' }} checked={state.selected} {...selectAllProps} />
                {option.name}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} required={true} error={false} variant='standard' label={label} />
          )}
          slotProps={{
            popper: {
              sx: {
                zIndex: Z_INDEX.DROPDOWN,
              },
            },
          }}
        />
        <TypedStyledAutocompleted
          aria-label='Classification Generate Charts'
          multiple
          options={chartOptions}
          disableCloseOnSelect
          disabled={chartOptions?.length === 0}
          value={selectedCharts}
          filterOptions={filterOptions(isChartAllSelected)}
          getOptionLabel={(option) => option.name}
          getOptionDisabled={disableChartOption}
          onChange={(event, value) => handleChartChange(event, value as ITargetFieldType[])}
          renderOption={(props, option: ITargetFieldType, state) => {
            const selectAllProps = option.key === ALL_OPTION_KEY ? { checked: isChartAllSelected } : {};
            return (
              <li {...props} aria-label={'Classification Generate Charts Option ' + option.name}>
                <Checkbox
                  style={{ marginRight: '0.5rem' }}
                  checked={state.selected}
                  {...selectAllProps}
                  disabled={disableChartOption(option)}
                />
                {option.name}
              </li>
            );
          }}
          renderInput={(params) => <TextField {...params} variant='standard' label='Generate charts (optional)' />}
          slotProps={{
            popper: {
              sx: {
                zIndex: Z_INDEX.DROPDOWN,
              },
            },
          }}
        />
      </FormGroupWrapper>
    </>
  );
};
