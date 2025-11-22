import { Router } from 'express';

import { authController } from './auth.controller';
import { validateDto } from '../../common/middleware/validate-dto';
import { LoginDto } from './dto/login-dto';
import { UpdateMeDto } from './dto/update-me-dto';
import { UpdateActiveOrganizationDto } from './dto/update-active-organization-dto';
import { authMiddleware } from '../../common/middleware/auth-middleware';
import { noStoreMiddleware } from '../../common/middleware/no-store-middleware';

const router = Router();

router.post('/login', validateDto(LoginDto), (req, res, next) =>
  authController.login(req, res, next),
);

router.get('/me', authMiddleware, noStoreMiddleware, (req, res, next) =>
  authController.getMe(req, res, next),
);

router.patch('/me', authMiddleware, noStoreMiddleware, validateDto(UpdateMeDto), (req, res, next) =>
  authController.updateMe(req, res, next),
);

router.patch(
  '/active-organization',
  authMiddleware,
  noStoreMiddleware,
  validateDto(UpdateActiveOrganizationDto),
  (req, res, next) => authController.updateActiveOrganization(req, res, next),
);

export { router as authRouter };
