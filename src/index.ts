// import packages 
import express from 'express' 
import mssql, { ConnectionPool } from 'mssql'
import dotenv from 'dotenv'
import userRoutes from './router/users.routes'
import projectRoutes from './router/project.routes'

// import modules 
import { getPool } from './db/config'


// initialize the express app object - stores all express functions in the app object
const app = express()

// middlewares 
app.use(express.json()); //parse json files

userRoutes(app);
projectRoutes(app)

// load .env file variables 
dotenv.config()

// register routes 
// todoRoutes(app)
// userRoutes(app)
// define the port : entry point to the server
const port=process.env.PORT||8081

// start the server
//fun tells express to listen to all request entering through defined port 
app.listen(port,()=>{
    console.log(`Server is running on port: http://localhost:${port}`)
})



//define root route. check that endpoint works
app.get('/',(_,res)=>{
    res.send("Hello, the express server is up and running")
})

// connect app to database 
getPool()
    .then(()=>console.log("Database connected successfully"))
    .catch((err:any)=>console.log("Database connection failed"))

