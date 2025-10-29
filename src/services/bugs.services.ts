// src/services/bugs.service.ts
import { BugsRepository } from '../Repositories/bugs.repository';
import { Bug } from '../Types/bugs.types';

export class BugsService {
  private repo = new BugsRepository();

  // Create new bug
  async createBug(payload: Bug) {
    if (!payload.title || payload.title.length < 3)
      throw new Error('Title is required and must be at least 3 characters');
    if (!payload.project_id)
      throw new Error('Project ID is required');

    payload.status = payload.status ?? 'open';
    payload.severity = payload.severity ?? 'low';
    payload.created_at = new Date();
    payload.updated_at = new Date();

    const result = await this.repo.create(payload);
    return result;
  }

  // get all bugs
  async getAllBugs(): Promise<Bug[]> {
    const bugs = await this.repo.getAllBugs();
    return bugs;
  }

  //  Get a single bug by ID
  async getBug(bugid: number): Promise<Bug | null> {
    if (!bugid || bugid <= 0) throw new Error('Invalid bug ID');
    const bug = await this.repo.findById(bugid);
    if (!bug) throw new Error(`Bug with ID ${bugid} not found`);
    return bug;
  }

  //  Get all bugs by project (with validation)
  async listByProject(projectid: number): Promise<Bug[]> {
    if (!projectid || projectid <= 0)
      throw new Error('Invalid project ID');

    const bugs = await this.repo.findAllByProject(projectid);

    if (!bugs || bugs.length === 0)
      throw new Error(`No bugs found for project ID ${projectid}`);

    return bugs;
  }

  //  Update an existing bug
  async updateBug(bugid: number, updates: Partial<Bug>): Promise<void> {
    if (!bugid || bugid <= 0)
      throw new Error('Invalid bug ID');

    if (updates.status && !['open', 'in_progress', 'resolved', 'closed'].includes(updates.status))
      throw new Error('Invalid status value');

    await this.repo.update(bugid, updates);
  }

  //  Delete a bug (with safety check)
  async deleteBug(bugid: number): Promise<void> {
    if (!bugid || bugid <= 0)
      throw new Error('Invalid bug ID');

    const bug = await this.repo.findById(bugid);
    if (!bug)
      throw new Error(`Cannot delete — Bug with ID ${bugid} does not exist`);

    await this.repo.delete(bugid);
  }
}
