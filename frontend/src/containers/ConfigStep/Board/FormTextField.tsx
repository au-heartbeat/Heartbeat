import { BOARD_CONFIG_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { TBoardFieldKeys } from '@src/containers/ConfigStep/Form/type';
import { StyledTextField } from '@src/components/Common/ConfigForms';
import { Controller, useFormContext } from 'react-hook-form';
import { KEYS } from '@src/hooks/useVerifyBoardEffect';

interface IFormTextField {
  name: Exclude<TBoardFieldKeys, 'type'>;
  col: number;
  label: string;
}

export const FormTextField = ({ name, col, label }: IFormTextField) => {
  const {
    control,
    setError,
    reset,
    formState: { isSubmitSuccessful },
  } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <StyledTextField
            {...field}
            data-testid={name}
            required
            label={label}
            variant='standard'
            type={name === KEYS.TOKEN ? 'password' : 'text'}
            onFocus={() => {
              if (field.value === '') {
                setError(name, { message: BOARD_CONFIG_ERROR_MESSAGE[name].required });
              }
            }}
            onChange={(e) => {
              if (isSubmitSuccessful) {
                reset(undefined, { keepValues: true, keepErrors: true });
              }
              field.onChange(e.target.value);
            }}
            error={fieldState.invalid && fieldState.error?.message !== BOARD_CONFIG_ERROR_MESSAGE.token.timeout}
            helperText={
              fieldState.error?.message && fieldState.error?.message !== BOARD_CONFIG_ERROR_MESSAGE.token.timeout
                ? fieldState.error?.message
                : ''
            }
            sx={{ gridColumn: `span ${col}` }}
          />
        );
      }}
    />
  );
};
