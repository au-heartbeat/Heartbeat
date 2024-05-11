import { styled } from '@mui/material/styles';
import { Tabs } from '@mui/material';
import { theme } from '@src/theme';

export const StyledSpacing = styled('div')({
  height: '1.5rem',
});

export const basicButtonStyle = {
  height: '2.5rem',
  padding: '0 1rem',
  marginLeft: '0.5rem',
  fontSize: '1rem',
  fontWeight: '500',
  textTransform: theme.typography.button.textTransform,
};

export const StyledCalendarWrapper = styled('div')((props: { isSummaryPage: boolean }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '0.25rem',
  marginBottom: props.isSummaryPage ? '0rem' : '2rem',
}));

export const StyledTabWrapper = styled('div')({
  display: 'flex',
  alignItems: 'flex-end',
});

export const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    display: 'none',
  },
});
