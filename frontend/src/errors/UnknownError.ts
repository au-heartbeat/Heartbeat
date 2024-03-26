import { IAppError } from '@src/errors/ErrorType';
import { MESSAGE } from '@src/constants/resources';

export class UnknownError extends Error implements IAppError {
  constructor() {
    super(MESSAGE.UNKNOWN_ERROR);
  }
}
