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
import { isEmpty } from 'lodash'
import { StyleFormControl, StylePassWordError } from '@src/components/Common/PasswordDialog/style'

export interface PasswordDialogInterface {
  isShowPasswordDialog: boolean
  handleConfirm: () => void
  handleCancel: () => void
}

export const PasswordDialog = ({ isShowPasswordDialog, handleConfirm, handleCancel }: PasswordDialogInterface) => {
  const [open, setOpen] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('')

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show)

  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault()
  }

  const getPasswordError = (password) => {
    const passwordRegExp = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,50}$')
    if (isEmpty(password)) {
      return 'The password cannot be empty'
    }
    if (!passwordRegExp.test(password)) {
      return 'The password cannot exceed 6-50 characters and contains both numbers and letters'
    }
    return ''
  }

  const onChangePassword = (e) => {
    setPassword(e.target.value)
    setPasswordError(getPasswordError(e.target.value))
  }

  const onChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value)
    setConfirmPasswordError(getPasswordError(e.target.value))
  }

  const onConfirm = () => {
    if (password === confirmPassword && isEmpty(passwordError) && isEmpty(confirmPasswordError)) {
      handleConfirm(password)
    } else {
      setConfirmPasswordError('the confirm password should same as password')
    }
  }

  const resetPassword = () => {
    setPassword('')
    setPasswordError('')
    setConfirmPassword('')
    setConfirmPasswordError('')
  }

  const onCancel = () => {
    handleCancel()
    resetPassword()
  }

  useEffect(() => {
    setOpen(isShowPasswordDialog)
  }, [isShowPasswordDialog])

  return (
    <Fragment>
      <Dialog fullWidth={true} open={open} onClose={handleCancel}>
        <StyleDialogTitle>{'please set password'}</StyleDialogTitle>
        <DialogContent>
          <StyleFormControl sx={{ width: '35ch' }} variant='standard'>
            <InputLabel htmlFor='standard-adornment-password'>Password</InputLabel>
            <Input
              id='standard-adornment-password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onChangePassword(e)}
              error={!isEmpty(passwordError)}
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
            <StylePassWordError>{passwordError}</StylePassWordError>
          </StyleFormControl>
          <FormControl sx={{ width: '35ch' }} variant='standard'>
            <InputLabel htmlFor='standard-confirm-password'>Confirm password</InputLabel>
            <Input
              id='standard-confirm-password'
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onChangeConfirmPassword(e)}
              error={!isEmpty(confirmPasswordError)}
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
            <StylePassWordError>{confirmPasswordError}</StylePassWordError>
          </FormControl>
        </DialogContent>
        <StyleDialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} autoFocus variant='contained'>
            Confirm
          </Button>
        </StyleDialogActions>
      </Dialog>
    </Fragment>
  )
}
