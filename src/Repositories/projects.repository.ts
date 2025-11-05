import { getPool } from "../db/config";
import { Project, NewProject, UpdateProject } from "../Types/projects.types";


//get all projects
export const getAllProjects = async (): Promise<Project[]> => {
    try{
        const pool = await getPool();
        const result = await pool.request().query(`SELECT * FROM Projects`);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Database query failed");
    }    
}

//get project by id 
export const getProjectById = async (id: number): Promise<Project> => {
    try{
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', id)
            .query(` SELECT *FROM Projects WHERE projectid = @id`);
        return result.recordset[0];
    } catch (error) {
        console.error("Error fetching project by id:", error);
        throw new Error("Database query by project id failed");
    }
} 

// Fetch a project by its title.
export const getProjectByTitle = async (title: string): Promise<Project | null> => {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input("title", title)
            .query(`SELECT *FROM Projects WHERE title = @title`);
            
        return result.recordset[0] || null;
    } catch (error) {
        console.error("Error fetching project by title:", error);
        throw new Error("Database query by title failed");
    }
};

// create new project
export const createNewProject = async ( project: NewProject):Promise<{ message: string; project: Project }>  => {
    try {
        const pool = await getPool ();
        const result = await pool
            .request()
            .input("title", project.title)
            .input("description", project.description)
            .input("created_by", project.created_by)
            .input("created_at", project.created_at)
            .query(`INSERT INTO Projects (title, description, created_by, created_at)  OUTPUT INSERTED.* VALUES (@title, @description, @created_by, @created_at)`);
        return{
            message: "Project created successsfully",
            project: result.recordset[0],
        };
    } catch (error) { 
        console.error("Error creating new project", error);
        throw new Error("Creating new project in the database failed");
    }
}


//update a Project
export const updateProject = async (id: number, project: UpdateProject) => {
  const pool = await getPool();
  const request = pool.request();

  const fields = Object.entries(project)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      request.input(key, value);
      return `${key} = @${key}`;
    });

  request.input("id", id);

  const query = `UPDATE Projects SET ${fields.join(", ")} OUTPUT INSERTED.* WHERE projectid = @id`;

  const result = await request.query(query);
  return result.recordset;
};


//Delete project
export const deleteProject = async (id: number) => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('id', id)
        .query('DELETE FROM Projects OUTPUT DELETED.* WHERE projectid = @id');
    return { 
        message: 'Project deleted successfully',
        project: result.recordset[0] || null
     };
}
