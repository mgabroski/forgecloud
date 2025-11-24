import { projectRepository } from './project.repository';
import { Project, ProjectVisibility } from './project.entity';
import { ValidationError } from '../../common/errors/validation-error';
import { AuthError } from '../../common/errors/auth-error';
import { userRepository } from '../users/user.repository';
import { organizationService } from '../organizations/organization.service';

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  visibility?: ProjectVisibility;
}

export class ProjectService {
  private async getActiveOrganizationIdForUser(userId: string): Promise<string> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    if (user.activeOrganizationId) {
      return user.activeOrganizationId;
    }

    const memberships = await organizationService.getOrganizationsForUser(userId);

    if (memberships.length === 0) {
      throw new ValidationError({
        activeOrganizationId: 'User is not a member of any organization',
      });
    }

    const firstOrgId = memberships[0].id;

    user.activeOrganizationId = firstOrgId;
    await userRepository.save(user);

    return firstOrgId;
  }

  async getProjectsForUser(userId: string): Promise<Project[]> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);
    return projectRepository.findByOrganization(organizationId);
  }

  async createProjectForUser(userId: string, input: CreateProjectInput): Promise<Project> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);

    const existing = await projectRepository.findByOrganizationAndKey(organizationId, input.key);
    if (existing) {
      throw new ValidationError({
        key: 'Project key already used in this organization',
      });
    }

    const visibility = input.visibility ?? ProjectVisibility.PRIVATE;

    return projectRepository.createForOrganization(organizationId, userId, {
      name: input.name,
      key: input.key,
      description: input.description ?? null,
      visibility,
    });
  }
}

export const projectService = new ProjectService();
