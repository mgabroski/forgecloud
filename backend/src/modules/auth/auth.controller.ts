import { NextFunction, Request, Response } from 'express';

import { authService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { sendSuccess } from '../../common/utils/response';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as LoginDto;
      const result = await authService.login(dto);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
