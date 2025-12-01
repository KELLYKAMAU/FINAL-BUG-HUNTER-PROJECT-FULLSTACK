process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import * as projectService from '../../src/services/project.service';
import type { Project } from '../../src/Types/projects.types';

describe('Projects routes integration', () => {
  const baseProject: Project = {
    projectid: 1,
    title: 'Project 1',
    description: 'Test project',
    created_by: 10,
    created_at: new Date(),
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /projects returns list of projects', async () => {
    vi.spyOn(projectService, 'listProjects').mockResolvedValueOnce([baseProject]);

    const res = await request(app).get('/projects');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ projectid: 1 })]);
  });

  it('GET /projects/:id returns project', async () => {
    vi.spyOn(projectService, 'getProject').mockResolvedValueOnce(baseProject);

    const res = await request(app).get('/projects/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ projectid: 1 }));
  });

  it('POST /projects creates project (auth middleware skipped via mocking)', async () => {
    // simulate auth middleware attaching user
    const authUser = { userid: 10, role: 'admin' };
    vi.spyOn(projectService, 'createNewProject').mockImplementationOnce(async (proj: any) => ({
      message: 'Project created successfully with team members',
      project: { ...baseProject, ...proj },
    }));

    const res = await request(app)
      .post('/projects')
      .set('x-test-userid', String(authUser.userid)) // no real effect; just documenting intent
      .send({ title: 'New project' });

    // In real app adminOnly middleware would enforce roles; here we just check controller wiring
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });
});


