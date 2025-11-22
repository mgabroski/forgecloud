import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { organizationRepository } from './organization.repository';
import { organizationMembershipRepository } from './organization-membership.repository';
import { ValidationError } from '../../common/errors/validation-error';
import { Organization, OrganizationPlan } from './organization.entity';
import { OrganizationRole } from './organization-membership.entity';

export interface UserOrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
}

export interface OrganizationMemberSummary {
  id: string;
  fullName: string | null;
  email: string;
  role: OrganizationRole;
  joinedAt: Date;
}

export class OrganizationService {
  async getAllOrganizations(): Promise<Organization[]> {
    return organizationRepository.findAll();
  }

  async createOrganization(userId: string, dto: CreateOrganizationDto): Promise<Organization> {
    // Validate slug uniqueness
    const existing = await organizationRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ValidationError({ slug: 'Slug already taken' });
    }

    // Create org with owner + createdBy set to current user
    const organization = await organizationRepository.createOrganization(userId, {
      name: dto.name,
      slug: dto.slug,
    });

    // Auto-create owner membership
    await organizationMembershipRepository.createForOwner(userId, organization.id);

    return organization;
  }

  async updateOrganization(orgId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await organizationRepository.findById(orgId);
    if (!org) {
      throw new ValidationError({ organization: 'Not found' });
    }

    if (dto.name !== undefined) {
      org.name = dto.name;
    }

    if (dto.plan !== undefined) {
      org.plan = dto.plan as OrganizationPlan;
    }

    return organizationRepository.save(org);
  }

  /**
   * Returns organizations for a given user based on ACTIVE memberships.
   * This is what we will expose via /organizations ("my orgs") and /auth/me.
   */
  async getOrganizationsForUser(userId: string): Promise<UserOrganizationSummary[]> {
    const memberships = await organizationMembershipRepository.findActiveMembershipsForUser(userId);

    return memberships.map((membership) => ({
      id: membership.organizationId,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
    }));
  }

  /**
   * Get a single organization for a user.
   * User must have an active membership in the organization.
   * Used by GET /organizations/:id.
   */
  async getOrganizationForUser(orgId: string, userId: string): Promise<Organization> {
    const membership = await organizationMembershipRepository.findActiveMembershipForUserInOrg(
      userId,
      orgId,
    );

    if (!membership) {
      // We deliberately return "Not found" if user has no membership
      throw new ValidationError({ organization: 'Not found' });
    }

    // membership is expected to have organization relation loaded
    return membership.organization;
  }

  /**
   * Get all members of an organization visible to the current user.
   * The current user must be an active member of the organization.
   * Used by GET /organizations/:id/members.
   */
  async getOrganizationMembersForUser(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMemberSummary[]> {
    // First ensure the caller is a member of this org
    const currentMembership =
      await organizationMembershipRepository.findActiveMembershipForUserInOrg(userId, orgId);

    if (!currentMembership) {
      throw new ValidationError({ organization: 'Not found' });
    }

    const memberships = await organizationMembershipRepository.findActiveMembershipsForOrg(orgId);

    return memberships.map((m) => ({
      id: m.userId,
      fullName: m.user?.fullName ?? null,
      email: m.user?.email ?? '',
      role: m.role,
      joinedAt: m.createdAt,
    }));
  }

  /**
   * Delete an organization.
   * Only the OWNER membership can perform this action.
   * Used by DELETE /organizations/:id.
   */
  async deleteOrganizationAsOwner(orgId: string, userId: string): Promise<void> {
    const membership = await organizationMembershipRepository.findActiveMembershipForUserInOrg(
      userId,
      orgId,
    );

    if (!membership) {
      throw new ValidationError({ organization: 'Not found' });
    }

    if (membership.role !== OrganizationRole.OWNER) {
      throw new ValidationError({
        organization: 'Only the organization owner can delete this organization',
      });
    }

    const deleted = await organizationRepository.deleteById(orgId);
    if (!deleted) {
      // In case org was removed between membership check and delete
      throw new ValidationError({ organization: 'Not found' });
    }
  }

  /**
   * Placeholder invite logic.
   * Only OWNER or ADMIN can invite; MEMBER is not allowed.
   * Used by POST /organizations/:id/invite.
   */
  async inviteUserToOrganizationPlaceholder(
    orgId: string,
    currentUserId: string,
    email: string,
  ): Promise<void> {
    const membership = await organizationMembershipRepository.findActiveMembershipForUserInOrg(
      currentUserId,
      orgId,
    );

    if (!membership) {
      throw new ValidationError({ organization: 'Not found' });
    }

    if (membership.role === OrganizationRole.MEMBER) {
      throw new ValidationError({
        organization: 'Only owners or admins can invite users to this organization',
      });
    }

    // Placeholder: no-op for now, real invite logic (records + email) will come later.
    // We keep this method so the API surface is ready.
    void email;
    return;
  }
}

export const organizationService = new OrganizationService();
