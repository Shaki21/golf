import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../core/errors';
import { AppError as MiddlewareAppError } from './errors';

export async function errorHandler(error: FastifyError | AppError | MiddlewareAppError | Error, request: FastifyRequest, reply: FastifyReply) {
  // Handle core/errors.ts AppError (has toJSON method)
  if (error instanceof AppError) return reply.status(error.statusCode).send(error.toJSON());

  // Handle middleware/errors.ts AppError (has statusCode and code properties)
  if (error instanceof MiddlewareAppError) {
    const statusCode = error.statusCode;
    const response = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return reply.status(statusCode).send(response);
  }

  // Handle errors with statusCode property (for backwards compatibility)
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    const statusCode = error.statusCode;
    const message = error.message || 'An error occurred';
    const code = 'code' in error ? error.code : getCodeFromStatus(statusCode);

    const response = {
      success: false,
      error: {
        code,
        message,
      },
    };
    return reply.status(statusCode).send(response);
  }

  // Handle Fastify validation errors
  if ('validation' in error) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.validation,
      },
    });
  }

  // Log unexpected errors and return 500
  request.log.error(error);
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
    },
  });
}

function getCodeFromStatus(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 422: return 'VALIDATION_ERROR';
    case 429: return 'TOO_MANY_REQUESTS';
    default: return 'INTERNAL_SERVER_ERROR';
  }
}

export async function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
    },
  });
}
