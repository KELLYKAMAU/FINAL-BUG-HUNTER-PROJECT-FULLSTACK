// Simple performance-oriented tests to catch major regressions in response time.
// These are NOT full load tests, just sanity checks around key endpoints.

process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { BugsService } from '../../src/services/bugs.services';
import * as projectService from '../../src/services/project.service';
import * as commentService from '../../src/services/comments.service';

// Allow plenty of time so these don't become flaky on slow machines.
const MAX_DURATION_MS = 1500;

describe('API performance sanity checks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET / responds quickly', async () => {
    const start = Date.now();
    const res = await request(app).get('/');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it('GET /allbugs responds within acceptable time (with service mocked)', async () => {
    vi.spyOn(BugsService.prototype, 'getAllBugs').mockResolvedValueOnce([]);

    const start = Date.now();
    const res = await request(app).get('/allbugs');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it('GET /projects responds within acceptable time (with service mocked)', async () => {
    vi.spyOn(projectService, 'listProjects').mockResolvedValueOnce([]);

    const start = Date.now();
    const res = await request(app).get('/projects');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it('GET /comments responds within acceptable time (with service mocked)', async () => {
    vi.spyOn(commentService, 'getAllComments').mockResolvedValueOnce([]);

    const start = Date.now();
    const res = await request(app).get('/comments');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });
});


