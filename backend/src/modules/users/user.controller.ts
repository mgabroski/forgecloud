import { NextFunction, Request, Response } from 'express';

import { userService } from './user.service';
import { sendSuccess } from '../../common/utils/response';
import { CreateUserDto } from './dto/create-user-dto';

class UserController {
  async getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateUserDto;
      const user = await userService.createUser(dto);

      const { passwordHash, ...safeUser } = user;
      sendSuccess(res, safeUser, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
