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

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
    });
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }
}

export const userRepository = new UserRepository();
