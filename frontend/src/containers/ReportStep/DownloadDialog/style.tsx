import { DialogContent, DialogTitle } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  fontSize: '1.125rem',
});

export const StyledDialogContent = styled(DialogContent)({
  boxSizing: 'border-box',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem 0',
});
