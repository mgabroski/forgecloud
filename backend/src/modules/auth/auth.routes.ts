import { Router } from 'express';

import { authController } from './auth.controller';
import { validateDto } from '../../common/middleware/validate-dto';
import { LoginDto } from './dto/login-dto';
import { UpdateMeDto } from './dto/update-me-dto';
import { authMiddleware } from '../../common/middleware/auth-middleware';

const router = Router();

// Login
router.post('/login', validateDto(LoginDto), (req, res, next) =>
  authController.login(req, res, next),
);

// Get current user (/auth/me)
router.get('/me', authMiddleware, (req, res, next) => authController.getMe(req, res, next));

// Update current user (/auth/me)
router.patch('/me', authMiddleware, validateDto(UpdateMeDto), (req, res, next) =>
  authController.updateMe(req, res, next),
);

export { router as authRouter };
