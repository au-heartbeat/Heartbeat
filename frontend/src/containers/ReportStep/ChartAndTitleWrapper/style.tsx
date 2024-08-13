import { Z_INDEX } from '@src/constants/commons';
import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const SwitchIconWrapper = styled('img')(
  ({ disabledClickRepeatButton }: { disabledClickRepeatButton: boolean }) => ({
    width: '1.5rem',
    color: theme.main.backgroundColor,
    position: 'absolute',
    right: '1.75rem',
    top: '1.75rem',
    cursor: disabledClickRepeatButton ? 'not-allowed' : 'pointer',
    zIndex: Z_INDEX.BUTTONS,
  }),
);

export const StyledChartAndTitleWrapper = styled('div')({
  position: 'relative',
  flex: '0 0 calc(50% - 1.25rem)',
  height: '25rem',
  marginBottom: '1.25rem',
  borderRadius: '0.75rem',
  border: theme.main.cardBorder,
  background: theme.main.color,
  boxShadow: theme.main.cardShadow,
  [theme.breakpoints.down('lg')]: {
    flex: '0 0 100%',
  },
});

export const ChartTitle = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  top: '1.75rem',
  left: '1.75rem',
  zIndex: '1',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  height: '1.5rem',
});

export const SwitchButtonGroup = styled('div')({
  position: 'absolute',
  left: '12%',
  top: '15%',
  display: 'flex',
  width: '40%',
  gap: '0.5rem',
  zIndex: Z_INDEX.BUTTONS,
});

export const SwitchModelButton = styled('button')(({ selected }: { selected: boolean }) => {
  return {
    appearance: 'none',
    border: 'none',
    outline: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '0.3rem',
    color: theme.main.boardChart.classificationModelColor,
    backgroundColor: selected ? theme.main.boardChart.classificationModelBackgroundColor : 'white',
    borderRadius: selected ? '0.5rem' : 0,
  };
});

export const TrendIconSpan = styled('span')({
  position: 'relative',
  fontSize: '1rem',
  top: '0.1rem',
  '& svg': {
    fontSize: '1.85rem',
  },
  marginRight: '0.5rem',
});

export const TrendContainer = styled('div')(({ color }: { color: string }) => ({
  display: 'flex',
  alignItems: 'center',
  color: color,
  margin: '0 0.5rem',
  fontSize: '1.125rem',
  '&:hover': {
    cursor: 'pointer',
  },
}));

export const StyledTooltipContent = styled('div')({
  position: 'relative',
  fontSize: '0.85rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const TrendTypeIcon = styled('div')(({ color, reverse }: { color: string; reverse?: boolean }) => ({
  position: 'absolute',
  right: '0',
  bottom: '0',
  '& svg': {
    color: color,
    fontSize: '1.125rem',
    transform: reverse ? 'scaleY(-1)' : 'none',
  },
}));
