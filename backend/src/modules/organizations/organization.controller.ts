import { Request, Response } from 'express';
import { organizationService } from './organization.service';

class OrganizationController {
  async getOrganizations(_req: Request, res: Response): Promise<void> {
    const organizations = await organizationService.getAllOrganizations();
    res.json({ data: organizations });
  }
}

export const organizationController = new OrganizationController();
