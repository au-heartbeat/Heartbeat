import { render, act } from '@testing-library/react'
import PasswordDialog from '@src/components/Common/PasswordDialog/index'
import { SET_PASSWORD_TITLE, PASSWORD } from '../../../fixtures'
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

  xit('should password visibility', () => {
    const { getByText, getByRole } = setup()
    const mockPassword = '123abc'

    act(async () => {
      await userEvent.type(getByText(PASSWORD), mockPassword)
      await userEvent.click(getByRole('button', { name: 'toggle password visibility' }))
    })
    expect(getByText(mockPassword)).toBeInTheDocument()
  })

  xit('should show error for not match', () => {
    const { getByText } = setup()
    const mockPassword = '123'

    act(() => {
      userEvent.type(getByText(PASSWORD), mockPassword)
    })
    expect(
      getByText('Password length can only be within 6-50 characters and can only contain letters and numbers.')
    ).toBeInTheDocument()
  })
})
