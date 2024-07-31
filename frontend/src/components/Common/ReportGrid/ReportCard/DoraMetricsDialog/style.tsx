import { styled } from '@mui/material/styles';

export const DefinitionTitle = styled('div')({
  fontWeight: 'bolder',
  lineHeight: '2rem',
});

export const StyledDialogUl = styled('ul')({
  lineHeight: '1.25rem',
  '& span': {
    fontWeight: 'bolder',
  },
});

export const StyledDialogLi = styled('li')({
  margin: '2rem 0 0 1rem',
  '& ul': {
    margin: '0 1rem',
    '& li': {
      lineHeight: '1.5rem',
    },
  },
});
