import { styled } from '@mui/material/styles';
import { Alert } from '@mui/material';
export const StyledAlert = styled(Alert)({
  '&.MuiPaper-root': {
    border: '1px solid #F3B6BE',
    backgroundColor: '#FFE7EA',
    borderRadius: '8px',
    padding: '12px 24px',
  },
});
