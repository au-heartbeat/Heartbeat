import { Button, Step, StepLabel, Stepper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const StyledStepper = styled(Stepper)({
  display: 'flex',
  flexDirection: 'row',
  width: '60%',
  minWidth: '60rem',
  maxWidth: '76rem',
  margin: '0 auto',
  padding: '2rem',
  [theme.breakpoints.down('lg')]: {
    margin: '1.25rem',
    width: 'auto',
    padding: '0',
    minWidth: 'auto',
  },
});

export const StyledStep = styled(Step)({
  svg: {
    width: '2rem',
    height: '2rem',
  },
  [theme.breakpoints.down('md')]: {
    padding: '0.25rem 0',
  },
});

export const StyledStepLabel = styled(StepLabel)({
  width: '5rem',
  padding: '0 1rem',
  span: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.5rem',
  },
});

export const MetricsStepperContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '70%',
  minWidth: theme.main.contentMinWidth,
  maxWidth: theme.main.contentMaxWidth,
  margin: '0 auto',
  textAlign: 'left',
  [theme.breakpoints.down('lg')]: {
    width: 'auto',
    margin: '0 1.25rem',
    minWidth: 'auto',
  },
});

export const basicButtonStyle = {
  height: '2.5rem',
  padding: '0 1rem',
  fontSize: '1rem',
  fontWeight: '500',
  textTransform: theme.typography.button.textTransform,
};

export const SaveButton = styled(Button)({
  ...basicButtonStyle,
  width: '5.4rem',
  color: theme.main.backgroundColor,
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.8rem',
  },
});

export const BackButton = styled(Button)({
  ...basicButtonStyle,
  width: '5.6rem',
  color: theme.main.backgroundColor,
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.8rem',
  },
});

export const NextButton = styled(Button)({
  ...basicButtonStyle,
  width: '4rem',
  backgroundColor: theme.main.backgroundColor,
  color: theme.main.color,
  marginLeft: '0.5rem',
  '&:disabled': {
    backgroundColor: theme.main.button.disabled.backgroundColor,
    color: theme.main.button.disabled.color,
  },
  '&:hover': {
    backgroundColor: theme.main.backgroundColor,
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.8rem',
    },
  },
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.8rem',
  },
});

export const ButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '0 auto',
  padding: '0 0 2rem 0',
  width: '70%',
  minWidth: theme.main.contentMinWidth,
  maxWidth: theme.main.contentMaxWidth,
  [theme.breakpoints.down('lg')]: {
    width: 'auto',
    margin: '0 1.25rem',
    minWidth: 'auto',
  },
});
