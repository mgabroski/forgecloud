import { projectRepository } from './project.repository';
import { Project } from './project.entity';

export class ProjectService {
  async getAllProjects(): Promise<Project[]> {
    return projectRepository.findAll();
  }
}

export const projectService = new ProjectService();
