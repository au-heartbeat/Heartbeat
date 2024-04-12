import { InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import { StyledTypeSelections } from '@src/components/Common/ConfigForms';
import { Controller, useFormContext } from 'react-hook-form';
import { BOARD_TYPES } from '@src/constants/resources';

interface IFormSelect {
  name: string;
}

export const FormSelect = ({ name }: IFormSelect) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <StyledTypeSelections variant='standard' required>
            <InputLabel id='board-type-checkbox-label'>Board</InputLabel>
            <Select {...field} labelId='board-type-checkbox-label'>
              {Object.values(BOARD_TYPES).map((data) => (
                <MenuItem key={data} value={data}>
                  <ListItemText primary={data} />
                </MenuItem>
              ))}
            </Select>
          </StyledTypeSelections>
        );
      }}
    />
  );
};
