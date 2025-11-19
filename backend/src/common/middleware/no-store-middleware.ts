import type { NextFunction, Request, Response } from 'express';

/**
 * Prevents caching of sensitive responses
 * (e.g., /auth/me, tokens, user-specific data).
 *
 * Adds:
 *   Cache-Control: no-store, max-age=0
 *   Pragma: no-cache
 *   Expires: 0
 */
export function noStoreMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}
