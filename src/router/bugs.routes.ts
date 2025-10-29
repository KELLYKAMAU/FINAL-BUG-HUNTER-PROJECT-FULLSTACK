// src/routes/bugs.routes.ts
import { Express} from 'express';
import * as bugsController  from '../controllers/bugs.controller';


const bugsRoutes = (app: Express) => {
    
        app.get("/getbugs/:project_id", bugsController.listbyProject);
        app.get("/allbugs", bugsController.getAll);
        app.get("/bugs/:id", bugsController.getBug);
        app.post("/createbug", bugsController.createBug);
        app.put("/bugs/:id", bugsController.updateBug);
        app.delete("/bugs/:id", bugsController.deleteBug);
};




export default bugsRoutes;
