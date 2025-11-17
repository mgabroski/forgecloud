/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../modules/users/user.entity';

const app = createApp();

describe('API integration: users & auth', () => {
  beforeEach(async () => {
    // ensure we start from a clean state for each test
    const userRepo = AppDataSource.getRepository(User);

    // Use DELETE ... WHERE 1=1 instead of TRUNCATE (clear())
    await userRepo.createQueryBuilder().delete().from(User).where('1 = 1').execute();
  });

  describe('POST /users (registration)', () => {
    it('should create a new user and return 201', async () => {
      const res = await request(app).post('/users').send({
        email: 'test@example.com',
        password: 'secret123',
        fullName: 'Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.error).toBeNull();

      // check it is actually stored in DB
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email: 'test@example.com' } });
      expect(user).not.toBeNull();
    });

    it('should return 409 when email is already taken', async () => {
      // first create the user
      await request(app).post('/users').send({
        email: 'test@example.com',
        password: 'secret123',
        fullName: 'Test User',
      });

      const res = await request(app).post('/users').send({
        email: 'test@example.com',
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
      // register user first
      await request(app).post('/users').send({
        email: 'login@example.com',
        password: 'secret123',
        fullName: 'Login User',
      });

      const res = await request(app).post('/auth/login').send({
        email: 'login@example.com',
        password: 'secret123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
      expect(res.body.error).toBeNull();
    });

    it('should return 401 on invalid credentials', async () => {
      // ensure DB is empty (no such user), but send a DTO-valid password
      const res = await request(app).post('/auth/login').send({
        email: 'unknown@example.com',
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
      // 1) register user
      await request(app).post('/users').send({
        email: 'protected@example.com',
        password: 'secret123',
        fullName: 'Protected User',
      });

      // 2) login to get token
      const loginRes = await request(app).post('/auth/login').send({
        email: 'protected@example.com',
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
    });
  });
});
