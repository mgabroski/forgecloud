import argon2 from 'argon2';

import { userRepository } from './user.repository';
import { AuthProvider, User } from './user.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { ConflictError } from '../../common/errors/conflict-error';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    // later we can add filters, pagination, etc.
    return userRepository.findAll();
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email already in use', 'EMAIL_TAKEN');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await userRepository.createUser({
      email: dto.email,
      passwordHash,
      authProvider: AuthProvider.LOCAL, // local signup for now
      fullName: dto.fullName ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      // isActive, createdAt, updatedAt, lastLoginAt will use defaults/columns
    });

    return user;
  }
}

export const userService = new UserService();
