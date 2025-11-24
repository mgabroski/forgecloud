/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import { ProjectService } from '../../modules/projects/project.service';
import { projectRepository } from '../../modules/projects/project.repository';
import { userRepository } from '../../modules/users/user.repository';
import { organizationService } from '../../modules/organizations/organization.service';
import { ValidationError } from '../../common/errors/validation-error';
import { AuthError } from '../../common/errors/auth-error';
import type { Project } from '../../modules/projects/project.entity';
import { ProjectVisibility } from '../../modules/projects/project.entity';

jest.mock('../../modules/projects/project.repository', () => ({
  projectRepository: {
    findByOrganization: jest.fn(),
    findByOrganizationAndKey: jest.fn(),
    createForOrganization: jest.fn(),
  },
}));

jest.mock('../../modules/users/user.repository', () => ({
  userRepository: {
    findById: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../../modules/organizations/organization.service', () => ({
  organizationService: {
    getOrganizationsForUser: jest.fn(),
  },
}));

const mockedProjectRepo = projectRepository as jest.Mocked<typeof projectRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockedOrgService = organizationService as jest.Mocked<typeof organizationService>;

describe('ProjectService', () => {
  let service: ProjectService;

  const baseUser: any = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'User One',
    passwordHash: 'hash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    activeOrganizationId: 'org-1',
  };

  const makeProject = (overrides: Partial<Project> = {}): Project =>
    ({
      id: 'proj-1',
      organizationId: 'org-1',
      name: 'Test Project',
      key: 'TEST',
      description: null,
      status: 'ACTIVE',
      visibility: ProjectVisibility.PRIVATE,
      createdByUserId: 'user-1',
      lastUpdatedByUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as Project;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectService();
  });

  describe('getProjectsForUser', () => {
    it('throws AuthError when user is not found', async () => {
      mockedUserRepo.findById.mockResolvedValue(null as any);

      await expect(service.getProjectsForUser('missing-user')).rejects.toBeInstanceOf(AuthError);

      expect(mockedUserRepo.findById).toHaveBeenCalledWith('missing-user');
      expect(mockedProjectRepo.findByOrganization).not.toHaveBeenCalled();
    });

    it('uses activeOrganizationId when present on user', async () => {
      const userWithOrg = { ...baseUser, activeOrganizationId: 'org-123' };
      const projects = [makeProject({ organizationId: 'org-123', id: 'proj-123' })];

      mockedUserRepo.findById.mockResolvedValue(userWithOrg);
      mockedProjectRepo.findByOrganization.mockResolvedValue(projects);

      const result = await service.getProjectsForUser('user-1');

      expect(mockedUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(mockedProjectRepo.findByOrganization).toHaveBeenCalledWith('org-123');
      expect(result).toEqual(projects);
    });

    it('throws ValidationError when user has no active org and no memberships', async () => {
      const userNoOrg = { ...baseUser, activeOrganizationId: null };
      mockedUserRepo.findById.mockResolvedValue(userNoOrg);
      mockedOrgService.getOrganizationsForUser.mockResolvedValue([]);

      await expect(service.getProjectsForUser('user-1')).rejects.toBeInstanceOf(ValidationError);

      expect(mockedUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(mockedOrgService.getOrganizationsForUser).toHaveBeenCalledWith('user-1');
      expect(mockedProjectRepo.findByOrganization).not.toHaveBeenCalled();
      expect(mockedUserRepo.save).not.toHaveBeenCalled();
    });

    it('auto-selects first membership org when activeOrganizationId is null and persists it', async () => {
      const userNoOrg = { ...baseUser, activeOrganizationId: null };
      const memberships = [
        { id: 'org-A', name: 'Org A', slug: 'org-a', role: 'OWNER' as const },
        { id: 'org-B', name: 'Org B', slug: 'org-b', role: 'MEMBER' as const },
      ];
      const projects = [makeProject({ organizationId: 'org-A', id: 'proj-A1' })];

      mockedUserRepo.findById.mockResolvedValue(userNoOrg);
      mockedOrgService.getOrganizationsForUser.mockResolvedValue(memberships as any);
      mockedProjectRepo.findByOrganization.mockResolvedValue(projects);

      const result = await service.getProjectsForUser('user-1');

      expect(mockedUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(mockedOrgService.getOrganizationsForUser).toHaveBeenCalledWith('user-1');
      expect(mockedUserRepo.save).toHaveBeenCalledTimes(1);
      const savedUser = mockedUserRepo.save.mock.calls[0][0];
      expect(savedUser.activeOrganizationId).toBe('org-A');
      expect(mockedProjectRepo.findByOrganization).toHaveBeenCalledWith('org-A');
      expect(result).toEqual(projects);
    });
  });

  describe('createProjectForUser', () => {
    const input = {
      name: 'My Project',
      key: 'CORE',
      description: 'Some description',
    };

    it('throws AuthError when user is not found', async () => {
      mockedUserRepo.findById.mockResolvedValue(null as any);

      await expect(service.createProjectForUser('missing-user', input)).rejects.toBeInstanceOf(
        AuthError,
      );

      expect(mockedUserRepo.findById).toHaveBeenCalledWith('missing-user');
      expect(mockedProjectRepo.findByOrganizationAndKey).not.toHaveBeenCalled();
    });

    it('throws ValidationError when user has no active org and no memberships', async () => {
      const userNoOrg = { ...baseUser, activeOrganizationId: null };
      mockedUserRepo.findById.mockResolvedValue(userNoOrg);
      mockedOrgService.getOrganizationsForUser.mockResolvedValue([]);

      await expect(service.createProjectForUser('user-1', input)).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedOrgService.getOrganizationsForUser).toHaveBeenCalledWith('user-1');
      expect(mockedProjectRepo.findByOrganizationAndKey).not.toHaveBeenCalled();
    });

    it('creates project for active organization when no duplicate key', async () => {
      const userWithOrg = { ...baseUser, activeOrganizationId: 'org-XYZ' };
      const created = makeProject({ id: 'proj-new', key: 'CORE', organizationId: 'org-XYZ' });

      mockedUserRepo.findById.mockResolvedValue(userWithOrg);
      mockedProjectRepo.findByOrganizationAndKey.mockResolvedValue(null as any);
      mockedProjectRepo.createForOrganization.mockResolvedValue(created);

      const result = await service.createProjectForUser('user-1', input);

      expect(mockedProjectRepo.findByOrganizationAndKey).toHaveBeenCalledWith('org-XYZ', 'CORE');
      expect(mockedProjectRepo.createForOrganization).toHaveBeenCalledWith('org-XYZ', 'user-1', {
        name: input.name,
        key: input.key,
        description: input.description,
        visibility: ProjectVisibility.PRIVATE,
      });
      expect(result).toBe(created);
    });

    it('throws ValidationError when project key already exists in same org', async () => {
      const userWithOrg = { ...baseUser, activeOrganizationId: 'org-XYZ' };
      const existing = makeProject({ id: 'proj-existing', key: 'CORE', organizationId: 'org-XYZ' });

      mockedUserRepo.findById.mockResolvedValue(userWithOrg);
      mockedProjectRepo.findByOrganizationAndKey.mockResolvedValue(existing as any);

      await expect(service.createProjectForUser('user-1', input)).rejects.toBeInstanceOf(
        ValidationError,
      );

      expect(mockedProjectRepo.createForOrganization).not.toHaveBeenCalled();
    });
  });
});
