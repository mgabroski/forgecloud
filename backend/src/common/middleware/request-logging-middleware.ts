import type { NextFunction, Response } from 'express';

import type { AuthRequest } from './auth-middleware';
import { sentinelInternalLogger } from '../../modules/sentinel/internal/sentinel-logger.service';

export function requestLoggingMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    if (!req.user) return;

    const diff = process.hrtime.bigint() - start;
    const durationMs = Number(diff) / 1_000_000;

    // Skip noisy health checks
    if (req.path.startsWith('/health')) {
      return;
    }

    // 🔕 Disable Sentinel logging in test environment to avoid
    // async DB work after Jest teardown (those "Cannot log after tests are done" warnings).
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const userAgentHeader = req.headers['user-agent'];
    const userAgent = typeof userAgentHeader === 'string' ? userAgentHeader : '';
    const ip = req.ip ?? '';

    void sentinelInternalLogger
      .logBackendRequestForUser(req.user.id, {
        method: req.method,
        path: req.originalUrl ?? req.url,
        statusCode: res.statusCode,
        durationMs,
        userAgent,
        ip,
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to log backend request', err);
      });
  });

  next();
}
