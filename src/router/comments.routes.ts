import { Express } from "express";
import * as commentController from "../controllers/comments.controllers";

const commentRoutes = (app:Express) => {

// Routes for Comments
app.get("/comments", commentController.getAllComments);
app.get("/comments/:bugid", commentController.getCommentsByBugId);
app.post("/comments", commentController.createComment);
app.delete("/comments/:commentid", commentController.deleteComment);
app.put("/comments/:id", commentController.updateComment);

}
export default commentRoutes ;

