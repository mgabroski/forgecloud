import { NextFunction, Response } from 'express';

import { authService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { UpdateMeDto } from './dto/update-me-dto';
import { sendSuccess } from '../../common/utils/response';
import { AuthRequest } from '../../common/middleware/auth-middleware';
import { AuthError } from '../../common/errors/auth-error';

class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as LoginDto;
      const result = await authService.login(dto);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const user = await authService.getMeByEmail(req.user.email);

      // 🔒 Avoid any caching of /auth/me responses
      res.setHeader('Cache-Control', 'no-store, max-age=0');

      // 🧱 Final contract: data = { user, organizations }
      // Organizations are empty for now; we’ll wire real orgs later.
      sendSuccess(res, {
        user,
        organizations: [],
      });
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const dto = req.body as UpdateMeDto;

      const result = await authService.updateMeByEmail(req.user.email, dto);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
