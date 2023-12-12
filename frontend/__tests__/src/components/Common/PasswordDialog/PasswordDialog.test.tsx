import { render, act } from '@testing-library/react'
import PasswordDialog from '@src/components/Common/PasswordDialog/index'
import { SET_PASSWORD_TITLE, PASSWORD, ENCRYPTED_MESSAGE, ENCRYPT_CONFIRM } from '../../../fixtures'
import React from 'react/index'
import userEvent from '@testing-library/user-event'

const handleConfirm = jest.fn()
const handleCancel = jest.fn()

describe('confirm dialog', () => {
  const setup = () => {
    return render(
      <PasswordDialog isShowPasswordDialog={true} handleConfirm={handleConfirm} handleCancel={handleCancel} />
    )
  }
  it('should show confirm dialog', () => {
    const { getByText } = setup()

    expect(getByText(SET_PASSWORD_TITLE)).toBeInTheDocument()
  })

  it('should password visibility', () => {
    const { getByText, getByRole } = setup()
    const mockPassword = '123abc'

    act(() => {
      userEvent.click(getByRole('button', { name: 'toggle password visibility' }))
      userEvent.type(getByText(PASSWORD), mockPassword)
    })
    setTimeout(() => {
      expect(getByText(mockPassword)).toBeInTheDocument()
    }, 100)
  })

  it('should show error for not match', () => {
    const { getByText, getByRole } = setup()
    const mockPassword = '123'

    act(() => {
      userEvent.click(getByRole('button', { name: 'toggle password visibility' }))
      userEvent.type(getByText(PASSWORD), mockPassword)
    })
    setTimeout(() => {
      expect(getByText(ENCRYPTED_MESSAGE.NOT_MATCH)).toBeInTheDocument()
    }, 100)
  })

  it('should show error for password not black', () => {
    const { getByText } = setup()

    act(() => {
      userEvent.click(getByText(ENCRYPT_CONFIRM))
    })
    setTimeout(() => {
      expect(getByText(ENCRYPTED_MESSAGE.PASSWORD_EMPTY)).toBeInTheDocument()
    }, 100)
  })
})
