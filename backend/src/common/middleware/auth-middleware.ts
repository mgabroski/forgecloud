import { NextFunction, Request, Response } from 'express';

import { AuthError } from '../errors/auth-error';
import { tokenService } from '../security/token.service';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthError('Missing or invalid Authorization header', 'NO_TOKEN'));
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const decoded = tokenService.verifyToken(token);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return next(new AuthError('Invalid or expired token', 'INVALID_TOKEN', err));
  }
}
