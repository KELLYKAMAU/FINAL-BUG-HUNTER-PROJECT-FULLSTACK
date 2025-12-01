process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { BugsService } from '../../src/services/bugs.services';
import type { Bug } from '../../src/Types/bugs.types';

describe('Bugs routes integration', () => {
  const baseBug: Bug = {
    project_id: 1,
    reported_by: 1,
    title: 'Bug title',
    severity: 'low',
    status: 'open',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /allbugs returns list of bugs', async () => {
    const bugs: Bug[] = [{ ...baseBug, bugid: 1 }];
    vi.spyOn(BugsService.prototype, 'getAllBugs').mockResolvedValueOnce(bugs);

    const res = await request(app).get('/allbugs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(bugs);
  });

  it('POST /createbug creates a bug', async () => {
    const payload = baseBug;
    vi.spyOn(BugsService.prototype, 'createBug').mockResolvedValueOnce([{ bugid: 1 }] as any);

    const res = await request(app).post('/createbug').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Bug created successfully');
  });

  it('GET /bugs/:id returns a single bug', async () => {
    const bug: Bug = { ...baseBug, bugid: 2 };
    vi.spyOn(BugsService.prototype, 'getBug').mockResolvedValueOnce(bug);

    const res = await request(app).get('/bugs/2');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(bug);
  });
});


