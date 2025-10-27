import { Express } from "express";
import * as projectController from "../controllers/project.controllers";

const projectRoutes = (app: Express) => {
    app.get("/projects", projectController.getAllProjects);
    app.get("/projects/:id", projectController.getProjectById);
    app.post("/projects", projectController.createNewProject);
    app.put("/projects/:id", projectController.updateProject);
    app.delete("/projects/:id", projectController.deleteProject);
}
export default projectRoutes;
