import { Router } from 'express';
import { organizationController } from './organization.controller';

const router = Router();

router.get('/', (req, res) => organizationController.getOrganizations(req, res));

export { router as organizationRouter };
