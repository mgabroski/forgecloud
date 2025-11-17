import jwt, { JwtPayload } from 'jsonwebtoken';

import { env } from '../../config/env';

const rawJwtSecret = env.JWT_SECRET;

if (!rawJwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment configuration');
}

const JWT_SECRET: string = rawJwtSecret;

export interface DecodedToken {
  sub: string;
  email: string;
}

class TokenService {
  verifyToken(token: string): DecodedToken {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      sub: string;
      email: string;
    };

    if (!decoded.sub || !decoded.email) {
      throw new Error('Invalid JWT payload: missing sub or email');
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
    };
  }
}

export const tokenService = new TokenService();
