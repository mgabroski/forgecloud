import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

import { userRepository } from '../users/user.repository';
import { AuthProvider, User } from '../users/user.entity';
import { LoginDto } from './dto/login-dto';
import { env } from '../../config/env';
import { AuthError } from '../../common/errors/auth-error';
import { UpdateMeDto } from './dto/update-me-dto';
import {
  organizationService,
  type UserOrganizationSummary,
} from '../organizations/organization.service';

const rawJwtSecret = env.JWT_SECRET;

if (!rawJwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment configuration');
}

const JWT_SECRET: string = rawJwtSecret;

export interface SessionPayload {
  user: Omit<User, 'passwordHash'>;
  organizations: UserOrganizationSummary[];
  activeOrganizationId: string | null;
}

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

  private async buildSession(user: User): Promise<SessionPayload> {
    const organizations = await organizationService.getOrganizationsForUser(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user;

    return {
      user: safeUser as Omit<User, 'passwordHash'>,
      organizations,
      activeOrganizationId: user.activeOrganizationId ?? null,
    };
  }

  /**
   * Returns the full session (user + orgs + activeOrganizationId)
   * for the currently authenticated user, looked up by email.
   */
  async getSessionByEmail(email: string): Promise<SessionPayload> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    return this.buildSession(user);
  }

  /**
   * Updates the profile of the currently authenticated user (fullName, avatarUrl, etc.),
   * looked up by email, and returns an updated session payload.
   */
  async updateMeByEmail(email: string, dto: UpdateMeDto): Promise<SessionPayload> {
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

    return this.buildSession(saved);
  }

  /**
   * Updates the active organization (workspace) for the current user.
   * Validates that the user is a member of the organization if not null.
   */
  async updateActiveOrganizationByEmail(
    email: string,
    organizationId: string | null,
  ): Promise<SessionPayload> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    if (organizationId !== null) {
      const userOrgs = await organizationService.getOrganizationsForUser(user.id);
      const hasMembership = userOrgs.some((org) => org.id === organizationId);

      if (!hasMembership) {
        throw new AuthError('Forbidden: not a member of this organization', 'FORBIDDEN');
      }

      user.activeOrganizationId = organizationId;
    } else {
      // Clear active org
      user.activeOrganizationId = null;
    }

    const saved = await userRepository.save(user);

    return this.buildSession(saved);
  }
}

export const authService = new AuthService();
