import { Request, Response } from "express";
import * as commentsService from "../services/comments.service";

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await commentsService.getAllComments();
    res.status(200).json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const comment = await commentsService.getCommentById(id);
    res.status(200).json(comment);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    await commentsService.createComment(req.body);
    res.status(201).json({ message: "Comment created successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    await commentsService.updateComment(id, content);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await commentsService.deleteComment(id);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
