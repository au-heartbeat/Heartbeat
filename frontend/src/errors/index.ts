import { InternalServerError } from '@src/errors/InternalServerError';
import { UnauthorizedError } from '@src/errors/UnauthorizedError';
import { BadRequestError } from '@src/errors/BadRequestError';
import { ForbiddenError } from '@src/errors/ForbiddenError';
import { NotFoundError } from '@src/errors/NotFoundError';
import { UnknownError } from '@src/errors/UnknownError';
import { TimeoutError } from '@src/errors/TimeoutError';

export const isAppError = (o: unknown) =>
  [
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError,
    TimeoutError,
    UnknownError,
  ].some((exceptionClass) => o instanceof exceptionClass);
