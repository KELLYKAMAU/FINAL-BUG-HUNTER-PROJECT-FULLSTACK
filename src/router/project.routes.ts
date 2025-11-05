import { Express } from "express";
import * as projectController from "../controllers/project.controllers";
import { adminOrDeveloper,adminOnly } from "../middleware/bearAuth";

const projectRoutes = (app: Express) => {
    app.get("/projects", projectController.getAllProjects);
    app.get("/projects/:id", projectController.getProjectById);
    app.post("/projects",adminOnly, projectController.createNewProject);
    app.put("/projects/:id",adminOrDeveloper, projectController.updateProject);
    app.delete("/projects/:id", projectController.deleteProject);
}
export default projectRoutes;
