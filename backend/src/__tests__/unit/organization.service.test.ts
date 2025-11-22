/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import { OrganizationService } from '../../modules/organizations/organization.service';
import { organizationRepository } from '../../modules/organizations/organization.repository';
import { organizationMembershipRepository } from '../../modules/organizations/organization-membership.repository';
import {
  OrganizationMembershipStatus,
  OrganizationRole,
} from '../../modules/organizations/organization-membership.entity';
import { ValidationError } from '../../common/errors/validation-error';
import type { Organization } from '../../modules/organizations/organization.entity';

jest.mock('../../modules/organizations/organization.repository', () => {
  return {
    organizationRepository: {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      createOrganization: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
    },
  };
});

jest.mock('../../modules/organizations/organization-membership.repository', () => {
  return {
    organizationMembershipRepository: {
      createForOwner: jest.fn(),
      findActiveMembershipsForUser: jest.fn(),
      findActiveMembershipForUserInOrg: jest.fn(),
      findActiveMembershipsForOrg: jest.fn(),
    },
  };
});

const mockedOrgRepo = organizationRepository as jest.Mocked<typeof organizationRepository>;
const mockedMembershipRepo = organizationMembershipRepository as jest.Mocked<
  typeof organizationMembershipRepository
>;

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrganizationService();
  });

  const baseOrg: Organization = {
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    plan: 'FREE' as any,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdByUserId: 'user-owner',
    ownerUserId: 'user-owner',
    memberships: [],
    projects: [],
  } as any;

  const makeMembership = (overrides: Partial<any> = {}) => ({
    id: 'mem-1',
    userId: 'user-1',
    organizationId: 'org-1',
    role: OrganizationRole.OWNER,
    status: OrganizationMembershipStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'User One',
    },
    organization: baseOrg,
    ...overrides,
  });

  describe('getOrganizationForUser', () => {
    it('throws ValidationError when user has no active membership', async () => {
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(null as any);

      await expect(service.getOrganizationForUser('org-1', 'user-1')).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedMembershipRepo.findActiveMembershipForUserInOrg).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
    });

    it('returns organization when user has active membership', async () => {
      const membership = makeMembership();
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);

      const org = await service.getOrganizationForUser('org-1', 'user-1');

      expect(org).toBe(baseOrg);
      expect(org.id).toBe('org-1');
    });
  });

  describe('getOrganizationMembersForUser', () => {
    it('throws ValidationError when current user is not a member', async () => {
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(null as any);

      await expect(service.getOrganizationMembersForUser('org-1', 'user-1')).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedMembershipRepo.findActiveMembershipForUserInOrg).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
    });

    it('returns member summaries when current user is a member', async () => {
      const currentMembership = makeMembership({ userId: 'user-1' });
      const otherMembership = makeMembership({
        id: 'mem-2',
        userId: 'user-2',
        user: {
          id: 'user-2',
          email: 'other@example.com',
          fullName: 'Other User',
        },
        role: OrganizationRole.MEMBER,
      });

      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(
        currentMembership as any,
      );
      mockedMembershipRepo.findActiveMembershipsForOrg.mockResolvedValue([
        currentMembership as any,
        otherMembership as any,
      ]);

      const result = await service.getOrganizationMembersForUser('org-1', 'user-1');

      expect(mockedMembershipRepo.findActiveMembershipForUserInOrg).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
      expect(mockedMembershipRepo.findActiveMembershipsForOrg).toHaveBeenCalledWith('org-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      const owner = result.find((m) => m.id === 'user-1');
      const member = result.find((m) => m.id === 'user-2');

      expect(owner?.role).toBe(OrganizationRole.OWNER);
      expect(member?.role).toBe(OrganizationRole.MEMBER);
      expect(member?.email).toBe('other@example.com');
    });
  });

  describe('deleteOrganizationAsOwner', () => {
    it('throws ValidationError when user is not a member', async () => {
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(null as any);

      await expect(service.deleteOrganizationAsOwner('org-1', 'user-1')).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedMembershipRepo.findActiveMembershipForUserInOrg).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
      expect(mockedOrgRepo.deleteById).not.toHaveBeenCalled();
    });

    it('throws ValidationError when user is not OWNER', async () => {
      const membership = makeMembership({ role: OrganizationRole.MEMBER });
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);

      await expect(service.deleteOrganizationAsOwner('org-1', 'user-1')).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedOrgRepo.deleteById).not.toHaveBeenCalled();
    });

    it('throws ValidationError when deleteById returns false', async () => {
      const membership = makeMembership({ role: OrganizationRole.OWNER });
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);
      mockedOrgRepo.deleteById.mockResolvedValue(false);

      await expect(service.deleteOrganizationAsOwner('org-1', 'user-1')).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedOrgRepo.deleteById).toHaveBeenCalledWith('org-1');
    });

    it('deletes organization when user is OWNER and deleteById succeeds', async () => {
      const membership = makeMembership({ role: OrganizationRole.OWNER });
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);
      mockedOrgRepo.deleteById.mockResolvedValue(true);

      await expect(service.deleteOrganizationAsOwner('org-1', 'user-1')).resolves.toBeUndefined();

      expect(mockedMembershipRepo.findActiveMembershipForUserInOrg).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
      expect(mockedOrgRepo.deleteById).toHaveBeenCalledWith('org-1');
    });
  });

  describe('inviteUserToOrganizationPlaceholder', () => {
    it('throws ValidationError when current user is not a member', async () => {
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(null as any);

      await expect(
        service.inviteUserToOrganizationPlaceholder('org-1', 'user-1', 'invitee@example.com'),
      ).rejects.toBeInstanceOf(ValidationError);

      expect(mockedMembershipRepo.findActiveMembershipForUserInOrg).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
    });

    it('throws ValidationError when current user is only MEMBER', async () => {
      const membership = makeMembership({ role: OrganizationRole.MEMBER });
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);

      await expect(
        service.inviteUserToOrganizationPlaceholder('org-1', 'user-1', 'invitee@example.com'),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('allows OWNER to call placeholder without error', async () => {
      const membership = makeMembership({ role: OrganizationRole.OWNER });
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);

      await expect(
        service.inviteUserToOrganizationPlaceholder('org-1', 'user-1', 'invitee@example.com'),
      ).resolves.toBeUndefined();
    });

    it('allows ADMIN to call placeholder without error', async () => {
      const membership = makeMembership({ role: OrganizationRole.ADMIN });
      mockedMembershipRepo.findActiveMembershipForUserInOrg.mockResolvedValue(membership as any);

      await expect(
        service.inviteUserToOrganizationPlaceholder('org-1', 'user-1', 'invitee@example.com'),
      ).resolves.toBeUndefined();
    });
  });
});
