import { Repository } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { Organization } from './organization.entity';

export class OrganizationRepository {
  private repo: Repository<Organization>;

  constructor() {
    this.repo = AppDataSource.getRepository(Organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.repo.find({
      order: { createdAt: 'ASC' },
    });
  }
}

export const organizationRepository = new OrganizationRepository();
