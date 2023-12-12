import { useDecryptedEffect } from '@src/hooks/useDecryptedEffect'
import { renderHook, waitFor } from '@testing-library/react'
import { decryptedClient } from '@src/clients/security/DecryptedClient'
import { InternalServerException } from '@src/exceptions/InternalServerException'
import { act } from 'react-dom/test-utils'
import { DURATION } from '@src/constants/commons'
import { MESSAGE } from '@src/constants/resources'

describe('useDecryptedEffect', () => {
  const request = { encryptedData: '5fff61e21d8a0987b0255058pv8YNHkVApLI99InkLqoZX', password: '123abc' }
  const response = { configData: '{"test": "test"}' }
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return isLoading equals to true when calling decrypted function', () => {
    const { result } = renderHook(() => useDecryptedEffect())
    decryptedClient.decrypted = jest.fn().mockImplementation(async () => response.configData)

    act(() => {
      result.current.decrypted(request)
    })

    expect(result.current.isLoading).toEqual(true)
  })

  it('should return {"test": "test"} when calling decrypted successfully given decrypted response return 200', async () => {
    const { result } = renderHook(() => useDecryptedEffect())
    let content: string | undefined

    decryptedClient.decrypted = jest.fn().mockImplementation(async () => response.configData)

    await act(async () => {
      content = await result.current.decrypted(request)
    })

    expect(content).toEqual(response.configData)
  })

  it('should return error message when calling decrypted successfully with empty content given decrypted response return 200', async () => {
    const { result } = renderHook(() => useDecryptedEffect())
    const request = { encryptedData: '5fff61e21d8a0987b0255058pv8YNHkVApLI99InkLqoZX', password: '123abc' }

    decryptedClient.decrypted = jest.fn().mockImplementation(async () => '')

    await act(async () => {
      await result.current.decrypted(request)
    })

    await waitFor(() => expect(result.current.errorMessage).toEqual(MESSAGE.HOME_VERIFY_IMPORT_WARNING))
  })

  it('should return error message when calling decrypted failed given decrypted response return Non-200', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useDecryptedEffect())
    const excepted = 'Error: error'
    const request = { encryptedData: '5fff61e21d8a0987b0255058pv8YNHkVApLI99InkLqoZX', password: '123abc' }
    decryptedClient.decrypted = jest.fn().mockImplementation(async () => {
      throw new InternalServerException('error')
    })

    act(() => {
      result.current.decrypted(request)
    })

    await waitFor(() => {
      expect(result.current.errorMessage).toEqual(excepted)
    })

    act(() => {
      jest.advanceTimersByTime(DURATION.ERROR_MESSAGE_TIME)
    })

    await waitFor(() => {
      expect(result.current.errorMessage).toEqual('')
    })

    jest.useRealTimers()
  })
})
