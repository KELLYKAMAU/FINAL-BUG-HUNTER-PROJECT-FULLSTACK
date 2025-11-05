// Full Project type 
export interface Project {
    projectid: number; 
    title: string    
    description?: string;
    created_by: number;
    created_at: Date;
}

// Type for creating a new project
export interface ProjectMember {
  userid: number;
  role: string;
}

export interface NewProject {
  title: string;
  description?: string;
  created_by: number;
  created_at?: Date;
  members?: ProjectMember[]; 
}

// Type for updating an existing project
export interface UpdateProject {
    title?: string;
    description?: string;
    created_by?: number;
}
