import * as React from 'react'
import { Fragment, useEffect } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Input from '@mui/material/Input'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import DialogContent from '@mui/material/DialogContent'
import { StyleDialogActions, StyleDialogTitle } from '@src/components/Metrics/ReportStep/ExpiredDialog/style'

export interface PasswordDialogInterface {
  isShowPasswordDialog: boolean
  handleConfirm: () => void
  handleCancel: () => void
}

export const PasswordDialog = ({ isShowPasswordDialog, handleConfirm, handleCancel }: PasswordDialogInterface) => {
  const [open, setOpen] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show)

  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault()
  }

  useEffect(() => {
    setOpen(isShowPasswordDialog)
  }, [isShowPasswordDialog])

  return (
    <Fragment>
      <Dialog fullWidth={true} open={open} onClose={handleCancel}>
        <StyleDialogTitle>{'please set password'}</StyleDialogTitle>
        <DialogContent>
          <FormControl sx={{ width: '35ch' }} variant='standard'>
            <InputLabel htmlFor='standard-adornment-password'>Password</InputLabel>
            <Input
              id='standard-adornment-password'
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl sx={{ width: '35ch' }} variant='standard'>
            <InputLabel htmlFor='standard-confirm-password'>Confirm password</InputLabel>
            <Input
              id='standard-confirm-password'
              type={showConfirmPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownConfirmPassword}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </DialogContent>
        <StyleDialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} autoFocus variant='contained'>
            Confirm
          </Button>
        </StyleDialogActions>
      </Dialog>
    </Fragment>
  )
}
