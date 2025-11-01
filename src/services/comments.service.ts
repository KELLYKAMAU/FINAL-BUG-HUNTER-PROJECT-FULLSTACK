import * as commentRepository from "../Repositories/comments.repository";
import { Comment, UpdateComment } from "../Types/comments.types";

export const getAllComments = async () => {
  return await commentRepository.getAllComments();
};

export const getCommentsByBugId = async (bugid: number) => {
  return await commentRepository.getCommentsByBugId(bugid);
};
// Retrieves a single comment by its ID.
export const getCommentById = async (id: number) => {
  // Validate the ID
  if (isNaN(id)) {
    throw new Error("Invalid comment ID");
  }

  // Ask the repository for the comment
  const comment = await commentRepository.getCommentById(id);

  // Check if the comment exists
  if (!comment) {
    throw new Error("Comment not found");
  }

  // Return the found comment
  return {
    message: "Comment retrieved successfully",
    comment,
  };
};


export const createComment = async (comment: Comment) => {
  if (!comment.content || !comment.userid || !comment.bugid) {
    throw new Error("Missing required fields: bugid, userid, or content");
  }
  await commentRepository.createComment(comment);
};

export const deleteComment = async (commentid: number) => {
  await commentRepository.deleteComment(commentid);
};

export const updateComment = async (id: number, commentData: UpdateComment) => {
  // Validate inputs
  if (isNaN(id)) throw new Error("Invalid comment ID");
  if (!commentData || Object.keys(commentData).length === 0)
    throw new Error("No data provided for update");

  // Confirm comment exists before updating
  const existingComment = await commentRepository.getCommentById(id);
  if (!existingComment) throw new Error("Comment not found");

  // Ask repository to perform update
  const result = await commentRepository.updateComment(id, commentData);

  // Just return the message from repo
  return result;
};




