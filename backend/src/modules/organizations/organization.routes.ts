import { Router } from 'express';
import type { Response, NextFunction } from 'express';

import { organizationController } from './organization.controller';
import { authMiddleware, type AuthRequest } from '../../common/middleware/auth-middleware';
import { validateDto } from '../../common/middleware/validate-dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const router = Router();

// For now keep this as a public/global list (could later be admin-only)
router.get('/', (req: AuthRequest, res: Response) =>
  organizationController.getOrganizations(req, res),
);

// GET /organizations/my → organizations for the current user (via memberships)
router.get('/my', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  organizationController.getMyOrganizations(req, res, next),
);

// GET /organizations/:id → single organization (must be member)
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  organizationController.getOrganizationById(req, res, next),
);

// GET /organizations/:id/members → members of org (must be member)
router.get('/:id/members', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  organizationController.getOrganizationMembers(req, res, next),
);

// POST /organizations/:id/invite → owner/admin only (placeholder)
router.post('/:id/invite', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  organizationController.inviteToOrganization(req, res, next),
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

// DELETE /organizations/:id → owner-only
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  organizationController.deleteOrganization(req, res, next),
);

export { router as organizationRouter };
