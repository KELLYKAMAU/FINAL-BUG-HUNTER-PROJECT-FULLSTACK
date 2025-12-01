import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as projectService from '../../src/services/project.service';
import * as projectRepositories from '../../src/Repositories/projects.repository';
import * as userProjectRepository from '../../src/Repositories/projectuser.repository';
import type { NewProject, Project, UpdateProject } from '../../src/Types/projects.types';

vi.mock('../../src/Repositories/projects.repository');
vi.mock('../../src/Repositories/projectuser.repository');

describe('project.service', () => {
  const baseProject: Project = {
    projectid: 1,
    title: 'Project 1',
    description: 'Test project',
    created_by: 10,
    created_at: new Date(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listProjects', () => {
    it('returns all projects from repository', async () => {
      const projects = [baseProject];
      (projectRepositories.getAllProjects as any).mockResolvedValueOnce(projects);

      const result = await projectService.listProjects();
      expect(result).toEqual(projects);
    });
  });

  describe('getProject', () => {
    it('throws for invalid id', async () => {
      await expect(projectService.getProject(NaN as any)).rejects.toThrow('Invalid projectid');
    });

    it('throws when project not found', async () => {
      (projectRepositories.getProjectById as any).mockResolvedValueOnce(null);
      await expect(projectService.getProject(1)).rejects.toThrow('Project not found');
    });

    it('returns project when found', async () => {
      (projectRepositories.getProjectById as any).mockResolvedValueOnce(baseProject);
      const result = await projectService.getProject(1);
      expect(result).toEqual(baseProject);
    });
  });

  describe('createNewProject', () => {
    const makeNewProject = (overrides: Partial<NewProject> = {}): NewProject =>
      ({
        title: 'New project',
        description: 'desc',
        members: [],
        ...overrides,
      } as any);

    it('throws when title missing', async () => {
      await expect(
        projectService.createNewProject(makeNewProject({ title: '' } as any), { userid: 1 }),
      ).rejects.toThrow('Project title is required');
    });

    it('throws when auth user invalid', async () => {
      await expect(
        projectService.createNewProject(makeNewProject(), { userid: undefined }),
      ).rejects.toThrow('Invalid authenticated user');
    });

    it('creates project and members', async () => {
      const createdProject = { ...baseProject, projectid: 2 };
      (projectRepositories.createNewProject as any).mockResolvedValueOnce({
        project: createdProject,
      });

      const addMemberMock = userProjectRepository.addMember as any;
      addMemberMock.mockResolvedValue(undefined);

      const members = [
        { userid: 2, role: 'developer' },
        { userid: 3, role: 'tester' },
      ];

      const result = await projectService.createNewProject(
        makeNewProject({ members }),
        { userid: 10 },
      );

      expect(projectRepositories.createNewProject).toHaveBeenCalled();
      expect(addMemberMock).toHaveBeenCalledTimes(1 + members.length); // creator + members
      expect(result).toMatchObject({
        message: 'Project created successfully with team members',
        project: createdProject,
      });
    });
  });

  describe('deleteProject', () => {
    it('throws for invalid id', async () => {
      await expect(projectService.deleteProject(NaN as any)).rejects.toThrow('Inavlid userid');
    });

    it('throws when project not found', async () => {
      (projectRepositories.getProjectById as any).mockResolvedValueOnce(null);
      await expect(projectService.deleteProject(1)).rejects.toThrow('Project not found');
    });

    it('returns message and project from repo', async () => {
      (projectRepositories.getProjectById as any).mockResolvedValueOnce(baseProject);
      (projectRepositories.deleteProject as any).mockResolvedValueOnce({
        message: 'Deleted',
        project: baseProject,
      });

      const result = await projectService.deleteProject(1);
      expect(result).toEqual({ message: 'Deleted', project: baseProject });
    });
  });

  describe('updateProject', () => {
    const authUserLead = { userid: 10, role: 'user' };
    const authUserAdmin = { userid: 99, role: 'admin' };

    it('throws for invalid id', async () => {
      await expect(
        projectService.updateProject(NaN as any, {} as UpdateProject, authUserLead),
      ).rejects.toThrow('Invalid project ID');
    });

    it('throws when no data provided', async () => {
      await expect(projectService.updateProject(1, {} as any, authUserLead)).rejects.toThrow(
        'No data provided for update',
      );
    });

    it('throws when project not found', async () => {
      (projectRepositories.getProjectById as any).mockResolvedValueOnce(null);
      await expect(
        projectService.updateProject(
          1,
          { title: 'New' } as UpdateProject,
          authUserLead,
        ),
      ).rejects.toThrow('Project not found');
    });

    it('throws when unauthorized', async () => {
      (projectRepositories.getProjectById as any).mockResolvedValueOnce(baseProject);
      await expect(
        projectService.updateProject(
          1,
          { title: 'New' } as UpdateProject,
          { userid: 999, role: 'user' },
        ),
      ).rejects.toThrow('Unauthorized');
    });

    it('updates project when lead or admin', async () => {
      const updated = { ...baseProject, title: 'Updated' };
      (projectRepositories.getProjectById as any).mockResolvedValue(baseProject);
      (projectRepositories.updateProject as any).mockResolvedValueOnce([updated]);

      const resultLead = await projectService.updateProject(
        1,
        { title: 'Updated' } as UpdateProject,
        authUserLead,
      );
      expect(resultLead).toMatchObject({
        message: 'Project updated successfully',
        project: updated,
      });

      const resultAdmin = await projectService.updateProject(
        1,
        { title: 'Updated' } as UpdateProject,
        authUserAdmin,
      );
      expect(resultAdmin).toMatchObject({
        message: 'Project updated successfully',
        project: updated,
      });
    });
  });
});


