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
            .query(`
                SELECT * 
                FROM 
                    Projects 
                WHERE 
                    projectid = @id
            `);
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
            .query(`
                SELECT * 
                FROM 
                    Projects 
                WHERE 
                    title = @title`
            );
            
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
            .query(`
                INSERT INTO 
                    Projects (title, description, created_by, created_at) 
                OUTPUT INSERTED.* 
                VALUES 
                    (@title, @description, @created_by, @created_at)
            `);
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
export const updateProject = async ( id: number, ProjectData: UpdateProject): Promise<{ message: string, project: Project }> => {
    /**
     * Updates an existing project record in the database.
     * 
     * This function dynamically builds the SQL UPDATE query based on the fields provided
     * in the `projectData` object, ensuring only supplied values are updated.
     * It safely binds parameters to prevent SQL injection and returns a success message
     * once the update is complete.
     * 
     * @param id - The unique ID of the project to update.
     * @param projectData - An object containing one or more fields to update (title, description, created_by).
     * @returns A message confirming the successful update of the project.
    */

    try {
        const pool = await getPool();
        

        // build set clause dynamically
        const fields: string[] = [];
        const request = pool.request().input("id", id);

        if (ProjectData.title) {
            fields.push("title = @title");
            request.input("title", ProjectData.title);
        }

        if (ProjectData.description) {
            fields.push("description = @description");
            request.input("description", ProjectData.description);
        }
        if (ProjectData.created_by) {
            fields.push("created_by = @created_by");
            request.input("created_by", ProjectData.created_by);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update");
        }

        const query = `
            UPDATE 
                Projects
            SET 
                ${fields.join(", ")}
            OUTPUT INSERTED.*
            WHERE 
                projectid = @id
        `;

        const result = await request.query(query);

        if (result.recordset.length === 0) {
        throw new Error(`Project with ID ${id} not found`);
        }

        return { 
            message: "Project updated successfully",
            project: result.recordset[0],
        };
    } catch (error) {
        console.error("Error updating project", error)
        throw new Error("Updating Project failed");
    }
}

//Delete project
export const deleteProject = async (id: number): Promise<{ message: string, Project: Project }> => {
    /**
     * Deletes a project by its ID and returns the deleted project details.
     * Uses SQL OUTPUT DELETED.* to return the record that was removed from the database.
    */
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input("id", id)
            .query(`
                DELETE
                FROM 
                    Projects
                OUTPUT INSERTED.*
                WHERE
                    Projectid = @id
                `);

                if (result.recordset.length === 0) {
                    throw new Error("Project not found");
                }
        return { 
            message: "Project deleted successfully",
            Project: result.recordset[0],
         };
    } catch (error) {
        console.error("Error deleting project", error)
        throw new Error ("Deleting project failed");
    }
}
