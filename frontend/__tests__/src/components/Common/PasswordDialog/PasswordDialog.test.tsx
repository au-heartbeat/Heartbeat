import { act, render } from '@testing-library/react'
import { CONFIRM_PASSWORD, ENCRYPT_CONFIRM, ENCRYPTED_MESSAGE, PASSWORD, SET_PASSWORD_TITLE } from '../../../fixtures'
import userEvent from '@testing-library/user-event'
import PasswordDialog from '@src/components/Common/PasswordDialog'
import React from 'react'

describe('confirm dialog', () => {
  beforeEach(() => jest.resetAllMocks())
  const handleConfirm = jest.fn()
  const handleCancel = jest.fn()
  const setup = () => {
    return render(
      <PasswordDialog isShowPasswordDialog={true} handleConfirm={handleConfirm} handleCancel={handleCancel} />
    )
  }
  it('should show confirm dialog', () => {
    const { getByText } = setup()

    expect(getByText(SET_PASSWORD_TITLE)).toBeInTheDocument()
  })

  it('should call handleConfirm when clicking confirm', async () => {
    const { getByText } = setup()
    const mockPassword = '123abc'

    await act(async () => {
      await userEvent.type(getByText(PASSWORD), mockPassword)
      await userEvent.type(getByText(CONFIRM_PASSWORD), mockPassword)
      await userEvent.click(getByText(ENCRYPT_CONFIRM))
    })

    expect(handleConfirm).toBeCalledTimes(1)
  })

  it('should call handleCancel when clicking cancel button', async () => {
    const { getByText } = setup()

    await act(async () => {
      await userEvent.click(getByText('Cancel'))
    })

    expect(handleCancel).toBeCalledTimes(1)
  })

  it('should password visibility', async () => {
    const { getByText, getByRole, getByLabelText } = setup()
    const mockPassword = '123abc'
    const input = getByLabelText(PASSWORD, { selector: 'input' })

    await act(async () => {
      await userEvent.click(getByRole('button', { name: 'toggle password visibility' }))
      await userEvent.type(getByText(PASSWORD), mockPassword)
    })

    expect(input).toBeInTheDocument()
    expect(input).toHaveValue(mockPassword)
  })

  it('should confirm password visibility', async () => {
    const { getByText, getByRole, getByLabelText } = setup()
    const mockPassword = '123abc'
    const input = getByLabelText(CONFIRM_PASSWORD, { selector: 'input' })

    await act(async () => {
      await userEvent.click(getByRole('button', { name: 'toggle confirmed password visibility' }))
      await userEvent.type(getByText(CONFIRM_PASSWORD), mockPassword)
    })

    expect(input).toBeInTheDocument()
    expect(input).toHaveValue(mockPassword)
  })

  it('should show error for not match', async () => {
    const { getByText } = setup()
    const mockPassword = '123'
    const password = getByText(PASSWORD)

    await act(async () => {
      await userEvent.type(password, mockPassword)
    })

    expect(getByText(ENCRYPTED_MESSAGE.NOT_MATCH)).toBeInTheDocument()
  })

  it('should show error for password not blank', async () => {
    const { getByText, getByLabelText } = setup()
    const mockPrePassword = '123abc'
    const input = getByLabelText(PASSWORD, { selector: 'input' })

    await act(async () => {
      await userEvent.type(getByText(PASSWORD), mockPrePassword)
      await userEvent.type(getByText(CONFIRM_PASSWORD), mockPrePassword)
      await userEvent.clear(input)
    })

    expect(getByText(ENCRYPT_CONFIRM)).toBeDisabled()
    expect(getByText(ENCRYPTED_MESSAGE.PASSWORD_EMPTY)).toBeInTheDocument()
  })

  it('should show error for confirm password not blank', async () => {
    const { getByText, getByLabelText } = setup()
    const mockPrePassword = '123abc'
    const input = getByLabelText(CONFIRM_PASSWORD, { selector: 'input' })

    await act(async () => {
      await userEvent.type(getByText(CONFIRM_PASSWORD), mockPrePassword)
      await userEvent.clear(input)
    })

    expect(getByText(ENCRYPT_CONFIRM)).toBeDisabled()
    expect(getByText(ENCRYPTED_MESSAGE.CONFIRMED_PASSWORD_EMPTY)).toBeInTheDocument()
  })

  it('should show error for password not same', async () => {
    const { getByText } = setup()
    const mockPassword = '123aaa'
    const mockConfirmPassword = '123bbb'
    const confirmButton = getByText(ENCRYPT_CONFIRM)

    expect(confirmButton).toBeDisabled()

    await act(async () => {
      await userEvent.type(getByText(PASSWORD), mockPassword)
      await userEvent.type(getByText(CONFIRM_PASSWORD), mockConfirmPassword)
      await userEvent.click(confirmButton)
    })

    expect(getByText(ENCRYPTED_MESSAGE.NOT_SAME)).toBeInTheDocument()
  })

  it('should enable confirm button', async () => {
    const { getByText } = setup()
    const mockPassword = '123aaa'
    const mockConfirmPassword = '123aaa'
    const confirmButton = getByText(ENCRYPT_CONFIRM)

    expect(confirmButton).toBeDisabled()

    await act(async () => {
      await userEvent.type(getByText(PASSWORD), mockPassword)
      await userEvent.type(getByText(CONFIRM_PASSWORD), mockConfirmPassword)
    })

    expect(confirmButton).toBeEnabled()
  })
})
