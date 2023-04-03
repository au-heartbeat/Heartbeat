import { HttpStatusCode } from 'axios'
import { BadRequestException } from '@src/exceptions/BadRequestException'
import {
  BAD_REQUEST_ERROR_MESSAGE,
  INTERNAL_SERVER_ERROR_MESSAGE,
  INVALID_TOKEN_ERROR_MESSAGE,
  VERIFY_FAILED_ERROR_MESSAGE,
} from '@src/constants'
import { InternalServerException } from '@src/exceptions/InternalServerException'
import { getVerifyBoardParams } from '@src/clients/BoardClient'
import { getVerifyPipelineToolParams } from '@src/clients/PipelineToolClient'
import { getVerifySourceControlParams } from '@src/clients/SourceControlClient'
import { UnauthorizedException } from '@src/exceptions/UnauthorizedException'

export const verifyException = (
  code: number | undefined,
  params: getVerifyBoardParams | getVerifyPipelineToolParams | getVerifySourceControlParams
) => {
  if (code === HttpStatusCode.BadRequest) {
    throw new BadRequestException(`${params.type} ${VERIFY_FAILED_ERROR_MESSAGE}`, BAD_REQUEST_ERROR_MESSAGE)
  }
  if (code === HttpStatusCode.Unauthorized) {
    throw new UnauthorizedException(`${params.type} ${VERIFY_FAILED_ERROR_MESSAGE}`, INVALID_TOKEN_ERROR_MESSAGE)
  }
  if (code === HttpStatusCode.InternalServerError) {
    throw new InternalServerException(`${params.type} ${VERIFY_FAILED_ERROR_MESSAGE}`, INTERNAL_SERVER_ERROR_MESSAGE)
  }
}
