import { BOARD_CONFIG_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { IBoardConfigErrorMessage } from '@src/containers/ConfigStep/Form/type';
import { StyledTextField } from '@src/components/Common/ConfigForms';
import { Controller, useFormContext } from 'react-hook-form';
import { KEYS } from '@src/hooks/useVerifyBoardEffect';

interface IFormTextField {
  name: keyof IBoardConfigErrorMessage;
  col: number;
}

export const FormTextField = ({ name, col }: IFormTextField) => {
  const { control, setError } = useFormContext();
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
            label={name}
            variant='standard'
            type={name === KEYS.TOKEN ? 'password' : 'text'}
            onFocus={() => {
              if (field.value === '') {
                setError(name, { message: BOARD_CONFIG_ERROR_MESSAGE[name].required });
              }
            }}
            error={fieldState.invalid}
            helperText={fieldState.error?.message || ''}
            sx={{ gridColumn: `span ${col}` }}
          />
        );
      }}
    />
  );
};
