import { basicButtonStyle } from '@src/containers/ReportStep/style';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { theme } from '@src/theme';

export const StyledRightButtonGroup = styled('div')({
  [theme.breakpoints.down('lg')]: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    '& .MuiButtonBase-root': {
      display: 'flex',
      width: '100%',
      margin: '0.5rem 0 0',
      '&:hover': {
        marginLeft: 0,
      },
    },
  },
});

export const StyledButtonGroup = styled('div')((props: { isShowSave: boolean }) => ({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  margin: '0 auto',
  justifyContent: props.isShowSave ? 'space-between' : 'flex-end',
  width: '100%',
  paddingTop: '2rem',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}));

export const StyledExportButton = styled(Button)({
  ...basicButtonStyle,
  width: '12rem',
  whiteSpace: 'nowrap',
  backgroundColor: theme.main.backgroundColor,
  color: theme.main.color,
  '&:hover': {
    ...basicButtonStyle,
    backgroundColor: theme.main.backgroundColor,
    color: theme.main.color,
  },
  '&:disabled': {
    backgroundColor: theme.main.button.disabled.backgroundColor,
    color: theme.main.button.disabled.color,
  },
});
