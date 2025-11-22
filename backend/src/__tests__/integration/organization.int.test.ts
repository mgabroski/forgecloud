/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';
import { Organization } from '../../modules/organizations/organization.entity';

const app = createApp();

describe('Organizations API (integration)', () => {
  let accessToken: string;

  const makeEmail = (label: string) =>
    `org-int-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

  beforeAll(async () => {
    const email = makeEmail('owner');
    const password = 'Test1234!';
    const fullName = 'Org Owner';

    // 1) Register a user
    await request(app).post('/users').send({ email, password, fullName }).expect(201);

    // 2) Login to get JWT
    const loginRes = await request(app).post('/auth/login').send({ email, password }).expect(200);

    accessToken = loginRes.body.data.accessToken;
    expect(accessToken).toBeDefined();
  });

  it('POST /organizations should create new organization and owner membership', async () => {
    const slug = `acme-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const dto = {
      name: 'Acme Corp',
      slug,
    };

    const res = await request(app)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(201);

    expect(res.body).toHaveProperty('data');
    const org = res.body.data;

    expect(org).toBeDefined();
    expect(org.name).toBe(dto.name);
    expect(org.slug).toBe(dto.slug);
    expect(org.ownerUserId).toBeDefined();
  });

  it('GET /organizations should include at least one organization', async () => {
    const res = await request(app)
      .get('/organizations')
      // GET /organizations is currently public
      .expect(200);

    expect(res.body).toHaveProperty('data');
    const list = res.body.data as Organization[];

    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);

    // Ensure we have at least one acme-* org from previous test
    const hasAcme = list.some(
      (org) => typeof org.slug === 'string' && org.slug.startsWith('acme-'),
    );
    expect(hasAcme).toBe(true);
  });

  it('GET /organizations/my should return only organizations where the user has membership', async () => {
    const res = await request(app)
      .get('/organizations/my')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    const payload = res.body.data as { organizations: Organization[] };

    expect(Array.isArray(payload.organizations)).toBe(true);
    expect(payload.organizations.length).toBeGreaterThanOrEqual(1);

    // At least one org should be an acme-* org we created above
    const hasAcmeMembership = payload.organizations.some(
      (org) => typeof org.slug === 'string' && org.slug.startsWith('acme-'),
    );
    expect(hasAcmeMembership).toBe(true);
  });
});
