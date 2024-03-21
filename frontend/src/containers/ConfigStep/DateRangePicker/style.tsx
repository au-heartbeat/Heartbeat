import { DatePicker } from '@mui/x-date-pickers';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { theme } from '@src/theme';

export const DateRangePickerGroupContainer = styled('div')({
  border: `${theme.main.cardBorder}`,
  borderRadius: '0.25rem',
  padding: '0 1.5rem 1.5rem',
});

export const TitleContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export const StyledDateRangePickerContainer = styled('div')({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  gap: '1.5rem',
  marginTop: '1rem',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
});

export const StyledDateRangePicker = styled(DatePicker)({
  width: '50%',
  button: {
    margin: '0.75rem',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
});

export const AddButton = styled(Button)({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  borderRadius: '0.25rem',
  border: `0.07rem dashed ${theme.main.alert.info.iconColor}`,
  marginTop: '1.5rem',
});
