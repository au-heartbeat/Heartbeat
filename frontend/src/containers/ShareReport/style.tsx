import { PageContentWrapper } from '../../components/Common/PageContentWrapper';
import styled from '@emotion/styled';
import { theme } from '@src/theme';

export const StyledPageContentWrapper = styled(PageContentWrapper)({
  margin: '1.25rem auto',
  [theme.breakpoints.down('lg')]: {
    margin: '1.25rem',
  },
});

export const ErrorSectionWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});
