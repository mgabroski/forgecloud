import { Repository } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { LogEntry, LogLevel } from './log-entry.entity';

interface CreateLogEntryPayload {
  organizationId: string;
  projectId: string | null;
  sourceId: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

interface ListLogEntriesParams {
  organizationId: string;
  sourceId?: string;
  offset: number;
  limit: number;
}

export interface PaginatedLogEntries {
  items: LogEntry[];
  total: number;
}

export class LogEntryRepository {
  private repo: Repository<LogEntry>;

  constructor() {
    this.repo = AppDataSource.getRepository(LogEntry);
  }

  async createForOrganization(payload: CreateLogEntryPayload): Promise<LogEntry> {
    const entry = this.repo.create({
      organizationId: payload.organizationId,
      projectId: payload.projectId,
      sourceId: payload.sourceId,
      timestamp: payload.timestamp,
      level: payload.level,
      message: payload.message,
      context: payload.context,
      metadata: payload.metadata,
    });

    return this.repo.save(entry);
  }

  async listByOrganization(params: ListLogEntriesParams): Promise<PaginatedLogEntries> {
    const qb = this.repo.createQueryBuilder('log').where('log.organization_id = :organizationId', {
      organizationId: params.organizationId,
    });

    if (params.sourceId) {
      qb.andWhere('log.source_id = :sourceId', { sourceId: params.sourceId });
    }

    qb.orderBy('log.timestamp', 'DESC').offset(params.offset).limit(params.limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }
}

export const logEntryRepository = new LogEntryRepository();
