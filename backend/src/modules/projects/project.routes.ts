import { Router } from 'express';
import { projectController } from './project.controller';

const router = Router();

router.get('/', (req, res) => projectController.getProjects(req, res));

export { router as projectRouter };
