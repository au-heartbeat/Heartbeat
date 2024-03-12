import { Alert, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const StyledAlert = styled(Alert)({
  '&.MuiPaper-root': {
    border: `0.07rem solid ${theme.main.alert.error.borderColor}`,
    backgroundColor: theme.main.alert.error.backgroundColor,
    borderRadius: '0.5rem',
    padding: '0.3rem 1rem',
    marginBottom: '0.5rem',
  },
});
export const StyledTypography = styled(Typography)({
  '& span': {
    color: theme.main.secondColor,
    fontWeight: 600,
  },
});
