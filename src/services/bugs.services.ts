// src/services/bugs.service.ts
import { BugsRepository } from '../Repositories/bugs.repository';
import { Bug } from '../Types/bugs.types';

export class BugsService {
  private repo = new BugsRepository();

  async createBug(payload: Bug): Promise<number> {
    // Basic validation (extend as needed)
    if (!payload.title || payload.title.length < 3) throw new Error('Title is required and must be >= 3 chars');
    if (!payload.projectid) throw new Error('projectid is required');
    // default status
    payload.status = payload.status ?? 'open';
    payload.severity = payload.severity ?? 'low';
    const id = await this.repo.create(payload);
    return id;
  }

  async getBug(bugid: number): Promise<Bug | null> {
    return this.repo.findById(bugid);
  }

  async listByProject(projectid: number): Promise<Bug[]> {
    return this.repo.findAllByProject(projectid);
  }

  async updateBug(bugid: number, updates: Partial<Bug>): Promise<void> {
    // possible business rules:
    if (updates.status && !['open','in_progress','resolved','closed'].includes(updates.status)) {
      throw new Error('Invalid status');
    }
    await this.repo.update(bugid, updates);
  }

  async deleteBug(bugid: number): Promise<void> {
    // maybe check permissions or archiving
    await this.repo.delete(bugid);
  }
}
