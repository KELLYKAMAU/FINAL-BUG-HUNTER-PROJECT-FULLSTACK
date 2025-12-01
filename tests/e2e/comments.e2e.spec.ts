import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

test.describe('Comments E2E Tests', () => {
  let adminToken: string;
  let testerToken: string;
  let projectId: number;
  let bugId: number;
  let createdCommentId: number;

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
        title: 'Comment Test Project',
        description: 'Project for comment testing',
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
        title: 'Comment Test Bug',
        description: 'Bug for comment testing',
        severity: 'medium',
        status: 'open',
      },
    });
    const bug = await bugResponse.json();
    bugId = bug.bugid;
  });

  test('should create a comment on a bug', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        bugid: bugId,
        comment_text: 'This is a test comment for E2E testing',
      },
    });

    expect(response.status()).toBe(201);
    const comment = await response.json();
    expect(comment).toHaveProperty('commentid');
    expect(comment.comment_text).toBe('This is a test comment for E2E testing');
    createdCommentId = comment.commentid;
  });

  test('should list all comments', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const comments = await response.json();
    expect(Array.isArray(comments)).toBe(true);
  });

  test('should get comments by bug ID', async ({ request }) => {
    // Create a comment first
    await request.post(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        bugid: bugId,
        comment_text: 'Another test comment',
      },
    });

    // Get comments for the bug
    const response = await request.get(`${BASE_URL}/comments/${bugId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const comments = await response.json();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
  });

  test('should update a comment', async ({ request }) => {
    // Create a comment first
    const createResponse = await request.post(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        bugid: bugId,
        comment_text: 'Comment to update',
      },
    });
    const comment = await createResponse.json();

    // Update the comment
    const response = await request.put(`${BASE_URL}/comments/${comment.commentid}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        comment_text: 'Updated comment text',
      },
    });

    expect(response.status()).toBe(200);
    const updatedComment = await response.json();
    expect(updatedComment.comment_text).toBe('Updated comment text');
  });

  test('should delete a comment', async ({ request }) => {
    // Create a comment to delete
    const createResponse = await request.post(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        bugid: bugId,
        comment_text: 'Comment to be deleted',
      },
    });
    const comment = await createResponse.json();

    // Delete the comment
    const deleteResponse = await request.delete(`${BASE_URL}/comments/${comment.commentid}`, {
      headers: { Authorization: `Bearer ${testerToken}` },
    });

    expect(deleteResponse.status()).toBe(200);

    // Verify comment is deleted (try to get it)
    const getResponse = await request.get(`${BASE_URL}/comments/${bugId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const comments = await getResponse.json();
    const deletedComment = comments.find((c: any) => c.commentid === comment.commentid);
    expect(deletedComment).toBeUndefined();
  });

  test('should reject empty comment text', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${testerToken}` },
      data: {
        bugid: bugId,
        comment_text: '',
      },
    });

    // Should reject empty comment
    expect([400, 422]).toContain(response.status());
  });
});


