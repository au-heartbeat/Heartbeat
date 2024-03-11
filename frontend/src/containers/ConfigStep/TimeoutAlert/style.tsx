import { Alert, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
export const StyledAlert = styled(Alert)({
  '&.MuiPaper-root': {
    border: '1px solid #F3B6BE',
    backgroundColor: '#FFE7EA',
    borderRadius: '8px',
    padding: '0.3rem 1rem',
    marginBottom: '0.5rem',
  },
});
export const StyledTypography = styled(Typography)({
  '& span': {
    color: '#000000',
    fontWeight: 600,
  },
});
