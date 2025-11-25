/* eslint-disable @typescript-eslint/unbound-method */
import { SentinelService } from '../../modules/sentinel/sentinel.service';
import { LogSourceStatus, LogSourceType } from '../../modules/sentinel/log-source.entity';
import { LogLevel } from '../../modules/sentinel/log-entry.entity';

// ---- Mocks ----

jest.mock('../../modules/sentinel/log-source.repository', () => ({
  logSourceRepository: {
    findByOrganization: jest.fn(),
    findByIdAndOrganization: jest.fn(),
    findByOrganizationAndName: jest.fn(),
    createForOrganization: jest.fn(),
  },
}));

jest.mock('../../modules/sentinel/log-entry.repository', () => ({
  logEntryRepository: {
    createForOrganization: jest.fn(),
    listByOrganization: jest.fn(),
  },
}));

jest.mock('../../modules/users/user.repository', () => ({
  userRepository: {
    findById: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../../modules/organizations/organization.service', () => ({
  organizationService: {
    getOrganizationsForUser: jest.fn(),
  },
}));

import { logSourceRepository } from '../../modules/sentinel/log-source.repository';
import { logEntryRepository } from '../../modules/sentinel/log-entry.repository';
import { userRepository } from '../../modules/users/user.repository';
import { organizationService } from '../../modules/organizations/organization.service';
import type { LogSource } from '../../modules/sentinel/log-source.entity';
import type { LogEntry } from '../../modules/sentinel/log-entry.entity';
import { ValidationError } from '../../common/errors/validation-error';
import { AuthError } from '../../common/errors/auth-error';

describe('SentinelService (unit)', () => {
  const sentinelService = new SentinelService();

  const mockUserId = 'user-1';
  const mockOrgId = 'org-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockUserWithActiveOrg() {
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: mockUserId,
      email: 'test@example.com',
      activeOrganizationId: mockOrgId,
    });
  }

  function mockUserWithoutActiveOrgButWithMembership() {
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: mockUserId,
      email: 'test@example.com',
      activeOrganizationId: null,
    });

    (organizationService.getOrganizationsForUser as jest.Mock).mockResolvedValue([
      { id: mockOrgId, name: 'Acme', slug: 'acme', role: 'OWNER' },
    ]);
  }

  // ---------- getSourcesForUser ----------

  it('getSourcesForUser: uses active org from user and returns sources', async () => {
    mockUserWithActiveOrg();

    const mockSources: LogSource[] = [
      {
        id: 'src-1',
        organizationId: mockOrgId,
        projectId: null,
        name: 'forgecloud-backend',
        type: LogSourceType.SERVICE,
        status: LogSourceStatus.ACTIVE,
        description: null,
        environment: 'internal',
        ingestKey: null,
        logEntries: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: undefined as unknown as LogSource['organization'],
        project: null,
      },
    ];

    (logSourceRepository.findByOrganization as jest.Mock).mockResolvedValue(mockSources);

    const result = await sentinelService.getSourcesForUser(mockUserId);

    expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
    expect(logSourceRepository.findByOrganization).toHaveBeenCalledWith(mockOrgId);
    expect(result).toEqual(mockSources);
  });

  // ---------- createSourceForUser ----------

  it('createSourceForUser: sets org via membership if activeOrganizationId is null', async () => {
    mockUserWithoutActiveOrgButWithMembership();

    const createdSource: LogSource = {
      id: 'src-2',
      organizationId: mockOrgId,
      projectId: null,
      name: 'demo-payment-service',
      type: LogSourceType.SERVICE,
      status: LogSourceStatus.ACTIVE,
      description: 'Demo external service',
      environment: 'demo',
      ingestKey: null,
      logEntries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: undefined as unknown as LogSource['organization'],
      project: null,
    };

    (logSourceRepository.createForOrganization as jest.Mock).mockResolvedValue(createdSource);

    const created = await sentinelService.createSourceForUser(mockUserId, {
      name: 'demo-payment-service',
      type: LogSourceType.SERVICE,
      description: 'Demo external service',
      environment: 'demo',
    });

    expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
    expect(organizationService.getOrganizationsForUser).toHaveBeenCalledWith(mockUserId);
    expect(userRepository.save).toHaveBeenCalled(); // activeOrganizationId set

    expect(logSourceRepository.createForOrganization).toHaveBeenCalledWith(mockOrgId, {
      name: 'demo-payment-service',
      type: LogSourceType.SERVICE,
      description: 'Demo external service',
      environment: 'demo',
      status: LogSourceStatus.ACTIVE,
      projectId: null,
    });

    expect(created.name).toBe('demo-payment-service');
  });

  it('createSourceForUser: throws ValidationError when name is empty', async () => {
    mockUserWithActiveOrg();

    await expect(
      sentinelService.createSourceForUser(mockUserId, {
        name: '   ',
        type: LogSourceType.SERVICE,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  // ---------- ingestLogForUser ----------

  it('ingestLogForUser: creates log entry when data is valid', async () => {
    mockUserWithActiveOrg();

    (logSourceRepository.findByIdAndOrganization as jest.Mock).mockResolvedValue({
      id: 'src-1',
      organizationId: mockOrgId,
      projectId: null,
    });

    const createdLog: Partial<LogEntry> = {
      id: 'log-1',
      organizationId: mockOrgId,
      projectId: null,
      sourceId: 'src-1',
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: 'Payment SUCCESS for $42.00',
      context: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (logEntryRepository.createForOrganization as jest.Mock).mockResolvedValue(createdLog);

    const result = await sentinelService.ingestLogForUser(mockUserId, {
      sourceId: 'src-1',
      level: LogLevel.INFO,
      message: 'Payment SUCCESS for $42.00',
      timestamp: '2025-11-25T10:00:00.000Z',
    });

    expect(logSourceRepository.findByIdAndOrganization).toHaveBeenCalledWith('src-1', mockOrgId);
    expect(logEntryRepository.createForOrganization).toHaveBeenCalled();
    expect(result).toEqual(createdLog);
  });

  it('ingestLogForUser: throws ValidationError for invalid timestamp', async () => {
    mockUserWithActiveOrg();

    (logSourceRepository.findByIdAndOrganization as jest.Mock).mockResolvedValue({
      id: 'src-1',
      organizationId: mockOrgId,
      projectId: null,
    });

    await expect(
      sentinelService.ingestLogForUser(mockUserId, {
        sourceId: 'src-1',
        level: LogLevel.INFO,
        message: 'Hello',
        timestamp: 'not-a-date',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('ingestLogForUser: throws ValidationError when source does not belong to org', async () => {
    mockUserWithActiveOrg();

    (logSourceRepository.findByIdAndOrganization as jest.Mock).mockResolvedValue(null);

    await expect(
      sentinelService.ingestLogForUser(mockUserId, {
        sourceId: 'src-999',
        level: LogLevel.INFO,
        message: 'Hello',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  // ---------- getLogsForUser ----------

  it('getLogsForUser: validates source and returns paginated logs', async () => {
    mockUserWithActiveOrg();

    (logSourceRepository.findByIdAndOrganization as jest.Mock).mockResolvedValue({
      id: 'src-1',
      organizationId: mockOrgId,
      projectId: null,
    });

    (logEntryRepository.listByOrganization as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    const res = await sentinelService.getLogsForUser(mockUserId, {
      sourceId: 'src-1',
      offset: 0,
      limit: 50,
    });

    expect(logSourceRepository.findByIdAndOrganization).toHaveBeenCalledWith('src-1', mockOrgId);
    expect(logEntryRepository.listByOrganization).toHaveBeenCalledWith({
      organizationId: mockOrgId,
      sourceId: 'src-1',
      offset: 0,
      limit: 50,
    });

    expect(res).toEqual({ items: [], total: 0 });
  });

  // ---------- getActiveOrganizationIdForUser error cases (via public methods) ----------

  it('throws AuthError when user is not found', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(sentinelService.getSourcesForUser('missing-user')).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it('throws ValidationError when user has no org memberships', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: mockUserId,
      email: 'test@example.com',
      activeOrganizationId: null,
    });

    (organizationService.getOrganizationsForUser as jest.Mock).mockResolvedValue([]);

    await expect(sentinelService.getSourcesForUser(mockUserId)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
