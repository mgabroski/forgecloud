import { organizationRepository } from './organization.repository';
import { Organization } from './organization.entity';

export class OrganizationService {
  async getAllOrganizations(): Promise<Organization[]> {
    return organizationRepository.findAll();
  }
}

export const organizationService = new OrganizationService();
