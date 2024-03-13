import { UseFormStateReturn, Controller, FieldValues, useFormContext } from 'react-hook-form';
import { StyledTextField } from './ConfigForms';
import { TextFieldProps } from '@mui/material';

type IProps = {
  name: string;
  onChange?: (value: string, formState: UseFormStateReturn<FieldValues>) => void;
  onBlur?: (value: string, formState: UseFormStateReturn<FieldValues>) => void;
} & Omit<TextFieldProps, 'onChange' | 'onBlur'>;

const FormTextField = (props: IProps) => {
  const { name, onChange, onBlur, ...textFieldProps } = props;
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => (
        <StyledTextField
          data-testid={`form-text-${name}`}
          {...field}
          {...textFieldProps}
          variant='standard'
          helperText={fieldState.error?.message}
          error={fieldState.invalid}
          onChange={(e) => {
            field.onChange(e.target.value, formState);
            onChange?.(e.target.value, formState);
          }}
          onBlur={(e) => {
            field.onBlur();
            onBlur?.(e.target.value, formState);
          }}
        />
      )}
    />
  );
};

export default FormTextField;
