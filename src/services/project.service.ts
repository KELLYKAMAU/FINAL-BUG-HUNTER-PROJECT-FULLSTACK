
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
export const createNewProject = async (project: NewProject): Promise<{message: string; project: Project }> => {
  return await projectRepositories.createNewProject(project);
};



export const deleteProject = async (id: number) => {
    // bad request: check if Id is valid
    if (isNaN(id)) {
        throw new Error('Inavlid userid')
    }
    // check if project exists 
    const existingproject = await projectRepositories.getProjectById(id);
    if (!existingproject) {
        throw new Error ('Project not found')
    }
    // wait for the project to be deleted in the repository 
    const result = await projectRepositories.deleteProject(id);
    // return success message and project record deleted 
    return {
    message: result.message,
    project: result.project,
}
}



// Updates an existing project by its ID and returns the updated record.
export const updateProject = async (id: number, projectData: UpdateProject) => {
  //validate the Id
  if (isNaN(id)) {
    throw new Error("Invalid project ID");
  }

  //check that data to update was provided
  if (!projectData || Object.keys(projectData).length === 0) {
    throw new Error("No data provided for update");
  }

  //confirm the project exists before updating
  const existingProject = await projectRepositories.getProjectById(id);
  if (!existingProject) {
    throw new Error("Project not found");
  }

  //ask repo to perform the actual Db update
  const updatedProject = await projectRepositories.updateProject(id, projectData);

  // handle any failed updates
  if (!updatedProject || updatedProject.length === 0) {
    throw new Error("Failed to update project");
  }

  //return a success message and the updated record
  return {
    message: "Project updated successfully",
    project: updatedProject[0],
  };
};