import { useState } from 'react'
import { DURATION } from '@src/constants/commons'
import { decryptedClient } from '@src/clients/security/DecryptedClient'
import { DecryptDTO } from '@src/clients/security/dto/request'
import { MESSAGE } from '@src/constants/resources'

export interface useDecryptedEffectInterface {
  decrypted: (params: DecryptDTO) => Promise<string | undefined>
  isLoading: boolean
  errorMessage: string
}

export const useDecryptedEffect = (): useDecryptedEffectInterface => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const decrypted = async (params: DecryptDTO) => {
    setIsLoading(true)
    try {
      const result = await decryptedClient.decrypted(params)
      !result && showErrorMessage(MESSAGE.HOME_VERIFY_IMPORT_WARNING)
      return result
    } catch (e) {
      showErrorMessage(`${e as Error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const showErrorMessage = (message: string) => {
    setErrorMessage(message)
    const timerId: NodeJS.Timer = setTimeout(() => {
      setErrorMessage('')
      return clearTimeout(timerId)
    }, DURATION.ERROR_MESSAGE_TIME)
  }

  return {
    decrypted,
    isLoading,
    errorMessage,
  }
}
