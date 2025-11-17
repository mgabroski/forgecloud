/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('API integration: users & auth', () => {
  //
  // Helper to generate unique emails per test run
  //
  const makeEmail = (label: string) =>
    `int-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

  describe('POST /users (registration)', () => {
    it('should create a new user and return 201', async () => {
      const email = makeEmail('register-201');

      const res = await request(app).post('/users').send({
        email,
        password: 'secret123',
        fullName: 'Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(email);
      expect(res.body.error).toBeNull();
    });

    it('should return 409 when email is already taken', async () => {
      const email = makeEmail('register-409');

      // first create the user
      await request(app).post('/users').send({
        email,
        password: 'secret123',
        fullName: 'Test User',
      });

      const res = await request(app).post('/users').send({
        email,
        password: 'secret123',
        fullName: 'Another User',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      // code comes from ConflictError('EMAIL_TAKEN')
      expect(res.body.error.code).toBe('EMAIL_TAKEN');
    });
  });

  describe('POST /auth/login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      const email = makeEmail('login-200');

      // register user first
      await request(app).post('/users').send({
        email,
        password: 'secret123',
        fullName: 'Login User',
      });

      const res = await request(app).post('/auth/login').send({
        email,
        password: 'secret123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.error).toBeNull();
    });

    it('should return 401 on invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: makeEmail('login-401'),
          password: 'wrong-password', // long enough to pass validation
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      // from AuthError('INVALID_CREDENTIALS')
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /users (protected route)', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return list of users when valid token is provided', async () => {
      const email = makeEmail('get-users');

      // 1) register user
      await request(app).post('/users').send({
        email,
        password: 'secret123',
        fullName: 'Protected User',
      });

      // 2) login to get token
      const loginRes = await request(app).post('/auth/login').send({
        email,
        password: 'secret123',
      });

      const token = loginRes.body.data.accessToken as string;
      expect(token).toBeDefined();

      // 3) call GET /users with Authorization header
      const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const users = res.body.data as any[];
      const hasOurUser = users.some((u) => u.email === email);
      expect(hasOurUser).toBe(true);
    });
  });
});
