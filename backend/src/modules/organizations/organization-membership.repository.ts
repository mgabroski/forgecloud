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

  /**
   * Returns ACTIVE membership for a user in a specific organization.
   * Includes organization + user relations.
   * Used for access checks and single-org fetch.
   */
  async findActiveMembershipForUserInOrg(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership | null> {
    return this.repo.findOne({
      where: {
        userId,
        organizationId,
        status: OrganizationMembershipStatus.ACTIVE,
      },
      relations: ['organization', 'user'],
    });
  }

  /**
   * Returns all ACTIVE memberships for a specific organization.
   * Includes user relation so we can build member list (name, email, etc.).
   */
  async findActiveMembershipsForOrg(organizationId: string): Promise<OrganizationMembership[]> {
    return this.repo.find({
      where: {
        organizationId,
        status: OrganizationMembershipStatus.ACTIVE,
      },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}

export const organizationMembershipRepository = new OrganizationMembershipRepository();
