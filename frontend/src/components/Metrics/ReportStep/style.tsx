import { styled } from '@mui/material/styles'
import { Z_INDEX } from '@src/constants/commons'

export const ErrorNotificationContainer = styled('div')({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: Z_INDEX.MODAL_BACKDROP,
  width: '80%',
})

export const SectionContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'row',
})

export const StyledLine = styled('div')({
  width: '0.25rem',
  height: '1rem',
  borderRight: '0.25rem solid #4350AF',
  marginRight: '0.5rem',
})

export const StyledTitle = styled('div')({
  color: '#000000D9',
  fontFamily: 'Roboto',
  fontSize: '1rem',
  fontWeight: '600',
  lineHeight: '3.25rem',
  marginRight: '1.3rem',
})

export const StyledToggle = styled('div')({
  color: '#4350AF',
  fontFamily: 'Roboto',
  fontSize: '0.75rem',
  cursor: 'pointer',
})
