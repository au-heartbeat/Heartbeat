import { ArrowForward, CalendarToday, ExpandMore } from '@mui/icons-material';
import { Z_INDEX } from '@src/constants/commons';
import { Divider } from '@mui/material';
import styled from '@emotion/styled';
import { theme } from '@src/theme';

interface DateRangeContainerProps {
  backgroundColor: string;
  color: string;
}

export const StyledDateRangeViewerContainer = styled('div')<DateRangeContainerProps>(({ backgroundColor, color }) => ({
  position: 'relative',
  width: 'fit-content',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '0.5rem',
  border: `0.07rem solid ${theme.palette.grey[400]}`,
  backgroundColor: backgroundColor,
  color: color,
}));

export const DateRangeContainer = styled('div')({
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  borderTopLeftRadius: '0.5rem',
  borderBottomLeftRadius: '0.5rem',
  padding: '.75rem',
  fontSize: '.875rem',
});

interface DateRangeExpandContainerProps {
  backgroundColor: string;
}

export const DateRangeExpandContainer = styled.div<DateRangeExpandContainerProps>(({ backgroundColor }) => ({
  position: 'absolute',
  right: '-0.25rem',
  top: '3.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.0625rem',
  borderRadius: '0.25rem',
  filter: `drop-shadow(0 0 0.25rem ${theme.palette.grey[400]})`,
  backgroundColor: backgroundColor,
  zIndex: Z_INDEX.POPOVER,
  padding: '0.25rem 0',
  '&:after': {
    position: 'absolute',
    top: '-0.5rem',
    right: '1rem',
    content: "''",
    width: '0',
    height: '0',
    border: '0.5rem solid transparent',
    borderTopColor: backgroundColor,
    borderRightColor: backgroundColor,
    transform: 'rotate(-45deg)',
  },
}));

interface SingleDateRangeProps {
  disabled: boolean;
  backgroundColor: string;
}

export const SingleDateRange = styled('div')(({ disabled, backgroundColor }: SingleDateRangeProps) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.palette.text.primary,
  backgroundColor: backgroundColor,
  fontSize: '.875rem',
  padding: '0.5rem',
  cursor: 'pointer',

  ...(disabled && {
    color: theme.palette.text.disabled,
    cursor: 'default',
  }),
}));

export const StyledArrowForward = styled(ArrowForward)({
  margin: '0 .5rem',
  fontSize: '0.875rem',
});

export const DateRangeFailedIconContainer = styled.div({
  minWidth: '1.25rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StyledCalendarToday = styled(CalendarToday)({
  marginLeft: '1rem',
  fontSize: '.875rem',
});

export const StyledDivider = styled(Divider)({
  position: 'absolute',
  right: '2.5rem',
  top: 0,
  height: '100%',
});

export const StyledExpandMoreIcon = styled(ExpandMore)({
  color: theme.palette.common.black,
  cursor: 'pointer',
});

export const StyledExpandContainer = styled('div')({
  position: 'relative',
  height: '100%',
  width: '2.5rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
});
