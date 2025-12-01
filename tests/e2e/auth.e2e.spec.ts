import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Authentication E2E Tests', () => {
  let authToken: string;
  let userId: number;

  test('should register a new user', async ({ request }) => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPassword123!',
        role_user: 'tester',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('message');
    expect(body.message).toContain('User registered');
  });

  test('should login with valid credentials', async ({ request }) => {
    // First register a user
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPassword123!',
        role_user: 'tester',
      },
    });

    // Then login
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: uniqueEmail,
        password: 'TestPassword123!',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user');
    authToken = body.token;
    userId = body.user.userid;
  });

  test('should reject login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  test('should reject login with wrong password', async ({ request }) => {
    // First register a user
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPassword123!',
        role_user: 'tester',
      },
    });

    // Try to login with wrong password
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: uniqueEmail,
        password: 'WrongPassword123!',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should access protected route with valid token', async ({ request }) => {
    // Register and login
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPassword123!',
        role_user: 'admin',
      },
    });

    const loginResponse = await request.post(`${BASE_URL}/login`, {
      data: {
        email: uniqueEmail,
        password: 'TestPassword123!',
      },
    });

    const { token } = await loginResponse.json();

    // Access protected route
    const response = await request.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
  });

  test('should reject access to protected route without token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Unauthorized');
  });

  test('should reject access with invalid token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: 'Bearer invalid_token_12345',
      },
    });

    expect(response.status()).toBe(401);
  });
});


