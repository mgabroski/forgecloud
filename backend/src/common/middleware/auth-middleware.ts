import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { env } from '../../config/env';
import { AuthError } from '../errors/auth-error';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const rawJwtSecret = env.JWT_SECRET;

if (!rawJwtSecret) {
  // Fail fast if config is missing
  throw new Error('JWT_SECRET is not defined in environment configuration');
}

const JWT_SECRET: string = rawJwtSecret;

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthError('Missing or invalid Authorization header', 'NO_TOKEN'));
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload & {
      sub: string;
      email: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return next(new AuthError('Invalid or expired token', 'INVALID_TOKEN', err));
  }
}
