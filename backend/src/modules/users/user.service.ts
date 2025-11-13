import { userRepository } from './user.repository';
import { User } from './user.entity';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    // later we can add filters, pagination, etc.
    return userRepository.findAll();
  }
}

export const userService = new UserService();
