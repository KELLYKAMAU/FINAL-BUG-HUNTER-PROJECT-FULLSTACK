// Minimal smoke test: ensure server responds on root route
// Set NODE_ENV to 'test' before importing the app so the real server doesn't listen
process.env.NODE_ENV = 'test';

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';

describe('Server smoke test', () => {
  it('responds on root route', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('express server is up and running');
  });
});
