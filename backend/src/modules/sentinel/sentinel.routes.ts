import { Router } from 'express';
import type { Response, NextFunction } from 'express';

import { sentinelController } from './sentinel.controller';
import { authMiddleware, type AuthRequest } from '../../common/middleware/auth-middleware';
import { validateDto } from '../../common/middleware/validate-dto';
import { CreateLogSourceDto } from './dto/create-log-source-dto';
import { IngestLogEntryDto } from './dto/ingest-log-entry-dto';

const router = Router();

// GET /sentinel/sources
router.get('/sources', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  sentinelController.getSources(req, res, next),
);

// POST /sentinel/sources
router.post(
  '/sources',
  authMiddleware,
  validateDto(CreateLogSourceDto),
  (req: AuthRequest, res: Response, next: NextFunction) =>
    sentinelController.createSource(req, res, next),
);

// GET /sentinel/logs
router.get('/logs', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) =>
  sentinelController.getLogs(req, res, next),
);

// POST /sentinel/logs
router.post(
  '/logs',
  authMiddleware,
  validateDto(IngestLogEntryDto),
  (req: AuthRequest, res: Response, next: NextFunction) =>
    sentinelController.ingestLog(req, res, next),
);

export { router as sentinelRouter };
