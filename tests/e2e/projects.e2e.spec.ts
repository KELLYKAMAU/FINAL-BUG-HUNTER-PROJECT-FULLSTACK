import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Projects E2E Tests', () => {
  let adminToken: string;
  let developerToken: string;
  let testerToken: string;
  let createdProjectId: number;

  test.beforeAll(async ({ request }) => {
    // Create admin user
    const adminEmail = `admin_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password: 'AdminPass123!',
        role_user: 'admin',
      },
    });

    const adminLogin = await request.post(`${BASE_URL}/login`, {
      data: { email: adminEmail, password: 'AdminPass123!' },
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.token;

    // Create developer user
    const devEmail = `dev_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Dev',
        last_name: 'User',
        email: devEmail,
        password: 'DevPass123!',
        role_user: 'developer',
      },
    });

    const devLogin = await request.post(`${BASE_URL}/login`, {
      data: { email: devEmail, password: 'DevPass123!' },
    });
    const devData = await devLogin.json();
    developerToken = devData.token;

    // Create tester user
    const testerEmail = `tester_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Tester',
        last_name: 'User',
        email: testerEmail,
        password: 'TesterPass123!',
        role_user: 'tester',
      },
    });

    const testerLogin = await request.post(`${BASE_URL}/login`, {
      data: { email: testerEmail, password: 'TesterPass123!' },
    });
    const testerData = await testerLogin.json();
    testerToken = testerData.token;
  });

  test('should list all projects', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const projects = await response.json();
    expect(Array.isArray(projects)).toBe(true);
  });

  test('should create a new project (admin only)', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'E2E Test Project',
        description: 'A project created during E2E testing',
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);
    const project = await response.json();
    expect(project).toHaveProperty('projectid');
    expect(project.title).toBe('E2E Test Project');
    createdProjectId = project.projectid;
  });

  test('should reject project creation by non-admin', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${developerToken}` },
      data: {
        title: 'Unauthorized Project',
        description: 'Should not be created',
        status: 'active',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should get project by ID', async ({ request }) => {
    // First create a project
    const createResponse = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Get Test Project',
        description: 'Project to retrieve',
        status: 'active',
      },
    });
    const project = await createResponse.json();

    // Then get it
    const response = await request.get(`${BASE_URL}/projects/${project.projectid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const retrievedProject = await response.json();
    expect(retrievedProject.projectid).toBe(project.projectid);
    expect(retrievedProject.title).toBe('Get Test Project');
  });

  test('should update project (admin or developer)', async ({ request }) => {
    // Create a project first
    const createResponse = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Update Test Project',
        description: 'Project to update',
        status: 'active',
      },
    });
    const project = await createResponse.json();

    // Update as developer
    const response = await request.put(`${BASE_URL}/projects/${project.projectid}`, {
      headers: { Authorization: `Bearer ${developerToken}` },
      data: {
        title: 'Updated Project Title',
        description: 'Updated description',
        status: 'on-hold',
      },
    });

    expect(response.status()).toBe(200);
    const updatedProject = await response.json();
    expect(updatedProject.title).toBe('Updated Project Title');
    expect(updatedProject.status).toBe('on-hold');
  });

  test('should reject project update by tester', async ({ request }) => {
    // Create a project first
    const createResponse = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Protected Project',
        description: 'Should not be updated by tester',
        status: 'active',
      },
    });
    const project = await createResponse.json();

    // Try to update as tester
    const response = await request.put(`${BASE_URL}/projects/${project.projectid}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        title: 'Unauthorized Update',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should delete project', async ({ request }) => {
    // Create a project to delete
    const createResponse = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Delete Test Project',
        description: 'Project to be deleted',
        status: 'active',
      },
    });
    const project = await createResponse.json();

    // Delete the project
    const deleteResponse = await request.delete(`${BASE_URL}/projects/${project.projectid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(deleteResponse.status()).toBe(200);

    // Verify project is deleted
    const getResponse = await request.get(`${BASE_URL}/projects/${project.projectid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getResponse.status()).toBe(404);
  });
});


