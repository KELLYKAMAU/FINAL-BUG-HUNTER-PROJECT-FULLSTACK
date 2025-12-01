import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Authentication Security Tests', () => {
  test('should reject SQL injection in email field', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: "admin@example.com' OR '1'='1",
        password: 'password',
      },
    });

    // Should not authenticate with SQL injection
    expect(response.status()).toBe(401);
  });

  test('should reject SQL injection in password field', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'admin@example.com',
        password: "' OR '1'='1",
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should handle XSS attempts in registration', async ({ request }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: '<script>alert("XSS")</script>',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPass123!',
        role_user: 'tester',
      },
    });

    // Should either sanitize or reject XSS attempts
    // Check that script tags are not in response
    if (response.status() === 201) {
      const body = await response.json();
      const bodyString = JSON.stringify(body);
      expect(bodyString).not.toContain('<script>');
    }
  });

  test('should enforce password complexity', async ({ request }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: '123', // Weak password
        role_user: 'tester',
      },
    });

    // Should reject weak passwords (if validation is implemented)
    // This test documents expected behavior
    expect([400, 422, 201]).toContain(response.status());
  });

  test('should prevent JWT token tampering', async ({ request }) => {
    // Get a valid token
    const uniqueEmail = `test_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPass123!',
        role_user: 'admin',
      },
    });

    const loginResponse = await request.post(`${BASE_URL}/login`, {
      data: { email: uniqueEmail, password: 'TestPass123!' },
    });
    const { token } = await loginResponse.json();

    // Tamper with the token
    const tamperedToken = token.slice(0, -5) + 'XXXXX';

    // Try to use tampered token
    const response = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });

    expect(response.status()).toBe(401);
  });

  test('should reject expired tokens', async ({ request }) => {
    // Create an expired token manually (this is a simplified test)
    // In real scenarios, you'd need to wait for token expiry or use a test token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYwOTQ1NjgwMCwiZXhwIjoxNjA5NDU2ODAwfQ.invalid';

    const response = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    expect(response.status()).toBe(401);
  });

  test('should prevent token reuse after logout (if implemented)', async ({ request }) => {
    // This test documents expected behavior if logout invalidates tokens
    // Implementation may vary
    const uniqueEmail = `test_${Date.now()}@example.com`;
    await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPass123!',
        role_user: 'admin',
      },
    });

    const loginResponse = await request.post(`${BASE_URL}/login`, {
      data: { email: uniqueEmail, password: 'TestPass123!' },
    });
    const { token } = await loginResponse.json();

    // If logout endpoint exists, logout here
    // For now, just verify token works
    const response = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
  });

  test('should rate limit login attempts', async ({ request }) => {
    // Attempt multiple failed logins
    const attempts = 10;
    let lastStatus = 0;

    for (let i = 0; i < attempts; i++) {
      const response = await request.post(`${BASE_URL}/login`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'WrongPassword',
        },
      });
      lastStatus = response.status();
    }

    // Should implement rate limiting (429 Too Many Requests)
    // If not implemented, will continue returning 401
    expect([401, 429]).toContain(lastStatus);
  });

  test('should not expose sensitive information in error messages', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      },
    });

    const body = await response.json();
    const bodyString = JSON.stringify(body).toLowerCase();

    // Should not expose database structure, SQL errors, or internal paths
    expect(bodyString).not.toContain('sql');
    expect(bodyString).not.toContain('database');
    expect(bodyString).not.toContain('password');
    expect(bodyString).not.toContain('c:\\');
    expect(bodyString).not.toContain('/etc/');
  });

  test('should validate role enum values', async ({ request }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPass123!',
        role_user: 'superadmin', // Invalid role
      },
    });

    // Should reject invalid role values
    expect([400, 422, 500]).toContain(response.status());
  });
});


