import { useState } from 'react'
import { DURATION } from '@src/constants/commons'
import { EncryptDTO, encryptedClient } from '@src/clients/EncryptedClient'

export interface useEncryptedStateInterface {
  encrypted: (params: EncryptDTO) => Promise<
    | {
        encryptedData: string
      }
    | undefined
  >
  isLoading: boolean
  errorMessage: string
}

export const useEncryptedEffect = (): useEncryptedStateInterface => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const encrypted = async (params: EncryptDTO) => {
    setIsLoading(true)
    try {
      return await encryptedClient.encrypted(params)
    } catch (e) {
      const err = e as Error
      setErrorMessage(`${err}`)
      setTimeout(() => {
        setErrorMessage('')
      }, DURATION.ERROR_MESSAGE_TIME)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    encrypted,
    isLoading,
    errorMessage,
  }
}
