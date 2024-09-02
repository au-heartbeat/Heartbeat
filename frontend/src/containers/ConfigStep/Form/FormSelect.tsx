import { InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import { StyledTypeSelections } from '@src/components/Common/ConfigForms';
import NewFunctionsLabel from '@src/components/Common/NewFunctionsLabel';
import { PIPELINE_TOOL_OTHER_OPTION } from '@src/constants/resources';
import { Controller, useFormContext } from 'react-hook-form';

interface IFormSingleSelect {
  name: string;
  options: string[];
  labelText: string;
  value?: string;
  updateValue?: (value: string) => void;
  labelId?: string;
  selectLabelId?: string;
  selectAriaLabel?: string;
}

export const FormSingleSelect = ({
  name,
  options,
  labelText,
  labelId,
  selectLabelId,
  selectAriaLabel,
  value,
  updateValue,
}: IFormSingleSelect) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <StyledTypeSelections variant='standard' required>
            <InputLabel id={labelId}>{labelText}</InputLabel>
            <Select
              {...field}
              value={value ?? field.value}
              labelId={selectLabelId}
              aria-label={selectAriaLabel}
              onChange={(e) => {
                updateValue && updateValue(e.target.value);
              }}
            >
              {options.map((data) => {
                const listItem = <ListItemText primary={data} />;
                return (
                  <MenuItem key={data} value={data}>
                    {data === PIPELINE_TOOL_OTHER_OPTION ? (
                      <NewFunctionsLabel initVersion={'1.3.0'}>{listItem}</NewFunctionsLabel>
                    ) : (
                      listItem
                    )}
                  </MenuItem>
                );
              })}
            </Select>
          </StyledTypeSelections>
        );
      }}
    />
  );
};
