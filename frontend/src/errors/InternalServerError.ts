import { IAppError } from '@src/errors/ErrorType';

export class InternalServerError extends Error implements IAppError {
  code: number;
  description?: string;
  constructor(message: string, status: number, description: string) {
    super(message);
    this.description = description;
    this.code = status;
  }
}
