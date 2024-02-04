import { TypedStyledAutocompleted, ITargetFieldType } from '@src/components/Common/MultiAutoComplete/styles';
import { saveTargetFields, selectClassificationWarningMessage } from '@src/context/Metrics/metricsSlice';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import { Checkbox, createFilterOptions, TextField } from '@mui/material';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { Z_INDEX } from '@src/constants/commons';
import { useAppSelector } from '@src/hooks';
import React, { useMemo } from 'react';

export interface classificationProps {
  title: string;
  label: string;
  targetFields: ITargetFieldType[];
}

export const suffixForDuplicateNames = (targetFields: ITargetFieldType[]) => {
  const countMap = {} as { [key: string]: number };
  type TTargetFieldTypeMeta = [ITargetFieldType, number, boolean?];
  let metas: TTargetFieldTypeMeta[] = [];

  for (const targetField of targetFields) {
    if (countMap[targetField.name]) {
      const count = ++countMap[targetField.name];
      const meta = [targetField, count] as [ITargetFieldType, number];
      metas.push(meta);
    } else {
      countMap[targetField.name] = 1;
      const meta = [targetField, 1] as [ITargetFieldType, number];
      metas.push(meta);
    }
  }

  metas = metas.map((meta) => {
    const [{ name }] = meta;
    const isDuplicated = metas.filter(([{ name: anotherName }]) => anotherName === name).length > 1;
    return [...meta, isDuplicated] as unknown as TTargetFieldTypeMeta;
  });

  return metas.map(([targetField, count, isDuplicated]) =>
    isDuplicated ? { ...targetField, name: `${targetField.name}-${count}` } : { ...targetField },
  );
};

export const Classification = ({ targetFields, title, label }: classificationProps) => {
  const dispatch = useAppDispatch();
  const targetFieldsWithSuffix = useMemo(() => suffixForDuplicateNames(targetFields), [targetFields]);
  const classificationWarningMessage = useAppSelector(selectClassificationWarningMessage);
  const selectedOptions = targetFieldsWithSuffix.filter(({ flag }) => flag);
  const isAllSelected = useMemo(() => {
    return selectedOptions.length > 0 && selectedOptions.length === targetFieldsWithSuffix.length;
  }, [selectedOptions, targetFieldsWithSuffix]);

  const handleChange = (_: React.SyntheticEvent, value: ITargetFieldType[]) => {
    let nextSelectedOptions: ITargetFieldType[];
    if (value.length === 0) {
      nextSelectedOptions = [];
    } else {
      nextSelectedOptions =
        value[value.length - 1].key === 'all' ? (isAllSelected ? [] : [...targetFieldsWithSuffix]) : [...value];
    }
    const updatedTargetFields = targetFields.map((targetField) => ({
      ...targetField,
      flag: !!nextSelectedOptions.find((option) => option.key === targetField.key),
    }));

    dispatch(saveTargetFields(updatedTargetFields));
  };

  return (
    <>
      <MetricsSettingTitle title={title} />
      {classificationWarningMessage && <WarningNotification message={classificationWarningMessage} />}
      <TypedStyledAutocompleted
        multiple
        options={targetFieldsWithSuffix}
        disableCloseOnSelect
        value={selectedOptions}
        filterOptions={(options, params): ITargetFieldType[] => {
          const filtered = createFilterOptions<ITargetFieldType>()(options, params);
          const allOption = {
            flag: isAllSelected,
            name: 'All',
            key: 'all',
          };
          return [allOption, ...filtered];
        }}
        getOptionLabel={(option) => option.name}
        onChange={(event, value) => handleChange(event, value as ITargetFieldType[])}
        renderOption={(props, option: any, state) => {
          const selectAllProps = option.key === 'all' ? { checked: isAllSelected } : {};
          return (
            <li {...props}>
              <Checkbox style={{ marginRight: 8 }} checked={state.selected} {...selectAllProps} />
              {option.name as string}
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
    </>
  );
};
