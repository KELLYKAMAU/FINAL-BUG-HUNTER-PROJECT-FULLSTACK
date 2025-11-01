import { Request, Response } from "express";
import * as commentService from "../services/comments.service";

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await commentService.getAllComments();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

export const getCommentsByBugId = async (req: Request, res: Response) => {
  try {
    const { bugid } = req.params;
    const comments = await commentService.getCommentsByBugId(Number(bugid));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments by bug ID", error });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    await commentService.createComment(req.body);
    res.status(201).json({ message: "Comment created successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentid } = req.params;
    await commentService.deleteComment(Number(commentid));
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

//update comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const commentData = req.body;

    // Call the service function
    const result = await commentService.updateComment(id, commentData);

    // Send success response
    res.status(200).json(result); // { message: "Comment updated successfully" }
  } catch (error: any) {
    console.error("Error updating comment:", error.message);
    res.status(400).json({ error: error.message });
  }
};
