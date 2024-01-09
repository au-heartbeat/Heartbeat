import { Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';
import { Z_INDEX } from '@src/constants/commons';

export const WarningBar = styled(Snackbar)({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  zIndex: Z_INDEX.SNACKBARS,
});

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

export const StyledAlert = styled(Alert)({
  position: 'absolute',
  marginTop: '6rem',
});
