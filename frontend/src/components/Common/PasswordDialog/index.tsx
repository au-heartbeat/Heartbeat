import { Fragment, useEffect, memo, useState } from 'react'
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

const PasswordDialog = memo(({ isShowPasswordDialog, handleConfirm, handleCancel }: PasswordDialogInterface) => {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show)

  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault()
  }

  const getPasswordError = (password, isConfirmedPassword) => {
    const passwordRegExp = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,50}$')
    if (isEmpty(password)) {
      return isConfirmedPassword ? 'Confirmed password cannot be blank.' : 'Password cannot be blank.'
    }
    if (!passwordRegExp.test(password)) {
      return 'Password length can only be within 6-50 characters and can only contain letters and numbers.'
    }
    return ''
  }

  const onChangePassword = (e) => {
    setPassword(e.target.value)
    setPasswordError(getPasswordError(e.target.value, false))
  }

  const onChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value)
    setConfirmPasswordError(getPasswordError(e.target.value, true))
  }

  const onConfirm = () => {
    if (password === confirmPassword && isEmpty(passwordError) && isEmpty(confirmPasswordError)) {
      handleConfirm(password)
    } else {
      setConfirmPasswordError('Confirmed password should be same with the password.')
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
})

PasswordDialog.displayName = 'PasswordDialog'
export default PasswordDialog
