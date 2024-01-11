import { useState } from 'react'
import { boardInfoClient } from '@src/clients/board/BoardInfoClient'
import { BoardInfoRequestDTO } from '@src/clients/board/dto/request'

export interface useGetBoardInfoInterface {
  getBoardInfo: (data: BoardInfoRequestDTO) => Promise<Record<string, any>>
  isLoading: boolean
  errorFields: Record<string, string>
}

export const useGetBoardInfoEffect = (): useGetBoardInfoInterface => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorFields, setErrorFields] = useState({})
  const getBoardInfo = (data: BoardInfoRequestDTO) => {
    setIsLoading(true)
    return boardInfoClient(data).finally(() => setIsLoading(false))
  }
  return {
    getBoardInfo,
    isLoading,
    errorFields,
  }
}
