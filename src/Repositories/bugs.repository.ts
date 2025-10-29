// src/repositories/bugs.repository.ts
import { getPool } from '../db/config';
import * as mssql from 'mssql';
import { Bug } from '../Types/bugs.types';


export class BugsRepository {
  private table = 'Bugs';

  async create(b: Bug) {
    const pool = await getPool();
    const result = await pool.request()

      .input('project_id', mssql.Int, b.project_id)
      .input('reported_by', mssql.Int, b.reported_by)
      .input('assigned_to', mssql.Int, b.assigned_to ?? null)
      .input('title', mssql.VarChar(150), b.title)
      .input('description', mssql.Text, b.description ?? null)
      .input('severity', mssql.VarChar(20), b.severity)
      .input('status', mssql.VarChar(20), b.status)
      .input('created_at', mssql.DateTime, b.created_at ?? new Date())
      .input('updated_at', mssql.DateTime, b.updated_at ?? new Date())
      .query(`
        INSERT INTO ${this.table} (project_id, reported_by, assigned_to, title, description, severity, status, created_at, updated_at)
                
        VALUES (@project_id, @reported_by, @assigned_to, @title, @description, @severity, @status, @created_at, @updated_at)
      `);
    return result.recordset
    
    
  }

  async getAllBugs(): Promise<Bug[]> {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM ${this.table}`);
    return result.recordset;
  }

  async findById(bug_id: number): Promise<Bug | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('bug_id', mssql.Int, bug_id)
      .query(`SELECT * FROM ${this.table} WHERE bug_id = @bug_id`);
    return result.recordset[0] ?? null;
  }

  async findAllByProject(project_id: number): Promise<Bug[]> {
    const pool = await getPool();
    const res = await pool.request()
      .input('project_id', mssql.Int, project_id)
      .query(`SELECT * FROM ${this.table} WHERE project_id = @project_id ORDER BY created_at DESC`);
    return res.recordset || [];
  }

  async update(bugid: number, updates: Partial<Bug>): Promise<void> {
    const pool = await getPool();
    // Build parameterized set clause
    const setClauses: string[] = [];
    const req = pool.request();

    if (updates.assigned_to !== undefined) { req.input('assigned_to', mssql.Int, updates.assigned_to); setClauses.push('assigned_to = @assigned_to'); }
    if (updates.title) { req.input('title', mssql.VarChar(150), updates.title); setClauses.push('title = @title'); }
    if (updates.description !== undefined) { req.input('description', mssql.Text, updates.description); setClauses.push('description = @description'); }
    if (updates.severity) { req.input('severity', mssql.VarChar(20), updates.severity); setClauses.push('severity = @severity'); }
    if (updates.status) { req.input('status', mssql.VarChar(20), updates.status); setClauses.push('status = @status'); }

    req.input('updated_at', mssql.DateTime, new Date());
    setClauses.push('updated_at = @updated_at');

    if (setClauses.length === 0) return; // nothing to update

    const sql = `UPDATE ${this.table} SET ${setClauses.join(', ')} WHERE bugid = @bugid`;
    req.input('bugid', mssql.Int, bugid);
    await req.query(sql);
  }

  async delete(bug_id: number): Promise<void> {
    const pool = await getPool();
    await pool.request().input('bug_id', mssql.Int, bug_id).query(`DELETE FROM ${this.table} WHERE bug_id = @bug_id`);
  }
}
