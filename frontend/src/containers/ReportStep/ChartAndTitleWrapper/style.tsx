import { styled } from '@mui/material/styles';

export const ChartTitle = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  top: '3.15rem',
  left: '1.75rem',
  zIndex: '1',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  height: '1.5rem',
});

export const TrendIcon = styled('span')({
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
  marginLeft: '0.5rem',
  fontSize: '1.125rem',
}));

export const StyledToolTipContent = styled('div')({
  fontSize: '0.85rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});
