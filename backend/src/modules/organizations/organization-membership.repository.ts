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

  /**
   * Returns all ACTIVE memberships for a given user, with organizations loaded.
   * Ordered by creation time ASC so we can safely pick the first as default workspace.
   */
  async findActiveMembershipsForUser(userId: string): Promise<OrganizationMembership[]> {
    return this.repo.find({
      where: {
        userId,
        status: OrganizationMembershipStatus.ACTIVE,
      },
      relations: ['organization'],
      order: { createdAt: 'ASC' },
    });
  }
}

export const organizationMembershipRepository = new OrganizationMembershipRepository();
