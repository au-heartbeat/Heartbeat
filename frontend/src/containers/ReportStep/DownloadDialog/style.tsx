import { DialogContent, DialogTitle } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const DialogContainer = styled('div')({
  width: '38rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const StyledDialogTitle = styled(DialogTitle)({
  boxSizing: 'border-box',
  width: '100%',
  padding: '2.5rem 2.5rem 1.5rem 2.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '1rem',
});

export const StyledDialogContent = styled(DialogContent)({
  boxSizing: 'border-box',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1.25rem 3.125rem',
});

export const StyledCalendarToday = styled(CalendarToday)({
  color: theme.palette.text.disabled,
  marginRight: '0.75rem',
  fontSize: '1.5rem',
});

export const TimePeriodSelectionMessage = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  fontSize: '1rem',
});
