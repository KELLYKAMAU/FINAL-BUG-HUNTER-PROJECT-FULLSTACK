// src/controllers/bugs.controller.ts
import { Request, Response } from 'express';
import { BugsService } from '../services/bugs.services';

const service = new BugsService();

export class BugsController {
  // 🟢 Create a new bug
  static async create(req: Request, res: Response) {
    try {
      const payload = req.body;
      const id = await service.createBug(payload);
      return res.status(201).json({ bugid: id, message: 'Bug created successfully' });
    } catch (error: any) {
      console.error('Error creating bug:', error.message);
      return res.status(400).json({ error: error.message || 'Failed to create bug' });
    }
  }

  // 🟢 Get a bug by ID
  static async get(req: Request, res: Response) {
    try {
      const bugid = parseInt(req.params.bugid);
      if (isNaN(bugid)) throw new Error('Invalid bug ID');

      const bug = await service.getBug(bugid);
      if (!bug) throw new Error(`Bug with ID ${bugid} not found`);

      return res.status(200).json(bug);
    } catch (error: any) {
      console.error('Error fetching bug:', error.message);
      return res.status(404).json({ error: error.message || 'Failed to retrieve bug' });
    }
  }

  // 🟢 Get all bugs for a project
  static async listByProject(req: Request, res: Response) {
    try {
      const projectid = parseInt(req.params.projectid);
      if (isNaN(projectid)) throw new Error('Invalid project ID');

      const bugs = await service.listByProject(projectid);
      return res.status(200).json(bugs);
    } catch (error: any) {
      console.error('Error listing bugs:', error.message);
      return res.status(404).json({ error: error.message || 'Failed to fetch bugs' });
    }
  }

  // 🟢 Update bug by ID
  static async update(req: Request, res: Response) {
    try {
      const bugid = parseInt(req.params.bugid);
      if (isNaN(bugid)) throw new Error('Invalid bug ID');

      const updates = req.body;
      await service.updateBug(bugid, updates);

      return res.status(200).json({ message: 'Bug updated successfully' });
    } catch (error: any) {
      console.error('Error updating bug:', error.message);
      return res.status(400).json({ error: error.message || 'Failed to update bug' });
    }
  }

  // 🟢 Delete a bug
  static async remove(req: Request, res: Response) {
    try {
      const bugid = parseInt(req.params.bugid);
      if (isNaN(bugid)) throw new Error('Invalid bug ID');

      await service.deleteBug(bugid);
      return res.status(200).json({ message: `Bug with ID ${bugid} deleted successfully` });
    } catch (error: any) {
      console.error('Error deleting bug:', error.message);
      return res.status(400).json({ error: error.message
        || 'Failed to delete bug' });
    }
  }   
}    

export function listbyProject(arg0: string, listbyProject: any) {
    throw new Error('Function not implemented.');
}
export function getBug(arg0: string, getBug: any) {
    throw new Error('Function not implemented.');
}

export function createBug(arg0: string, createBug: any) {
    throw new Error('Function not implemented.');
}

export function updateBug(arg0: string, updateBug: any) {
    throw new Error('Function not implemented.');
}

export function deleteBug(arg0: string, deleteBug: any) {
    throw new Error('Function not implemented.');
}

