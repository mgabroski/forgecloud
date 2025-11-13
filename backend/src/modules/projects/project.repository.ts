import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Project } from './project.entity';

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
}

export const projectRepository = new ProjectRepository();
