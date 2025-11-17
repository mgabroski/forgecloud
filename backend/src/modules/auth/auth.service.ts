import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

import { userRepository } from '../users/user.repository';
import { AuthProvider, User } from '../users/user.entity';
import { LoginDto } from './dto/login-dto';
import { env } from '../../config/env';
import { AuthError } from '../../common/errors/auth-error';

interface JwtPayload {
  sub: string;
  email: string;
}

const rawJwtSecret = env.JWT_SECRET;

if (!rawJwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment configuration');
}

const JWT_SECRET: string = rawJwtSecret;

export class AuthService {
  private async validateUser(dto: LoginDto): Promise<User> {
    const user = await userRepository.findByEmail(dto.email);

    if (!user || user.authProvider !== AuthProvider.LOCAL || !user.passwordHash) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    return user;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.validateUser(dto);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user;

    return {
      accessToken: token,
      user: safeUser as Omit<User, 'passwordHash'>,
    };
  }
}

export const authService = new AuthService();
