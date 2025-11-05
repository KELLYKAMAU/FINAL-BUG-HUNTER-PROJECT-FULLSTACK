
import { getAuthUser } from '../middleware/bearAuth';
import * as projectRepositories from '../Repositories/projects.repository';
import { Project, NewProject, UpdateProject } from '../Types/projects.types';
import * as userProjectRepository from '../Repositories/projectuser.repository'

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


// Creates a new project and returns the created record along with a success message.
export const createNewProject = async (project: NewProject, authUser: any) => {
  // Validate required fields before any DB work
  if (!project || !project.title) {
    throw new Error("Project title is required");
  }

  // Determine created_by from authenticated user
  const createdBy = authUser && (authUser.userid ?? authUser.userId ?? authUser.sub);
  if (!createdBy || isNaN(createdBy)) {
    throw new Error("Invalid authenticated user");
  }

  // Build the project payload to insert
  const projectToCreate: NewProject = {
    ...project,
    created_by: createdBy,
    created_at: project.created_at ?? new Date(),
  };

  // Single insertion only
  const result = await projectRepositories.createNewProject(projectToCreate);
  const createdProject = result.project;

  // add creator as lead
  await userProjectRepository.addMember({
    projectid: createdProject.projectid,
    userid: createdBy,
    role_in_project: "lead",
  });

  // add other members of the project (if any)
  if (project.members && project.members.length > 0) {
    for (const member of project.members) {
      await userProjectRepository.addMember({
        projectid: createdProject.projectid,
        userid: member.userid,
        role_in_project: member.role,
      });
    }
  }

  return {
    message: "Project created successfully with team members",
    project: createdProject,
  };
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
export const updateProject = async (id: number, projectData: UpdateProject, authUser:any) => {
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
  // authoriation logic 
   // Only admin or project lead can update the project
  const isLead = existingProject.created_by === authUser.userid;
  const isAdmin = authUser.role === "admin";

  if (!isAdmin && !isLead) {
    throw new Error("Unauthorized");
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