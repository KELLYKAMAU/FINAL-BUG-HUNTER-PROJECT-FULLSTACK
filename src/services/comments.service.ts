import * as commentsRepo from "../Repositories/comments.repository";

export const getAllComments = async () => {
  return await commentsRepo.getAllComments();
};

export const getCommentById = async (id: number) => {
  const comment = await commentsRepo.getCommentById(id);
  if (!comment) throw new Error("Comment not found");
  return comment;
};

export const createComment = async (comment: any) => {
  if (!comment.bugid || !comment.userid || !comment.content) {
    throw new Error("Missing required fields");
  }
  await commentsRepo.createComment(comment);
};

export const updateComment = async (id: number, content: string) => {
  const existing = await commentsRepo.getCommentById(id);
  if (!existing) throw new Error("Comment not found");
  await commentsRepo.updateComment(id, content);
};

export const deleteComment = async (id: number) => {
  const existing = await commentsRepo.getCommentById(id);
  if (!existing) throw new Error("Comment not found");
  await commentsRepo.deleteComment(id);
};
