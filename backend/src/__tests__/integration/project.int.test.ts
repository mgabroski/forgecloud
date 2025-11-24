/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';
import type { Project } from '../../modules/projects/project.entity';

const app = createApp();

describe('Projects API (integration)', () => {
  let accessToken: string;
  let orgAId: string;
  let orgBId: string;

  const makeEmail = (label: string) =>
    `proj-int-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

  beforeAll(async () => {
    const email = makeEmail('owner');
    const password = 'Test1234!';
    const fullName = 'Project Owner';

    // 1) Register user
    await request(app).post('/users').send({ email, password, fullName }).expect(201);

    // 2) Login to get JWT
    const loginRes = await request(app).post('/auth/login').send({ email, password }).expect(200);
    accessToken = loginRes.body.data.accessToken;
    expect(accessToken).toBeDefined();

    // 3) Create two organizations as this user (they become OWNER)
    const slugA = `org-a-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const slugB = `org-b-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const orgARes = await request(app)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Org A', slug: slugA })
      .expect(201);
    orgAId = orgARes.body.data.id;

    const orgBRes = await request(app)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Org B', slug: slugB })
      .expect(201);
    orgBId = orgBRes.body.data.id;

    expect(orgAId).toBeDefined();
    expect(orgBId).toBeDefined();
  });

  it('GET /projects should require authentication', async () => {
    await request(app).get('/projects').expect(401);
  });

  it('GET /projects should return only projects for active organization A', async () => {
    // Set active organization → Org A
    await request(app)
      .patch('/auth/active-organization')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ organizationId: orgAId })
      .expect(200);

    // Create two projects under Org A
    const res1 = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Core Platform', key: 'CORE', description: 'Core platform project' })
      .expect(201);
    const projA1 = res1.body.data as Project;
    expect(projA1.organizationId).toBe(orgAId);

    const res2 = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Second Project', key: 'SP', description: 'Second project' })
      .expect(201);
    const projA2 = res2.body.data as Project;
    expect(projA2.organizationId).toBe(orgAId);

    // Fetch projects for active org (A)
    const listRes = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const payload = listRes.body.data as { projects: Project[] };
    expect(Array.isArray(payload.projects)).toBe(true);
    expect(payload.projects.length).toBeGreaterThanOrEqual(2);

    // All projects must belong to Org A
    const allOrgIds = payload.projects.map((p) => p.organizationId);
    const uniqueOrgIds = Array.from(new Set(allOrgIds));
    expect(uniqueOrgIds).toEqual([orgAId]);
  });

  it('GET /projects should return only projects for active organization B', async () => {
    // Switch active organization → Org B
    await request(app)
      .patch('/auth/active-organization')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ organizationId: orgBId })
      .expect(200);

    // Create one project under Org B
    const resB1 = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Billing Service', key: 'BILL', description: 'Billing project' })
      .expect(201);
    const projB1 = resB1.body.data as Project;
    expect(projB1.organizationId).toBe(orgBId);

    // Fetch projects for active org (B)
    const listRes = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const payload = listRes.body.data as { projects: Project[] };
    expect(Array.isArray(payload.projects)).toBe(true);
    expect(payload.projects.length).toBeGreaterThanOrEqual(1);

    const allOrgIds = payload.projects.map((p) => p.organizationId);
    const uniqueOrgIds = Array.from(new Set(allOrgIds));
    expect(uniqueOrgIds).toEqual([orgBId]);
  });

  it('POST /projects should enforce unique key within an organization but allow same key in another org', async () => {
    // Active org is still B from previous test
    // Create project "CORE" in Org B
    await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Core Service B', key: 'CORE' })
      .expect(201);

    // Try to create another "CORE" in Org B → should fail
    const dupRes = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Duplicate Core B', key: 'CORE' })
      .expect(400);

    expect(dupRes.body).toHaveProperty('error');
    // error.details.key exists but we don't assert exact wording to keep it flexible

    // Switch back to Org A
    await request(app)
      .patch('/auth/active-organization')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ organizationId: orgAId })
      .expect(200);

    // Create "CORE2" in Org A → allowed (unique per org)
    const resCoreA = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Core Service A', key: 'CORE2' })
      .expect(201);

    const projCoreA = resCoreA.body.data as Project;
    expect(projCoreA.organizationId).toBe(orgAId);
    expect(projCoreA.key).toBe('CORE2');
  });
});
