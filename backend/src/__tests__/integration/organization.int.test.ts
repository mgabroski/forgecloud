/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';
import { Organization } from '../../modules/organizations/organization.entity';

const app = createApp();

type UserOrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

describe('Organizations API (integration)', () => {
  let accessToken: string;
  let createdOrgId: string;

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
    const org = res.body.data as Organization;

    expect(org).toBeDefined();
    expect(org.name).toBe(dto.name);
    expect(org.slug).toBe(dto.slug);
    expect(org.ownerUserId).toBeDefined();

    createdOrgId = org.id;
    expect(createdOrgId).toBeDefined();
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

  it('GET /organizations/my should return 401 when unauthenticated', async () => {
    await request(app).get('/organizations/my').expect(401);
  });

  it('GET /organizations/my should return only organizations where the user has membership, including role', async () => {
    const res = await request(app)
      .get('/organizations/my')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    const payload = res.body.data as { organizations: UserOrganizationSummary[] };

    expect(Array.isArray(payload.organizations)).toBe(true);
    expect(payload.organizations.length).toBeGreaterThanOrEqual(1);

    // At least one org should be an acme-* org we created above
    const acmeOrg = payload.organizations.find(
      (org) => typeof org.slug === 'string' && org.slug.startsWith('acme-'),
    );
    expect(acmeOrg).toBeDefined();

    // Ensure role is present and that owner membership is correctly exposed
    expect(acmeOrg?.role).toBeDefined();
    expect(typeof acmeOrg?.role).toBe('string');
    expect(acmeOrg?.role).toBe('OWNER');
  });

  it('GET /organizations/:id should require authentication', async () => {
    await request(app).get(`/organizations/${createdOrgId}`).expect(401);
  });

  it('GET /organizations/:id should return single organization for authenticated member', async () => {
    const res = await request(app)
      .get(`/organizations/${createdOrgId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    const org = res.body.data as Organization;

    expect(org).toBeDefined();
    expect(org.id).toBe(createdOrgId);
    expect(org.name).toBeDefined();
    expect(typeof org.slug === 'string' || org.slug === null).toBe(true);
  });

  it('GET /organizations/:id/members should return members list for authenticated member', async () => {
    const res = await request(app)
      .get(`/organizations/${createdOrgId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    const payload = res.body.data as {
      members: { id: string; email: string; role: string; joinedAt: string }[];
    };

    expect(Array.isArray(payload.members)).toBe(true);
    expect(payload.members.length).toBeGreaterThanOrEqual(1);

    const owner = payload.members[0];
    expect(owner.id).toBeDefined();
    expect(owner.email).toBeDefined();
    expect(typeof owner.role).toBe('string');
    expect(owner.role).toBe('OWNER');
  });

  it('DELETE /organizations/:id should remove organization when requested by owner', async () => {
    // Create a dedicated org to delete
    const slug = `delete-me-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const dto = { name: 'To Be Deleted', slug };

    const createRes = await request(app)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(201);

    const orgToDelete = createRes.body.data as Organization;
    expect(orgToDelete.id).toBeDefined();

    await request(app)
      .delete(`/organizations/${orgToDelete.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // Optionally verify it no longer appears in /organizations/my
    const myRes = await request(app)
      .get('/organizations/my')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const payload = myRes.body.data as { organizations: UserOrganizationSummary[] };
    const stillThere = payload.organizations.some((org) => org.id === orgToDelete.id);
    expect(stillThere).toBe(false);
  });

  it('POST /organizations/:id/invite should require authentication', async () => {
    await request(app)
      .post(`/organizations/${createdOrgId}/invite`)
      .send({ email: 'invitee@example.com' })
      .expect(401);
  });

  it('POST /organizations/:id/invite should accept request from owner and return placeholder response', async () => {
    const res = await request(app)
      .post(`/organizations/${createdOrgId}/invite`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'invitee@example.com' })
      .expect(202);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data.message).toContain('Placeholder');
  });
});
