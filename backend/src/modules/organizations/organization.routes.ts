import { Router } from 'express';
import { organizationController } from './organization.controller';
import { authMiddleware } from '../../common/middleware/auth-middleware';
import { validateDto } from '../../common/middleware/validate-dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const router = Router();

// Public list for now (we'll turn this into "my orgs" later)
router.get('/', (req, res) => organizationController.getOrganizations(req, res));

// Protected create/update
router.post('/', authMiddleware, validateDto(CreateOrganizationDto), (req, res, next) =>
  organizationController.createOrganization(req, res, next),
);

router.patch('/:id', authMiddleware, validateDto(UpdateOrganizationDto), (req, res, next) =>
  organizationController.updateOrganization(req, res, next),
);

export { router as organizationRouter };
