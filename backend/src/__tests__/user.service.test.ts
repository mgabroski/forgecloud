/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import argon2 from 'argon2';
import { UserService } from '../modules/users/user.service';
import { ConflictError } from '../common/errors/conflict-error';
import { userRepository } from '../modules/users/user.repository';
import { AuthProvider } from '../modules/users/user.entity';

jest.mock('../modules/users/user.repository', () => {
  return {
    userRepository: {
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    },
  };
});

jest.mock('argon2');

const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockedArgon2 = argon2 as unknown as {
  hash: jest.Mock;
};

describe('UserService.createUser', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  it('should create a new user when email is not taken', async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(null as any);
    mockedArgon2.hash.mockResolvedValue('hashed-password');

    const createdUser = {
      id: 'user-id-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      authProvider: AuthProvider.LOCAL,
      fullName: 'Test User',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    mockedUserRepository.createUser.mockResolvedValue(createdUser);

    const result = await service.createUser({
      email: 'test@example.com',
      password: 'secret123',
      fullName: 'Test User',
      // avatarUrl omitted → treated as undefined
    });

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockedArgon2.hash).toHaveBeenCalledWith('secret123');
    expect(mockedUserRepository.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      authProvider: AuthProvider.LOCAL,
      fullName: 'Test User',
      avatarUrl: null, // service turns undefined → null
    });

    expect(result).toBe(createdUser);
  });

  it('should throw ConflictError if email is already in use', async () => {
    mockedUserRepository.findByEmail.mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    } as any);

    await expect(
      service.createUser({
        email: 'test@example.com',
        password: 'secret123',
        fullName: 'Test User',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(mockedUserRepository.createUser).not.toHaveBeenCalled();
  });
});
