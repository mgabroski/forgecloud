import type { Response, NextFunction } from 'express';
import { organizationService } from './organization.service';
import { sendSuccess } from '../../common/utils/response';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthRequest } from '../../common/middleware/auth-middleware';
import { AuthError } from '../../common/errors/auth-error';
import { ValidationError } from '../../common/errors/validation-error';

class OrganizationController {
  async getOrganizations(_req: AuthRequest, res: Response): Promise<void> {
    const organizations = await organizationService.getAllOrganizations();
    sendSuccess(res, organizations);
  }

  async getMyOrganizations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const organizations = await organizationService.getOrganizationsForUser(req.user.id);
      sendSuccess(res, { organizations });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /organizations/:id
   * Returns a single organization for which the current user has an active membership.
   */
  async getOrganizationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const orgId = req.params.id;
      const org = await organizationService.getOrganizationForUser(orgId, req.user.id);

      sendSuccess(res, org);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /organizations/:id/members
   * Returns members of an organization; current user must be an active member.
   */
  async getOrganizationMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const orgId = req.params.id;
      const members = await organizationService.getOrganizationMembersForUser(orgId, req.user.id);

      sendSuccess(res, { members });
    } catch (err) {
      next(err);
    }
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

  /**
   * DELETE /organizations/:id
   * Owner-only deletion.
   */
  async deleteOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const orgId = req.params.id;
      await organizationService.deleteOrganizationAsOwner(orgId, req.user.id);

      // 204 No Content – we can go direct with res here.
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /organizations/:id/invite
   * Placeholder invite endpoint - only OWNER or ADMIN can invite.
   */
  async inviteToOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const orgId = req.params.id;
      const { email } = req.body as { email?: string };

      if (!email) {
        return next(new ValidationError({ email: 'Email is required' }));
      }

      await organizationService.inviteUserToOrganizationPlaceholder(orgId, req.user.id, email);

      sendSuccess(
        res,
        {
          message: 'Invite handling not implemented yet. Placeholder endpoint.',
        },
        202,
      );
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();
