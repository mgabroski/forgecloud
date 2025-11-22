/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('Auth /auth/me & /auth/active-organization (integration)', () => {
  const makeEmail = (label: string) =>
    `int-me-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

  let accessToken: string;
  let userEmail: string;
  let orgTwoId: string;

  it('should reject GET /auth/me when no token is provided', async () => {
    const res = await request(app).get('/auth/me');

    expect([401, 403]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });

  describe('with authenticated user and organizations', () => {
    beforeAll(async () => {
      userEmail = makeEmail('user');
      const password = 'Test1234!';
      const fullName = 'Session User';

      // 1) Register user
      await request(app).post('/users').send({ email: userEmail, password, fullName }).expect(201);

      // 2) Login to get JWT
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: userEmail, password })
        .expect(200);

      accessToken = loginRes.body.data.accessToken;
      expect(accessToken).toBeDefined();

      // 3) Create two organizations as this user (auto owner membership)
      const slugOne = `org-one-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      await request(app)
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Org One',
          slug: slugOne,
        })
        .expect(201);

      const slugTwo = `org-two-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const orgResTwo = await request(app)
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Org Two',
          slug: slugTwo,
        })
        .expect(201);

      orgTwoId = orgResTwo.body.data.id;
    });

    it('GET /auth/me should return session with user, organizations and activeOrganizationId', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');

      const data = res.body.data;

      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(userEmail);

      expect(Array.isArray(data.organizations)).toBe(true);
      expect(data.organizations.length).toBeGreaterThanOrEqual(2);

      // activeOrganizationId may be null initially or already set,
      // but must be either null or a string
      if (data.activeOrganizationId !== null) {
        expect(typeof data.activeOrganizationId).toBe('string');
      }
    });

    it('PATCH /auth/active-organization should set active organization and return updated session', async () => {
      const res = await request(app)
        .patch('/auth/active-organization')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ organizationId: orgTwoId })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');

      const data = res.body.data;

      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(userEmail);

      expect(Array.isArray(data.organizations)).toBe(true);
      expect(data.organizations.length).toBeGreaterThanOrEqual(2);
      expect(data.activeOrganizationId).toBe(orgTwoId);
    });

    it('PATCH /auth/active-organization should reject when user is not a member of the organization', async () => {
      const otherEmail = makeEmail('other');
      const password = 'Other1234!';
      const fullName = 'Other Owner';

      await request(app).post('/users').send({ email: otherEmail, password, fullName }).expect(201);

      const otherLoginRes = await request(app)
        .post('/auth/login')
        .send({ email: otherEmail, password })
        .expect(200);

      const otherToken: string = otherLoginRes.body.data.accessToken;

      const slugOther = `org-other-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const otherOrgRes = await request(app)
        .post('/organizations')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Other Org',
          slug: slugOther,
        })
        .expect(201);

      const otherOrgId: string = otherOrgRes.body.data.id;

      const res = await request(app)
        .patch('/auth/active-organization')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ organizationId: otherOrgId });

      // Backend currently returns 401 here; 403 would also be acceptable in future.
      expect([401, 403]).toContain(res.status);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
});
