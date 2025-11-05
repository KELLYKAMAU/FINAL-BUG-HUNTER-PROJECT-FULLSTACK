import { Express } from "express";
import * as userController from "../controllers/user.controllers";
import { adminOnly, allRoles } from "../middleware/bearAuth";

const userRoutes = (app: Express) => {
    // Get all users
    app.get("/users",userController.getUsers);

    // Get a specific user by ID
    app.get("/users/:id", allRoles, userController.getUserById);

    // Create a new user
    app.post("/users", adminOnly, userController.createUser);

    // Update an existing user
    app.patch("/users/:id",
         userController.updateUser);

    // Delete a user
    app.delete("/users/:id", adminOnly, userController.deleteUser);

    // Log in user 
    app.post('/login',userController.loginUser)
};

export default userRoutes;
