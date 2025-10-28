// src/routes/bugs.routes.ts
import { Express} from 'express';
import * as bugsController  from '../controllers/bugs.controller';


const bugsRoutes = (app: Express) => {
    
        app.get("/bugs", bugsController.getAllbugs);
        app.get("/bugs/:id", bugsController.getbugsById);
        app.post("/bugs", bugsController.createBug);
        app.put("/bugs/:id", bugsController.updatebugs);
        app.delete("/bugs/:id", bugsController.deleteBugs);
};




export default bugsRoutes;
