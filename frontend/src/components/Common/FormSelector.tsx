import { Controller, useFormContext } from 'react-hook-form';
import { StyledTextField } from './ConfigForms';
import { Autocomplete } from '@mui/material';

type IProps = {
  name: string;
  placeholder?: string;
  defaultValue?: string;
  label: string;
  disabled?: boolean;
  options: { label: string; value: string }[];
};

const FormSelector = (props: IProps) => {
  const { name, label, disabled, options, placeholder, defaultValue } = props;
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          {...field}
          data-testid={`form-select-${name}`}
          options={options}
          onChange={(_, { value }) => field.onChange(value)}
          getOptionLabel={(data) => data.label || options.find((option) => option.value === data)?.label || data}
          defaultValue={defaultValue}
          isOptionEqualToValue={(option, value) => option.value === value}
          disableClearable
          renderInput={(params) => (
            <StyledTextField
              {...params}
              variant='standard'
              label={label}
              disabled={disabled}
              error={fieldState.invalid}
              placeholder={placeholder}
              helperText={fieldState.error?.message}
              sx={{ px: '0', py: '.56rem' }}
            />
          )}
        />
      )}
    />
  );
};

export default FormSelector;
