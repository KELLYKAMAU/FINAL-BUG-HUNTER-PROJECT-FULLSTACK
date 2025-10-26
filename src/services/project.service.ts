
import * as projectRepositories from '../Repositories/projects.repository';
import { Project, NewProject, UpdateProject } from '../Types/projects.types';


////Fetches all projects from the database.
export const listProjects = async (): Promise<Project[]> => {
    return await projectRepositories.getAllProjects();
};


export const getProject = async (id: number): Promise<Project> => {
    /**
     * Retrieves a single project by its ID.
     * Validates the ID and checks if the project exists.
    */
    if (isNaN(id)) {
        throw new Error ("Invalid projectid")
    }


    const existingproject = await projectRepositories.getProjectById(id);


    if (!existingproject) {
        throw new Error("Project not found")
    }


    return existingproject;

}


//Creates a new project and returns the created record along with a success message.
export const createNewProject = async ( 
    project: NewProject 
): Promise<{message: string; project: Project }> => {
  return await projectRepositories.createNewProject(project);
};



//Deletes a project by its ID and returns the deleted record with a success message.
export const deleteProject = async (
    id: number
): Promise<{ message: string; project: Project }> => {

    if (isNaN(id)) {
        throw new Error ("Invalid project ID")
    }

    const existingproject = await projectRepositories.getProjectById(id);

    if (!existingproject) {
        throw new Error ('Project not found')
    }

    const result = await projectRepositories.deleteProject(id);

    return {
    message: result.message,
    project: result.Project,
  };
};

// Updates an existing project by its ID and returns the updated record.
export const updateProject = async (
    id:number, 
    project: UpdateProject
): Promise<{ message: string; project: Project }> => {

    
    if (isNaN(id)) {
        throw new Error("Invalid project id")
    }
    const existingproject = await projectRepositories.getProjectById(id)
    if(!existingproject) {
        throw new Error ('Project not found')
    }
    return await projectRepositories.updateProject(id, project)
};