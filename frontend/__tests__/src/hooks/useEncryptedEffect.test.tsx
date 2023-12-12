import { act, renderHook } from '@testing-library/react'
import { encryptedClient } from '@src/clients/EncryptedClient'
import { useEncryptedEffect } from '@src/hooks/useEncryptedEffect'
import { ERROR_MESSAGE_TIME_DURATION, MOCK_ENCRYPTED_REQUEST_PARAMS } from '../fixtures'
import { InternalServerException } from '@src/exceptions/InternalServerException'

describe('use encrypted effect', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should set error message empty when encrypted throw error and last for 4 seconds', async () => {
    jest.useFakeTimers()
    encryptedClient.encrypted = jest.fn().mockImplementation(() => {
      throw new Error('error')
    })
    const { result } = renderHook(() => useEncryptedEffect())

    act(() => {
      result.current.encrypted(MOCK_ENCRYPTED_REQUEST_PARAMS)
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION)
    })

    expect(result.current.errorMessage).toEqual('')
  })

  it('should set error message when encrypted response status 500', async () => {
    encryptedClient.encrypted = jest.fn().mockImplementation(() => {
      throw new InternalServerException('error message')
    })
    const { result } = renderHook(() => useEncryptedEffect())

    act(() => {
      result.current.encrypted(MOCK_ENCRYPTED_REQUEST_PARAMS)
    })

    expect(result.current.errorMessage).toEqual('Error: error message')
  })
})
