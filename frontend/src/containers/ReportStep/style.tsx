import { Z_INDEX } from '@src/constants/commons';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { Tab, Tabs } from '@mui/material';
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

export const HeaderContainer = styled('div')((props: { shouldShowTabs: boolean }) => ({
  display: 'flex',
  justifyContent: props.shouldShowTabs ? 'space-between' : 'flex-end',
}));

export const StyledCalendarWrapper = styled('div')((props: { isSummaryPage: boolean; shouldShowChart: boolean }) => ({
  alignSelf: 'end',
  width: 'fit-content',
  display: 'flex',
  justifyContent: props.shouldShowChart ? 'space-between' : 'flex-end',
  marginTop: '0.25rem',
  marginBottom: props.isSummaryPage ? '0rem' : '2rem',
  zIndex: Z_INDEX.DROPDOWN,
}));

export const StyledTabWrapper = styled('div')({
  display: 'flex',
  width: 'fit-content',
});

export const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .Mui-selected': {
    border: `0.08rem solid ${theme.main.backgroundColor}`,
  },
});

export const StyledRetry = styled(Button)({
  marginLeft: '0.5rem',
  marginRight: '1.6rem',
  fontSize: '0.8rem',
  textDecoration: 'none',
  color: theme.main.alert.info.iconColor,
  cursor: 'pointer',
});

export const StyledTab = styled(Tab)({
  border: `0.08rem solid ${theme.main.button.borderLine}`,
  minHeight: '2.5rem',
});
