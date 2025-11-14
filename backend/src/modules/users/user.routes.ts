import { Router } from 'express';

import { userController } from './user.controller';
import { validateDto } from '../../common/middleware/validate-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { authMiddleware } from '../../common/middleware/auth-middleware';

const router = Router();

router.get('/', authMiddleware, (req, res, next) => userController.getUsers(req, res, next));

router.post('/', validateDto(CreateUserDto), (req, res, next) =>
  userController.createUser(req, res, next),
);

export { router as userRouter };
