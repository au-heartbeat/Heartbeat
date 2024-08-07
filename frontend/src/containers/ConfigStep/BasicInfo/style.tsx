import { FormControlLabel, FormLabel, TextField } from '@mui/material';
import { css, styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const ProjectNameInput = styled(TextField)({
  width: '100%',
});

export const StyledFormControlLabel = styled(FormControlLabel)`
  ${css`
    ${theme.breakpoints.down('sm')} {
      & .MuiFormControlLabel-label {
        font-size: 0.8rem;
      }
    }
  `}
`;

export const CollectionDateLabel = styled(FormLabel)({
  width: '100%',
  color: theme.palette.secondary.contrastText,
  fontSize: '0.75rem',
  lineHeight: '2em',
  boxSizing: 'border-box',
  marginTop: '1rem',
});
