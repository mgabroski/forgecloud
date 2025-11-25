import { logSourceRepository } from './log-source.repository';
import { logEntryRepository, type PaginatedLogEntries } from './log-entry.repository';
import type { LogSource } from './log-source.entity';
import { LogSourceStatus, LogSourceType } from './log-source.entity';
import type { LogEntry } from './log-entry.entity';
import { LogLevel } from './log-entry.entity';
import { ValidationError } from '../../common/errors/validation-error';
import { AuthError } from '../../common/errors/auth-error';
import { userRepository } from '../users/user.repository';
import { organizationService } from '../organizations/organization.service';

export interface CreateLogSourceInput {
  name: string;
  type: LogSourceType;
  projectId?: string;
  description?: string;
  environment?: string;
  status?: LogSourceStatus;
}

export interface IngestLogEntryInput {
  sourceId: string;
  projectId?: string;
  timestamp?: string | Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ListLogsInput {
  sourceId?: string;
  offset?: number;
  limit?: number;
}

export class SentinelService {
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

  async getSourcesForUser(userId: string): Promise<LogSource[]> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);
    return logSourceRepository.findByOrganization(organizationId);
  }

  async createSourceForUser(userId: string, input: CreateLogSourceInput): Promise<LogSource> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);

    if (!input.name || !input.name.trim()) {
      throw new ValidationError({
        name: 'Source name is required',
      });
    }

    if (!input.type) {
      throw new ValidationError({
        type: 'Source type is required',
      });
    }

    const status = input.status ?? LogSourceStatus.ACTIVE;

    return logSourceRepository.createForOrganization(organizationId, {
      name: input.name.trim(),
      type: input.type,
      description: input.description ?? null,
      environment: input.environment ?? null,
      status,
      projectId: input.projectId ?? null,
    });
  }

  async ingestLogForUser(userId: string, input: IngestLogEntryInput): Promise<LogEntry> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);

    if (!input.sourceId) {
      throw new ValidationError({
        sourceId: 'sourceId is required',
      });
    }

    if (!input.level) {
      throw new ValidationError({
        level: 'level is required',
      });
    }

    if (!input.message || !input.message.trim()) {
      throw new ValidationError({
        message: 'message is required',
      });
    }

    const source = await logSourceRepository.findByIdAndOrganization(
      input.sourceId,
      organizationId,
    );

    if (!source) {
      throw new ValidationError({
        sourceId: 'Invalid sourceId for active organization',
      });
    }

    const timestamp = this.normalizeTimestamp(input.timestamp);

    return logEntryRepository.createForOrganization({
      organizationId,
      projectId: input.projectId ?? source.projectId ?? null,
      sourceId: input.sourceId,
      timestamp,
      level: input.level,
      message: input.message.trim(),
      context: input.context ?? null,
      metadata: input.metadata ?? null,
    });
  }

  async getLogsForUser(userId: string, input: ListLogsInput): Promise<PaginatedLogEntries> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);

    const offset = input.offset ?? 0;
    const limit = input.limit ?? 50;

    if (input.sourceId) {
      const source = await logSourceRepository.findByIdAndOrganization(
        input.sourceId,
        organizationId,
      );
      if (!source) {
        throw new ValidationError({
          sourceId: 'Invalid sourceId for active organization',
        });
      }
    }

    return logEntryRepository.listByOrganization({
      organizationId,
      sourceId: input.sourceId,
      offset,
      limit,
    });
  }

  private normalizeTimestamp(value?: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new ValidationError({
          timestamp: 'Invalid timestamp format',
        });
      }
      return parsed;
    }

    return new Date();
  }
}

export const sentinelService = new SentinelService();
