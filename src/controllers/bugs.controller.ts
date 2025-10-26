// src/controllers/bugs.controller.ts
import { Request, Response } from 'express';
import { BugsService } from '../services/bugs.services';

const service = new BugsService();

export class BugsController {
  static async create(req: Request, res: Response) {
    try {
      const payload = req.body;
      const id = await service.createBug(payload);
      return res.status(201).json({ bugid: id, message: 'Bug created' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create bug' });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const bugid = parseInt(req.params.bugid);
      const bug = await service.getBug(bugid);
      if (!bug) return res.status(404).json({ error: 'Bug not found' });
      return res.json(bug);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listByProject(req: Request, res: Response) {
    try {
      const projectid = parseInt(req.params.projectid);
      const list = await service.listByProject(projectid);
      return res.json(list);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const bugid = parseInt(req.params.bugid);
      const updates = req.body;
      await service.updateBug(bugid, updates);
      return res.json({ message: 'Bug updated' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const bugid = parseInt(req.params.bugid);
      await service.deleteBug(bugid);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
