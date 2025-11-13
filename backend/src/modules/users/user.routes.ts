import { Router } from 'express';

import { userController } from './user.controller';

const router = Router();

router.get('/', (req, res) => userController.getUsers(req, res));

export { router as userRouter };
