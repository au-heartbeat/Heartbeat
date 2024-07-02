import { PageContentWrapper } from '../../components/Common/PageContentWrapper';
import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const StyledPageContentWrapper = styled(PageContentWrapper)({
  margin: '1.25rem auto',
  [theme.breakpoints.down('lg')]: {
    margin: '1.25rem',
  },
});
