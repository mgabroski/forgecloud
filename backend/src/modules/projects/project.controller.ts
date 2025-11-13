import { Request, Response } from 'express';
import { projectService } from './project.service';

class ProjectController {
  async getProjects(_req: Request, res: Response): Promise<void> {
    const projects = await projectService.getAllProjects();
    res.json({ data: projects });
  }
}

export const projectController = new ProjectController();
