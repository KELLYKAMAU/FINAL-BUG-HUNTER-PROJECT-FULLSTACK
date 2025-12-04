// import packages
import express from "express";
import mssql from "mssql";
import dotenv from "dotenv";
import cors from "cors";


// import modules
import { getPool } from "./db/config";
import userRoutes from "./router/users.routes";
import projectRoutes from "./router/project.routes";
import commentRoutes from "./router/comments.routes";
import bugsRoutes from "./router/bugs.routes";
import authRouter from "./router/auth.routes";
import { loginUser } from "./controllers/auth.controller"; 


// 1. Load .env variables as early as possible
dotenv.config();

// initialize the express app object
const app = express();

// 2. Middlewares
app.use(express.json()); // parse JSON bodies



app.use("/api/auth", authRouter);



// 3. CORS – this is what lets your frontend talk to this backend
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      // "http://localhost:4000", // CRA dev server (if you ever use it)
      // // add your deployed frontend URL here, e.g.:
      // // "https://bug-hunter-ten.vercel.app"
      
    ],
    credentials: true,
  })
);

// 4. Register routes (your existing route setup)
userRoutes(app);
projectRoutes(app);
bugsRoutes(app);
commentRoutes(app);

// Optional: simple health/check route for frontend to test
app.get("/", (_, res) => {
  res.send("Hello, the express server is up and running");
});

// define the port : entry point to the server
const port = process.env.PORT || 8081;

// start the server unless we're running tests
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
  });
}

// connect app to database
getPool()
  .then(() => console.log("Database connected successfully"))
  .catch((err: any) => console.log("Database connection failed", err));

// export the app for testing
export { app };
