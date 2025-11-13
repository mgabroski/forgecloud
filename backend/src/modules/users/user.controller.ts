import { Request, Response } from 'express';
import { userService } from './user.service';

class UserController {
  async getUsers(_req: Request, res: Response): Promise<void> {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  }
}

export const userController = new UserController();
