import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

import { userRepository } from '../users/user.repository';
import { AuthProvider, User } from '../users/user.entity';
import { LoginDto } from './dto/login-dto';
import { env } from '../../config/env';
import { AuthError } from '../../common/errors/auth-error';
import { UpdateMeDto } from './dto/update-me-dto';

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

    const payload: { sub: string; email: string } = {
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

  /**
   * Returns the currently authenticated user (sanitized, without passwordHash),
   * looked up by email.
   */
  async getMeByEmail(email: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user;

    return safeUser as Omit<User, 'passwordHash'>;
  }

  /**
   * Updates the profile of the currently authenticated user (fullName, avatarUrl, etc.),
   * looked up by email.
   */
  async updateMeByEmail(email: string, dto: UpdateMeDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    const saved = await userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = saved;

    return safeUser as Omit<User, 'passwordHash'>;
  }
}

export const authService = new AuthService();
