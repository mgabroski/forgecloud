/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { AuthService } from '../../modules/auth/auth.service';
import { userRepository } from '../../modules/users/user.repository';
import { AuthProvider, User } from '../../modules/users/user.entity';
import { AuthError } from '../../common/errors/auth-error';

jest.mock('../../modules/users/user.repository', () => {
  return {
    userRepository: {
      findByEmail: jest.fn(),
    },
  };
});

jest.mock('argon2');
jest.mock('jsonwebtoken');

const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockedArgon2 = argon2 as unknown as {
  verify: jest.Mock;
};
const mockedJwt = jwt as unknown as {
  sign: jest.Mock;
};

describe('AuthService.login', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  const baseUser: User = {
    id: 'user-id-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    authProvider: AuthProvider.LOCAL,
    fullName: 'Test User',
    avatarUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    organizationMemberships: [],
  } as any;

  it('should return accessToken and user on valid credentials', async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(baseUser);
    mockedArgon2.verify.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue('fake-jwt-token');

    const result = await service.login({
      email: 'test@example.com',
      password: 'secret123',
    });

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockedArgon2.verify).toHaveBeenCalledWith('hashed-password', 'secret123');
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      { sub: baseUser.id, email: baseUser.email },
      expect.any(String),
      { expiresIn: '1h' },
    );

    expect(result.accessToken).toBe('fake-jwt-token');
    expect(result.user.email).toBe('test@example.com');
    // passwordHash must be stripped out
    // @ts-expect-error we want to ensure this field is removed
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('should throw AuthError when user does not exist', async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(null as any);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it('should throw AuthError when auth provider is not LOCAL', async () => {
    const googleUser = {
      ...baseUser,
      authProvider: AuthProvider.GOOGLE,
    };

    mockedUserRepository.findByEmail.mockResolvedValue(googleUser as User);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it('should throw AuthError when passwordHash is missing', async () => {
    const userWithoutHash = {
      ...baseUser,
      passwordHash: null,
    };

    mockedUserRepository.findByEmail.mockResolvedValue(userWithoutHash as User);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it('should throw AuthError when password is invalid', async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(baseUser);
    mockedArgon2.verify.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });
});
