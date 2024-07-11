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
  alignItems: 'flex-start',
  justifyContent: props.shouldShowTabs ? 'space-between' : 'flex-end',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}));

export const StyledCalendarWrapper = styled('div')((props: { justCalendar: boolean }) => ({
  display: 'flex',
  flex: '1',
  justifyContent: 'flex-end',
  position: props.justCalendar ? 'absolute' : 'relative',
  zIndex: Z_INDEX.DROPDOWN,
  [theme.breakpoints.down('lg')]: {
    flex: '0',
    order: 1,
    flexDirection: 'row-reverse',
    alignSelf: 'auto',
    margin: props.justCalendar ? '0' : '1.25rem 0 0 ',
    position: 'relative',
  },
}));

export const StyledTabWrapper = styled('div')({
  display: 'flex',
  width: 'fit-content',
  marginTop: '0.5rem',
});

export const StyledTabs = styled(Tabs)({
  marginRight: '2.5rem',
  order: 0,
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .Mui-selected': {
    border: `0.08rem solid ${theme.main.backgroundColor}`,
  },
});

export const StyledChartTabs = styled(Tabs)({
  [theme.breakpoints.down('lg')]: {
    order: 2,
    margin: '1.25rem 0 0',
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

export const PipelinesSelectContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
});
