import { styled } from '@mui/material/styles';

export const DefinitionTitle = styled('div')({
  fontWeight: 'bolder',
  fontSize: '1.25rem',
  lineHeight: '2.5rem',
});

export const StyledDialogUl = styled('ul')({
  lineHeight: '1.5rem',
  '& span': {
    fontWeight: 'bolder',
    fontSize: '1.25rem',
  },
});

export const StyledDialogLi = styled('li')({
  margin: '2rem 0 0 1rem',
  '& ul': {
    margin: '0 1rem',
  },
});
