import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Project, ProjectVisibility } from './project.entity';

interface CreateProjectPayload {
  name: string;
  key: string;
  description: string | null;
  visibility: ProjectVisibility;
}

export class ProjectRepository {
  private repo: Repository<Project>;

  constructor() {
    this.repo = AppDataSource.getRepository(Project);
  }

  async findAll(): Promise<Project[]> {
    return this.repo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<Project[]> {
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrganizationAndKey(organizationId: string, key: string): Promise<Project | null> {
    return this.repo.findOne({
      where: {
        organizationId,
        key,
      },
    });
  }

  async createForOrganization(
    organizationId: string,
    createdByUserId: string,
    payload: CreateProjectPayload,
  ): Promise<Project> {
    const project = this.repo.create({
      organizationId,
      name: payload.name,
      key: payload.key,
      description: payload.description,
      visibility: payload.visibility,
      createdByUserId,
      lastUpdatedByUserId: createdByUserId,
    });

    return this.repo.save(project);
  }
}

export const projectRepository = new ProjectRepository();
