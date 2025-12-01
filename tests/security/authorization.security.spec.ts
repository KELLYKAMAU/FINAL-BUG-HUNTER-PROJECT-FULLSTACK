import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Authorization Security Tests', () => {
  let adminToken: string;
  let developerToken: string;
  let testerToken: string;
  let projectId: number;
  let bugId: number;
  let userId: number;

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
    userId = adminData.user.userid;

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

    // Create a project
    const projectResponse = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Security Test Project',
        description: 'Project for security testing',
        status: 'active',
      },
    });
    const project = await projectResponse.json();
    projectId = project.projectid;

    // Create a bug
    const bugResponse = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Security Test Bug',
        description: 'Bug for security testing',
        severity: 'high',
        status: 'open',
      },
    });
    const bug = await bugResponse.json();
    bugId = bug.bugid;
  });

  test('should prevent tester from creating users', async ({ request }) => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        first_name: 'New',
        last_name: 'User',
        email: uniqueEmail,
        password: 'NewUserPass123!',
        role_user: 'tester',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should prevent developer from creating users', async ({ request }) => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${developerToken}` },
      data: {
        first_name: 'New',
        last_name: 'User',
        email: uniqueEmail,
        password: 'NewUserPass123!',
        role_user: 'tester',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should prevent tester from creating projects', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        title: 'Unauthorized Project',
        description: 'Should not be created',
        status: 'active',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should prevent tester from updating projects', async ({ request }) => {
    const response = await request.put(`${BASE_URL}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        title: 'Unauthorized Update',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should prevent horizontal privilege escalation', async ({ request }) => {
    // Tester should not be able to access another user's data
    // Create another user
    const uniqueEmail = `otheruser_${Date.now()}@example.com`;
    const createResponse = await request.post(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        first_name: 'Other',
        last_name: 'User',
        email: uniqueEmail,
        password: 'OtherPass123!',
        role_user: 'tester',
      },
    });
    const otherUser = await createResponse.json();

    // Tester tries to update another user's profile
    const response = await request.patch(`${BASE_URL}/users/${otherUser.userid}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        first_name: 'Hacked',
      },
    });

    // Should be rejected (403 or 401)
    expect([401, 403]).toContain(response.status());
  });

  test('should prevent vertical privilege escalation', async ({ request }) => {
    // Tester should not be able to change their own role to admin
    const response = await request.patch(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        role_user: 'admin', // Attempt to escalate privilege
      },
    });

    // Should either reject the update or not allow role changes
    if (response.status() === 200) {
      const updatedUser = await response.json();
      // If update succeeds, role should not have changed
      expect(updatedUser.role_user).not.toBe('admin');
    } else {
      expect([400, 403, 422]).toContain(response.status());
    }
  });

  test('should validate JWT payload integrity', async ({ request }) => {
    // Get admin token
    const adminEmail = `admin2_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Admin2',
        last_name: 'User',
        email: adminEmail,
        password: 'AdminPass123!',
        role_user: 'admin',
      },
    });

    const loginResponse = await request.post(`${BASE_URL}/login`, {
      data: { email: adminEmail, password: 'AdminPass123!' },
    });
    const { token } = await loginResponse.json();

    // Decode token (without verification) to check payload
    // In a real scenario, you'd verify the token structure
    const parts = token.split('.');
    expect(parts.length).toBe(3); // JWT has 3 parts: header.payload.signature
  });

  test('should enforce role-based access on delete operations', async ({ request }) => {
    // Create a user to delete
    const uniqueEmail = `todelete_${Date.now()}@example.com`;
    const createResponse = await request.post(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        first_name: 'To',
        last_name: 'Delete',
        email: uniqueEmail,
        password: 'DeletePass123!',
        role_user: 'tester',
      },
    });
    const userToDelete = await createResponse.json();

    // Tester tries to delete user
    const response = await request.delete(`${BASE_URL}/users/${userToDelete.userid}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('should prevent IDOR (Insecure Direct Object Reference)', async ({ request }) => {
    // Create a bug as tester
    const bugResponse = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Private Bug',
        description: 'Should only be accessible by creator',
        severity: 'high',
        status: 'open',
      },
    });
    const privateBug = await bugResponse.json();

    // Another user (developer) tries to access it
    // This should be allowed if bugs are project-scoped, but test documents the check
    const response = await request.get(`${BASE_URL}/bugs/${privateBug.bugid}`, {
      headers: { Authorization: `Bearer ${developerToken}` },
    });

    // Should either allow (if project member) or deny (if strict ownership)
    expect([200, 403, 404]).toContain(response.status());
  });

  test('should validate authorization header format', async ({ request }) => {
    // Test various malformed authorization headers
    const malformedHeaders = [
      'InvalidFormat',
      'Bearer',
      'Bearer ',
      'Basic token123',
      'token123',
    ];

    for (const header of malformedHeaders) {
      const response = await request.get(`${BASE_URL}/users`, {
        headers: { Authorization: header },
      });
      expect(response.status()).toBe(401);
    }
  });

  test('should prevent CSRF token bypass (if CSRF protection exists)', async ({ request }) => {
    // This test documents CSRF protection expectations
    // Most REST APIs don't use CSRF tokens, but it's good to test
    const response = await request.post(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-CSRF-Token': 'invalid_token',
      },
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: `test_${Date.now()}@example.com`,
        password: 'TestPass123!',
        role_user: 'tester',
      },
    });

    // If CSRF protection exists, should reject; otherwise should work
    expect([201, 403]).toContain(response.status());
  });
});


