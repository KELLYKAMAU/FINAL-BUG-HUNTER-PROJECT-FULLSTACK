import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Bugs E2E Tests', () => {
  let adminToken: string;
  let developerToken: string;
  let testerToken: string;
  let projectId: number;
  let createdBugId: number;

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

    // Create a project for bugs
    const projectResponse = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Bug Test Project',
        description: 'Project for bug testing',
        status: 'active',
      },
    });
    const project = await projectResponse.json();
    projectId = project.projectid;
  });

  test('should create a bug', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'E2E Test Bug',
        description: 'A bug created during E2E testing',
        severity: 'high',
        status: 'open',
      },
    });

    expect(response.status()).toBe(201);
    const bug = await response.json();
    expect(bug).toHaveProperty('bugid');
    expect(bug.title).toBe('E2E Test Bug');
    createdBugId = bug.bugid;
  });

  test('should list all bugs', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/allbugs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const bugs = await response.json();
    expect(Array.isArray(bugs)).toBe(true);
  });

  test('should get bugs by project ID', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/getbugs/${projectId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const bugs = await response.json();
    expect(Array.isArray(bugs)).toBe(true);
  });

  test('should get bug by ID', async ({ request }) => {
    // Create a bug first
    const createResponse = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Get Test Bug',
        description: 'Bug to retrieve',
        severity: 'medium',
        status: 'open',
      },
    });
    const bug = await createResponse.json();

    // Get the bug
    const response = await request.get(`${BASE_URL}/bugs/${bug.bugid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const retrievedBug = await response.json();
    expect(retrievedBug.bugid).toBe(bug.bugid);
    expect(retrievedBug.title).toBe('Get Test Bug');
  });

  test('should update a bug', async ({ request }) => {
    // Create a bug first
    const createResponse = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Update Test Bug',
        description: 'Bug to update',
        severity: 'low',
        status: 'open',
      },
    });
    const bug = await createResponse.json();

    // Update the bug
    const response = await request.put(`${BASE_URL}/bugs/${bug.bugid}`, {
      headers: { Authorization: `Bearer ${developerToken}` },
      data: {
        title: 'Updated Bug Title',
        status: 'in_progress',
        severity: 'high',
      },
    });

    expect(response.status()).toBe(200);
    const updatedBug = await response.json();
    expect(updatedBug.title).toBe('Updated Bug Title');
    expect(updatedBug.status).toBe('in_progress');
  });

  test('should delete a bug', async ({ request }) => {
    // Create a bug to delete
    const createResponse = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Delete Test Bug',
        description: 'Bug to be deleted',
        severity: 'low',
        status: 'open',
      },
    });
    const bug = await createResponse.json();

    // Delete the bug
    const deleteResponse = await request.delete(`${BASE_URL}/bugs/${bug.bugid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(deleteResponse.status()).toBe(200);

    // Verify bug is deleted
    const getResponse = await request.get(`${BASE_URL}/bugs/${bug.bugid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getResponse.status()).toBe(404);
  });

  test('should validate bug severity values', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Invalid Severity Bug',
        description: 'Bug with invalid severity',
        severity: 'invalid_severity',
        status: 'open',
      },
    });

    // Should reject invalid severity
    expect([400, 422, 500]).toContain(response.status());
  });

  test('should validate bug status values', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Invalid Status Bug',
        description: 'Bug with invalid status',
        severity: 'medium',
        status: 'invalid_status',
      },
    });

    // Should reject invalid status
    expect([400, 422, 500]).toContain(response.status());
  });
});


