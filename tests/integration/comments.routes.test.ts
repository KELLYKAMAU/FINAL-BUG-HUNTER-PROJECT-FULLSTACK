process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import * as commentService from '../../src/services/comments.service';
import type { Comment } from '../../src/Types/comments.types';

describe('Comments routes integration', () => {
  const baseComment: Comment = {
    commentid: 1,
    bugid: 1,
    userid: 1,
    content: 'Test comment',
    created_at: new Date(),
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /comments returns all comments', async () => {
    vi.spyOn(commentService, 'getAllComments').mockResolvedValueOnce([baseComment]);

    const res = await request(app).get('/comments');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ commentid: 1 })]);
  });

  it('GET /comments/:bugid returns comments for bug', async () => {
    vi.spyOn(commentService, 'getCommentsByBugId').mockResolvedValueOnce([baseComment]);

    const res = await request(app).get('/comments/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ bugid: 1 })]);
  });

  it('POST /comments creates comment', async () => {
    vi.spyOn(commentService, 'createComment').mockResolvedValueOnce(undefined);

    const res = await request(app)
      .post('/comments')
      .send({ bugid: 1, userid: 1, content: 'New comment' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Comment created successfully');
  });
});


