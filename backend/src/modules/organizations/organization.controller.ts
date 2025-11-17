import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organization.service';
import { sendSuccess } from '../../common/utils/response';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthRequest } from '../../common/middleware/auth-middleware';
import { AuthError } from '../../common/errors/auth-error';

class OrganizationController {
  async getOrganizations(_req: Request, res: Response): Promise<void> {
    const organizations = await organizationService.getAllOrganizations();
    sendSuccess(res, organizations);
  }

  async createOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const dto = req.body as CreateOrganizationDto;
      const created = await organizationService.createOrganization(req.user.id, dto);

      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const orgId = req.params.id;
      const dto = req.body as UpdateOrganizationDto;

      const updated = await organizationService.updateOrganization(orgId, dto);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();
