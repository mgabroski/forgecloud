import { Router } from 'express';

import { authController } from './auth.controller';
import { validateDto } from '../../common/middleware/validate-dto';
import { LoginDto } from './dto/login-dto';

const router = Router();

router.post('/login', validateDto(LoginDto), (req, res, next) =>
  authController.login(req, res, next),
);

export { router as authRouter };
