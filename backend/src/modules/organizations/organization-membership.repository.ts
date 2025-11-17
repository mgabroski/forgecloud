import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import {
  OrganizationMembership,
  OrganizationRole,
  OrganizationMembershipStatus,
} from './organization-membership.entity';

export class OrganizationMembershipRepository {
  private repo: Repository<OrganizationMembership>;

  constructor() {
    this.repo = AppDataSource.getRepository(OrganizationMembership);
  }

  async createForOwner(userId: string, organizationId: string): Promise<OrganizationMembership> {
    const membership = this.repo.create({
      userId,
      organizationId,
      role: OrganizationRole.OWNER,
      status: OrganizationMembershipStatus.ACTIVE,
      invitedByUserId: null,
      invitedAt: null,
      joinedAt: new Date(),
    });

    return this.repo.save(membership);
  }
}

export const organizationMembershipRepository = new OrganizationMembershipRepository();
