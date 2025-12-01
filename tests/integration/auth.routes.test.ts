process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { registerUser } from '../../src/controllers/auth.controller';
import * as emailService from '../../src/services/emailService';
import jwt from 'jsonwebtoken';

vi.mock('../../src/services/emailService');

describe('Auth routes integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /register validates input', async () => {
    const res = await request(app).post('/register').send({});
    expect(res.status).toBe(400);
  });

  it('POST /register registers user and sends token', async () => {
    (emailService.sendWelcomeEmail as any).mockResolvedValueOnce(undefined);
    const jwtSpy = vi.spyOn(jwt, 'sign').mockReturnValueOnce('token123' as any);

    const res = await request(app)
      .post('/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(jwtSpy).toHaveBeenCalled();
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });
});


