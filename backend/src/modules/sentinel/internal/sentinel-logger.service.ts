import { logSourceRepository } from '../log-source.repository';
import { logEntryRepository } from '../log-entry.repository';
import { LogSourceStatus, LogSourceType, type LogSource } from '../log-source.entity';
import { LogLevel } from '../log-entry.entity';
import { userRepository } from '../../users/user.repository';
import { organizationService } from '../../organizations/organization.service';
import { ValidationError } from '../../../common/errors/validation-error';
import { AuthError } from '../../../common/errors/auth-error';

export interface BackendRequestLogInput {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userAgent: string;
  ip: string;
}

export interface AuditEventInput {
  event: string;
  message: string;
  context?: Record<string, unknown>;
  level?: LogLevel;
}

export class SentinelInternalLogger {
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

  async logBackendRequestForUser(userId: string, data: BackendRequestLogInput): Promise<void> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);

    const source = await this.getOrCreateInternalSource(
      organizationId,
      'forgecloud-backend',
      LogSourceType.SERVICE,
      'ForgeCloud backend API request logs',
      'internal',
    );

    await logEntryRepository.createForOrganization({
      organizationId,
      projectId: source.projectId,
      sourceId: source.id,
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: `${data.method} ${data.path} -> ${data.statusCode} (${data.durationMs.toFixed(1)}ms)`,
      context: {
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        durationMs: data.durationMs,
        userAgent: data.userAgent,
        ip: data.ip,
      },
      metadata: null,
    });
  }

  async logAuditEventForUser(userId: string, input: AuditEventInput): Promise<void> {
    const organizationId = await this.getActiveOrganizationIdForUser(userId);

    const source = await this.getOrCreateInternalSource(
      organizationId,
      'forgecloud-audit',
      LogSourceType.AUDIT,
      'ForgeCloud security and audit events',
      'internal',
    );

    await logEntryRepository.createForOrganization({
      organizationId,
      projectId: source.projectId,
      sourceId: source.id,
      timestamp: new Date(),
      level: input.level ?? LogLevel.INFO,
      message: input.message,
      context: {
        event: input.event,
        ...(input.context ?? {}),
      },
      metadata: null,
    });
  }

  private async getOrCreateInternalSource(
    organizationId: string,
    name: string,
    type: LogSourceType,
    description: string,
    environment: string,
  ): Promise<LogSource> {
    const existing = await logSourceRepository.findByOrganizationAndName(organizationId, name);
    if (existing) {
      return existing;
    }

    return logSourceRepository.createForOrganization(organizationId, {
      name,
      type,
      description,
      environment,
      status: LogSourceStatus.ACTIVE,
      projectId: null,
    });
  }
}

export const sentinelInternalLogger = new SentinelInternalLogger();
