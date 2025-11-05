import { Request, Response } from "express";
import * as projectServices from '../services/project.service'


//get all project
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const project = await projectServices.listProjects();
        res.status(200).json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}


//get project by id
export const getProjectById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const project = await projectServices.getProject(id)
        res.status(200).json(project)

    } catch (error: any) {
        if (error.message === 'Inavlid projectid') {
            res.status(400).json({ message: 'Inavlid projectid' })
        } else if (error.message == 'Project not found') {
            res.status(404).json({ message: 'Project not found' })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

//create new project
export const createNewProject = async (req: Request, res: Response) => {
    const project = req.body;
    const authUser = (req as any).user;
    console.log(authUser)
    try {
        const result = await projectServices.createNewProject(project,authUser); 
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}


//update a project
export const updateProject = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const projectData = req.body;
  const authUser = (req as any).user;

  try {
    const result = await projectServices.updateProject(id, projectData, authUser);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Invalid project ID") {
      res.status(400).json({ message: "Invalid project ID" });
    } else if (error.message === "Project not found") {
      res.status(404).json({ message: "Project not found" });
    } else if (error.message === "No data provided for update") {
      res.status(400).json({ message: "No fields provided for update" });
    } else if(error.message==="Unauthorized") {
      res.status(403).json({ message: "Forbidden: You cannot modify this project" });
    }
    else {
      res.status(500).json({ error: "Internal server error" });
      console.error("Error updating project:", error);
    }
  }
};



// delete a project by id
export const deleteProject = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const result = await projectServices.deleteProject(id)
        res.status(200).json(result)
    } catch (error: any) {
        if (error.message === 'Inavlid projectid') {
            res.status(400).json({ message: 'Inavlid projectid' })
        } else if (error.message == 'Project not found') {
            res.status(404).json({ message: 'Project not found' })
        } else {

            res.status(500).json({ error: error.message })
        }

    }
}