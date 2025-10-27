import express from "express";
import * as commentsController from "../controllers/comments.controllers";

const router = express.Router();

router.get("/", commentsController.getAllComments);
router.get("/:id", commentsController.getCommentById);
router.post("/", commentsController.createComment);
router.put("/:id", commentsController.updateComment);
router.delete("/:id", commentsController.deleteComment);

export default router;
