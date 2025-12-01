import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Users E2E Tests', () => {
  let adminToken: string;
  let developerToken: string;
  let testerToken: string;
  let adminUserId: number;
  let createdUserId: number;

  test.beforeAll(async ({ request }) => {
    // Create admin user and get token
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
    adminUserId = adminData.user.userid;

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

  test('should list all users (admin only)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
  });

  test('should create a new user (admin only)', async ({ request }) => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        first_name: 'New',
        last_name: 'User',
        email: uniqueEmail,
        password: 'NewUserPass123!',
        role_user: 'tester',
      },
    });

    expect(response.status()).toBe(201);
    const user = await response.json();
    expect(user).toHaveProperty('userid');
    expect(user.email).toBe(uniqueEmail);
    createdUserId = user.userid;
  });

  test('should reject user creation by non-admin', async ({ request }) => {
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

  test('should get user by ID', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/${adminUserId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const user = await response.json();
    expect(user).toHaveProperty('userid');
    expect(user.userid).toBe(adminUserId);
  });

  test('should return 404 for non-existent user', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/99999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(404);
  });

  test('should update user', async ({ request }) => {
    const response = await request.patch(`${BASE_URL}/users/${adminUserId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        first_name: 'Updated',
        last_name: 'Admin',
      },
    });

    expect(response.status()).toBe(200);
    const user = await response.json();
    expect(user.first_name).toBe('Updated');
  });

  test('should delete user (admin only)', async ({ request }) => {
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

    // Delete the user
    const deleteResponse = await request.delete(`${BASE_URL}/users/${userToDelete.userid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(deleteResponse.status()).toBe(200);

    // Verify user is deleted
    const getResponse = await request.get(`${BASE_URL}/users/${userToDelete.userid}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(getResponse.status()).toBe(404);
  });
});


