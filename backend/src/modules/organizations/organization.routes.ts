import { Router } from 'express';
import type { Response, NextFunction } from 'express';

import { organizationController } from './organization.controller';
import { authMiddleware, type AuthRequest } from '../../common/middleware/auth-middleware';
import { validateDto } from '../../common/middleware/validate-dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const router = Router();

// Public list for now (we'll turn this into "my orgs" later)
router.get('/', (req: AuthRequest, res: Response) =>
  organizationController.getOrganizations(req, res),
);

// Protected create/update
router.post(
  '/',
  authMiddleware,
  validateDto(CreateOrganizationDto),
  (req: AuthRequest, res: Response, next: NextFunction) =>
    organizationController.createOrganization(req, res, next),
);

router.patch(
  '/:id',
  authMiddleware,
  validateDto(UpdateOrganizationDto),
  (req: AuthRequest, res: Response, next: NextFunction) =>
    organizationController.updateOrganization(req, res, next),
);

export { router as organizationRouter };
