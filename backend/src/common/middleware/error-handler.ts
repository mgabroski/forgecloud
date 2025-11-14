import { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/response';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Central place where we log errors
  // You can later plug in Winston / Pino / external logging here
  // For now: simple console logging
  console.error('Unhandled error:', err);

  return sendError(res, err);
}
