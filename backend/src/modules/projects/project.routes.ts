import { Router } from 'express';
import type { Response, NextFunction } from 'express';

import { projectController } from './project.controller';
import { authMiddleware, type AuthRequest } from '../../common/middleware/auth-middleware';
import { validateDto } from '../../common/middleware/validate-dto';
import { CreateProjectDto } from './dto/create-project-dto';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  projectController.getProjects(req, res, next),
);

router.post(
  '/',
  authMiddleware,
  validateDto(CreateProjectDto),
  (req: AuthRequest, res: Response, next: NextFunction) =>
    projectController.createProject(req, res, next),
);

export { router as projectRouter };
