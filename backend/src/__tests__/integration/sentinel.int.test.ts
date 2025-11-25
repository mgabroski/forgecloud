/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

// Local copies of types just for test clarity
interface SentinelSource {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  type: 'service' | 'audit' | 'job' | 'other';
  status: 'active' | 'inactive';
  description: string | null;
  environment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SentinelLogEntry {
  id: string;
  organizationId: string;
  projectId: string | null;
  sourceId: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

const makeEmail = (label: string) =>
  `sentinel-int-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

describe('Sentinel API (integration)', () => {
  let accessToken: string;

  beforeAll(async () => {
    const email = makeEmail('owner');
    const password = 'Test1234!';
    const fullName = 'Sentinel Owner';

    // 1) Register user
    await request(app).post('/users').send({ email, password, fullName }).expect(201);

    // 2) Login to get JWT
    const loginRes = await request(app).post('/auth/login').send({ email, password }).expect(200);
    accessToken = loginRes.body.data.accessToken;
    expect(accessToken).toBeDefined();

    // 3) Create organization for this user (they become OWNER)
    const slug = `sentinel-org-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await request(app)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Sentinel Org', slug })
      .expect(201);
    // OrganizationService will ensure activeOrganizationId is set on user
  });

  it('GET /sentinel/sources + POST /sentinel/logs + GET /sentinel/logs', async () => {
    // Initially: whatever sources exist (can be 0 or more, so just ensure array shape)
    const sourcesEmptyRes = await request(app)
      .get('/sentinel/sources')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const initialPayload = sourcesEmptyRes.body.data as { sources: SentinelSource[] };
    expect(Array.isArray(initialPayload.sources)).toBe(true);

    // Create a source
    const createSourceRes = await request(app)
      .post('/sentinel/sources')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'test-service',
        type: 'service',
        description: 'Test service for sentinel integration',
        environment: 'test',
        status: 'active',
      })
      .expect(201);

    const createdSource = createSourceRes.body.data as SentinelSource;
    expect(createdSource.id).toBeDefined();
    expect(createdSource.name).toBe('test-service');
    expect(createdSource.type).toBe('service');

    // Ingest a log for that source
    const logMessage = 'Integration test log entry';

    const ingestRes = await request(app)
      .post('/sentinel/logs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sourceId: createdSource.id,
        level: 'info',
        message: logMessage,
        context: { foo: 'bar' },
        metadata: { testCase: 'sentinel-int' },
      })
      .expect(201);

    const createdLog = ingestRes.body.data as SentinelLogEntry;
    expect(createdLog.id).toBeDefined();
    expect(createdLog.sourceId).toBe(createdSource.id);
    expect(createdLog.message).toBe(logMessage);

    // Fetch sources again → should include the created source
    const sourcesRes = await request(app)
      .get('/sentinel/sources')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const sourcesPayload = sourcesRes.body.data as { sources: SentinelSource[] };
    const foundSource = sourcesPayload.sources.find((s) => s.id === createdSource.id);
    expect(foundSource).toBeDefined();

    // Fetch logs → should include our ingested log
    const logsRes = await request(app)
      .get('/sentinel/logs?offset=0&limit=50')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const logsPayload = logsRes.body.data as {
      logs: SentinelLogEntry[];
      total: number;
      offset: number;
      limit: number;
    };

    expect(Array.isArray(logsPayload.logs)).toBe(true);
    expect(logsPayload.total).toBeGreaterThanOrEqual(1);

    const foundLog = logsPayload.logs.find((l) => l.id === createdLog.id);
    expect(foundLog).toBeDefined();
    expect(foundLog?.message).toBe(logMessage);
  });

  it('rejects access without auth token', async () => {
    await request(app).get('/sentinel/sources').expect(401);
    await request(app).get('/sentinel/logs').expect(401);
    await request(app).post('/sentinel/logs').send({}).expect(401);
  });
});
