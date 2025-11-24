import type { NextFunction, Response } from 'express';

import { projectService } from './project.service';
import { sendSuccess } from '../../common/utils/response';
import { AuthRequest } from '../../common/middleware/auth-middleware';
import { AuthError } from '../../common/errors/auth-error';
import { CreateProjectDto } from './dto/create-project-dto';

class ProjectController {
  async getProjects(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const projects = await projectService.getProjectsForUser(req.user.id);
      sendSuccess(res, { projects });
    } catch (err) {
      next(err);
    }
  }

  async createProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const dto = req.body as CreateProjectDto;

      const created = await projectService.createProjectForUser(req.user.id, {
        name: dto.name.trim(),
        key: dto.key.trim(),
        description: dto.description,
        visibility: dto.visibility,
      });

      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const projectController = new ProjectController();
