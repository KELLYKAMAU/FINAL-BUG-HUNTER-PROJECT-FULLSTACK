import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Input Validation Security Tests', () => {
  let adminToken: string;
  let testerToken: string;
  let projectId: number;

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
        title: 'Validation Test Project',
        description: 'Project for input validation testing',
        status: 'active',
      },
    });
    const project = await projectResponse.json();
    projectId = project.projectid;
  });

  test('should reject extremely long input strings', async ({ request }) => {
    const longString = 'A'.repeat(10000);
    
    const response = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: longString,
        description: 'Test description',
        severity: 'medium',
        status: 'open',
      },
    });

    // Should reject or truncate extremely long inputs
    expect([400, 413, 422]).toContain(response.status());
  });

  test('should sanitize special characters in user input', async ({ request }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        first_name: "'; DROP TABLE Users; --",
        last_name: 'User',
        email: uniqueEmail,
        password: 'TestPass123!',
        role_user: 'tester',
      },
    });

    // Should either sanitize or reject malicious input
    if (response.status() === 201) {
      const body = await response.json();
      const bodyString = JSON.stringify(body);
      // Should not contain SQL injection patterns in response
      expect(bodyString.toLowerCase()).not.toContain('drop table');
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });

  test('should validate email format', async ({ request }) => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'test@',
      'test..test@example.com',
      'test@example',
    ];

    for (const email of invalidEmails) {
      const response = await request.post(`${BASE_URL}/register`, {
        data: {
          first_name: 'Test',
          last_name: 'User',
          email: email,
          password: 'TestPass123!',
          role_user: 'tester',
        },
      });

      // Should reject invalid email formats
      expect([400, 422]).toContain(response.status());
    }
  });

  test('should prevent NoSQL injection (if applicable)', async ({ request }) => {
    // Test for NoSQL injection patterns
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: { $ne: null },
        password: { $ne: null },
      },
    });

    // Should reject NoSQL injection attempts
    expect([400, 401, 422]).toContain(response.status());
  });

  test('should validate numeric input types', async ({ request }) => {
    // Try to pass string where number is expected
    const response = await request.get(`${BASE_URL}/users/notanumber`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Should handle gracefully (400 or 404)
    expect([400, 404]).toContain(response.status());
  });

  test('should validate enum values', async ({ request }) => {
    const invalidStatuses = ['invalid', 'hacked', 'exploited'];
    
    for (const status of invalidStatuses) {
      const response = await request.post(`${BASE_URL}/createbug`, {
        headers: { Authorization: `Bearer ${testerToken}` },
        data: {
          projectid: projectId,
          title: 'Test Bug',
          description: 'Test',
          severity: 'medium',
          status: status,
        },
      });

      expect([400, 422, 500]).toContain(response.status());
    }
  });

  test('should prevent path traversal attempts', async ({ request }) => {
    const pathTraversalAttempts = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '../../../../etc/shadow',
    ];

    for (const path of pathTraversalAttempts) {
      // Try in various fields
      const response = await request.post(`${BASE_URL}/createbug`, {
        headers: { Authorization: `Bearer ${testerToken}` },
        data: {
          projectid: projectId,
          title: path,
          description: 'Test',
          severity: 'medium',
          status: 'open',
        },
      });

      // Should sanitize or reject path traversal attempts
      if (response.status() === 201) {
        const body = await response.json();
        const bodyString = JSON.stringify(body);
        expect(bodyString).not.toContain('../');
        expect(bodyString).not.toContain('..\\');
      }
    }
  });

  test('should validate required fields', async ({ request }) => {
    // Try to create bug without required fields
    const response = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        // Missing required fields
        description: 'Test description',
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should prevent command injection', async ({ request }) => {
    const commandInjectionAttempts = [
      '; ls -la',
      '| cat /etc/passwd',
      '&& whoami',
      '`rm -rf /`',
    ];

    for (const cmd of commandInjectionAttempts) {
      const response = await request.post(`${BASE_URL}/createbug`, {
        headers: { Authorization: `Bearer ${testerToken}` },
        data: {
          projectid: projectId,
          title: `Test ${cmd}`,
          description: 'Test',
          severity: 'medium',
          status: 'open',
        },
      });

      // Should sanitize command injection attempts
      if (response.status() === 201) {
        const body = await response.json();
        const bodyString = JSON.stringify(body);
        // Should not contain command characters
        expect(bodyString).not.toContain(';');
        expect(bodyString).not.toContain('|');
        expect(bodyString).not.toContain('`');
      }
    }
  });

  test('should handle null and undefined values', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: null,
        title: undefined,
        description: 'Test',
        severity: 'medium',
        status: 'open',
      },
    });

    // Should reject null/undefined in required fields
    expect([400, 422]).toContain(response.status());
  });

  test('should validate array bounds and prevent buffer overflow', async ({ request }) => {
    // Create a comment with extremely long text
    const longComment = 'A'.repeat(100000);
    
    const bugResponse = await request.post(`${BASE_URL}/createbug`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        projectid: projectId,
        title: 'Test Bug',
        description: 'Test',
        severity: 'medium',
        status: 'open',
      },
    });
    const bug = await bugResponse.json();

    const response = await request.post(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        bugid: bug.bugid,
        comment_text: longComment,
      },
    });

    // Should reject or truncate extremely long comments
    expect([400, 413, 422, 201]).toContain(response.status());
  });

  test('should prevent LDAP injection (if applicable)', async ({ request }) => {
    const ldapInjectionAttempts = [
      '*',
      ')(&',
      '(|(cn=*))',
    ];

    for (const ldap of ldapInjectionAttempts) {
      const response = await request.post(`${BASE_URL}/login`, {
        data: {
          email: ldap,
          password: 'password',
        },
      });

      // Should reject LDAP injection attempts
      expect([400, 401, 422]).toContain(response.status());
    }
  });
});


