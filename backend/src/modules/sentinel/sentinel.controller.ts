import type { NextFunction, Response } from 'express';

import { sentinelService } from './sentinel.service';
import { sendSuccess } from '../../common/utils/response';
import type { AuthRequest } from '../../common/middleware/auth-middleware';
import { AuthError } from '../../common/errors/auth-error';
import { CreateLogSourceDto } from './dto/create-log-source-dto';
import { IngestLogEntryDto } from './dto/ingest-log-entry-dto';

class SentinelController {
  async getSources(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const sources = await sentinelService.getSourcesForUser(req.user.id);
      sendSuccess(res, { sources });
    } catch (err) {
      next(err);
    }
  }

  async createSource(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const dto = req.body as CreateLogSourceDto;

      const created = await sentinelService.createSourceForUser(req.user.id, {
        name: dto.name.trim(),
        type: dto.type,
        projectId: dto.projectId,
        description: dto.description,
        environment: dto.environment,
        status: dto.status,
      });

      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  }

  async ingestLog(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const dto = req.body as IngestLogEntryDto;

      const created = await sentinelService.ingestLogForUser(req.user.id, {
        sourceId: dto.sourceId,
        projectId: dto.projectId,
        timestamp: dto.timestamp,
        level: dto.level,
        message: dto.message,
        context: dto.context,
        metadata: dto.metadata,
      });

      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  }

  async getLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AuthError('Unauthorized', 'UNAUTHORIZED'));
      }

      const { sourceId, offset, limit } = req.query as {
        sourceId?: string;
        offset?: string;
        limit?: string;
      };

      const parsedOffset = offset ? Number(offset) : 0;
      const parsedLimit = limit ? Number(limit) : 50;

      const { items, total } = await sentinelService.getLogsForUser(req.user.id, {
        sourceId: sourceId || undefined,
        offset: Number.isNaN(parsedOffset) ? 0 : parsedOffset,
        limit: Number.isNaN(parsedLimit) ? 50 : parsedLimit,
      });

      sendSuccess(res, {
        logs: items,
        total,
        offset: parsedOffset,
        limit: parsedLimit,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const sentinelController = new SentinelController();
