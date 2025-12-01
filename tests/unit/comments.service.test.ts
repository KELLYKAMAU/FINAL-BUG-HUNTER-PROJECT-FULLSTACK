import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as commentService from '../../src/services/comments.service';
import * as commentRepository from '../../src/Repositories/comments.repository';
import type { Comment, UpdateComment } from '../../src/Types/comments.types';

vi.mock('../../src/Repositories/comments.repository');

describe('comments.service', () => {
  const baseComment: Comment = {
    commentid: 1,
    bugid: 1,
    userid: 1,
    content: 'Test comment',
    created_at: new Date(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getAllComments returns repository data', async () => {
    (commentRepository.getAllComments as any).mockResolvedValueOnce([baseComment]);
    const result = await commentService.getAllComments();
    expect(result).toEqual([baseComment]);
  });

  it('getCommentsByBugId forwards to repository', async () => {
    (commentRepository.getCommentsByBugId as any).mockResolvedValueOnce([baseComment]);
    const result = await commentService.getCommentsByBugId(1);
    expect(commentRepository.getCommentsByBugId).toHaveBeenCalledWith(1);
    expect(result).toEqual([baseComment]);
  });

  describe('getCommentById', () => {
    it('throws for invalid id', async () => {
      await expect(commentService.getCommentById(NaN as any)).rejects.toThrow(
        'Invalid comment ID',
      );
    });

    it('throws when not found', async () => {
      (commentRepository.getCommentById as any).mockResolvedValueOnce(null);
      await expect(commentService.getCommentById(1)).rejects.toThrow('Comment not found');
    });

    it('returns message and comment when found', async () => {
      (commentRepository.getCommentById as any).mockResolvedValueOnce(baseComment);
      const result = await commentService.getCommentById(1);
      expect(result).toMatchObject({
        message: 'Comment retrieved successfully',
        comment: baseComment,
      });
    });
  });

  describe('createComment', () => {
    const makeComment = (overrides: Partial<Comment> = {}): Comment =>
      ({
        bugid: 1,
        userid: 1,
        content: 'Hello',
        ...overrides,
      } as any);

    it('throws when required fields missing', async () => {
      await expect(
        commentService.createComment(makeComment({ content: '' } as any)),
      ).rejects.toThrow('Missing required fields: bugid, userid, or content');
      await expect(
        commentService.createComment(makeComment({ userid: undefined as any })),
      ).rejects.toThrow('Missing required fields: bugid, userid, or content');
      await expect(
        commentService.createComment(makeComment({ bugid: undefined as any })),
      ).rejects.toThrow('Missing required fields: bugid, userid, or content');
    });

    it('calls repository.createComment for valid input', async () => {
      (commentRepository.createComment as any).mockResolvedValueOnce(undefined);
      const payload = makeComment();
      await commentService.createComment(payload);
      expect(commentRepository.createComment).toHaveBeenCalledWith(payload);
    });
  });

  it('deleteComment forwards to repository', async () => {
    (commentRepository.deleteComment as any).mockResolvedValueOnce(undefined);
    await commentService.deleteComment(1);
    expect(commentRepository.deleteComment).toHaveBeenCalledWith(1);
  });

  describe('updateComment', () => {
    const update: UpdateComment = { content: 'Updated' } as any;

    it('throws for invalid id', async () => {
      await expect(
        commentService.updateComment(NaN as any, update),
      ).rejects.toThrow('Invalid comment ID');
    });

    it('throws when no data provided', async () => {
      await expect(
        commentService.updateComment(1, {} as any),
      ).rejects.toThrow('No data provided for update');
    });

    it('throws when comment not found', async () => {
      (commentRepository.getCommentById as any).mockResolvedValueOnce(null);
      await expect(
        commentService.updateComment(1, update),
      ).rejects.toThrow('Comment not found');
    });

    it('returns repository result on success', async () => {
      (commentRepository.getCommentById as any).mockResolvedValueOnce(baseComment);
      (commentRepository.updateComment as any).mockResolvedValueOnce({
        message: 'Updated',
      });
      const result = await commentService.updateComment(1, update);
      expect(result).toEqual({ message: 'Updated' });
    });
  });
});


