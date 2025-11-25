import { Repository } from 'typeorm';

import { AppDataSource } from '../../config/data-source';
import { LogSource, LogSourceStatus, LogSourceType } from './log-source.entity';

interface CreateLogSourcePayload {
  name: string;
  type: LogSourceType;
  description: string | null;
  environment: string | null;
  status: LogSourceStatus;
  projectId: string | null;
}

export class LogSourceRepository {
  private repo: Repository<LogSource>;

  constructor() {
    this.repo = AppDataSource.getRepository(LogSource);
  }

  async findByOrganization(organizationId: string): Promise<LogSource[]> {
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdAndOrganization(id: string, organizationId: string): Promise<LogSource | null> {
    return this.repo.findOne({
      where: { id, organizationId },
    });
  }

  async findByOrganizationAndName(organizationId: string, name: string): Promise<LogSource | null> {
    return this.repo.findOne({
      where: { organizationId, name },
    });
  }

  async createForOrganization(
    organizationId: string,
    payload: CreateLogSourcePayload,
  ): Promise<LogSource> {
    const source = this.repo.create({
      organizationId,
      projectId: payload.projectId,
      name: payload.name,
      type: payload.type,
      description: payload.description,
      environment: payload.environment,
      status: payload.status,
      ingestKey: null,
    });

    return this.repo.save(source);
  }
}

export const logSourceRepository = new LogSourceRepository();
