import { Repository } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { User } from './user.entity';

export class UserRepository {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find({
      order: { createdAt: 'ASC' },
    });
  }

  // later: findByEmail, create, etc.
}

export const userRepository = new UserRepository();
