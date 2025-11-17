/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('Auth /auth/me endpoints (integration)', () => {
  it('should reject GET /auth/me when no token is provided', async () => {
    const res = await request(app).get('/auth/me');

    // Depending on error handler, this may be 401 or 403
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });
});
