import { styled } from '@mui/material/styles';
import { RadioGroup } from '@mui/material';
import { theme } from '@src/theme';

export const StyledRadioGroup = styled(RadioGroup)({
  display: 'flex',
  flexDirection: 'row',
  '& > *': {
    flexBasis: '25%',
    margin: 0,
  },
  paddingTop: '1rem',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export const WarningMessage = styled('span')({
  color: 'red',
});
