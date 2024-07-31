import { styled } from '@mui/material/styles';

export const DefinitionTitle = styled('div')({
  fontWeight: 'bolder',
  fontSize: '1rem',
  lineHeight: '2rem',
});

export const StyledDialogUl = styled('ul')({
  lineHeight: '1.25rem',
  '& span': {
    fontWeight: 'bolder',
    fontSize: '1rem',
  },
});

export const StyledDialogLi = styled('li')({
  margin: '2rem 0 0 1rem',
  '& ul': {
    margin: '0 1rem',
  },
  '& ul li': {
    lineHeight: '1.5rem',
  },
});
