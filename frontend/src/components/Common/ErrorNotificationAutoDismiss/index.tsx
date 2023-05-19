import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { forwardRef, useEffect, useState } from 'react'
import { ErrorBarAutoDismiss } from './style'
import { useAppDispatch } from '@src/hooks/useAppDispatch'
import { updateWarningMessage } from '@src/context/config/configSlice'

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

export const ErrorNotificationAutoDismiss = (props: { message: string }) => {
  const { message } = props
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false)
      dispatch(updateWarningMessage(null))
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [])
  return (
    <ErrorBarAutoDismiss open={open}>
      <Alert severity='error'>{message}</Alert>
    </ErrorBarAutoDismiss>
  )
}
