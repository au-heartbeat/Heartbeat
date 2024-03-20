import { Step, StepLabel, Stepper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { theme } from '@src/theme';

export const StyledDialogContainer = styled('div')({
  padding: '2rem',
  width: '47rem',
  height: '45rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const StyledDialogTitle = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const StyledDialogContent = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '1rem 0',
});

export const StyledStepper = styled(Stepper)({
  display: 'flex',
  width: '40rem',
  margin: '1rem 0',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    fontSize: '0.5rem',
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
  width: 'max-content',
  padding: '0 1rem',
  span: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.5rem',
  },
});

export const StyledStepOfReword = styled('div')({
  width: '100%',
  margin: '1rem auto',
});

export const StyledImg = styled('img')({
  width: '100%',
  margin: '1rem 0',
});

export const StyledNote = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1.25rem',
  marginBottom: '1rem',
});

export const StyledNoteTitle = styled('p')({
  fontSize: '0.875rem',
  fontWeight: '700',
  color: theme.main.note,
});

export const StyledNoteText = styled('p')({
  fontSize: '0.875rem',
  fontWeight: '400',
  color: theme.main.note,
  lineHeight: '1.25rem',
});

export const StyledButtonGroup = styled('div')({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
});

export const StyledStepButton = styled(Button)({
  marginRight: '1rem',
});
