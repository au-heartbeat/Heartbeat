import { styled } from '@mui/material/styles'
import { theme } from '@src/theme'
import Button from '@mui/material/Button'
import { basicButtonStyle } from '../../MetricsStepper/style'

export const RemoveButton = styled(Button)({
  ...basicButtonStyle,
  width: '15rem',
  color: theme.main.secondColor,
  margin: '0.5rem 0',
})

export const AddButton = styled(Button)({
  ...basicButtonStyle,
  width: '15rem',
  backgroundColor: theme.main.backgroundColor,
  color: theme.main.color,
  marginTop: '0.5rem',
  '&:hover': {
    ...basicButtonStyle,
    backgroundColor: theme.main.backgroundColor,
    color: theme.main.color,
    marginTop: '0.5rem',
  },
})
