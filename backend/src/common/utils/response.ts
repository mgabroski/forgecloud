import { Response } from 'express';
import { ApiErrorPayload, ApiResponse } from '../types/api-response';
import { AppError } from '../errors/app-error';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response<ApiResponse<T>> {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    error: null,
  };

  // Cast to the precise response type so eslint doesn't see `any`
  return res.status(statusCode).json(payload) as Response<ApiResponse<T>>;
}

export function sendError(res: Response, error: unknown): Response<ApiResponse<null>> {
  let statusCode = 500;
  let payload: ApiErrorPayload = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected error occurred',
  };

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    payload = {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  } else if (error instanceof Error) {
    payload = {
      code: 'UNEXPECTED_ERROR',
      message: error.message || 'Unexpected error occurred',
    };
  }

  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: payload,
  };

  return res.status(statusCode).json(body) as Response<ApiResponse<null>>;
}
