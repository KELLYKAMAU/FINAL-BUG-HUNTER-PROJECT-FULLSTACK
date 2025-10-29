
export interface Bug {
  bugid?: number;          // optional for inserts
  project_id: number;
  reported_by: number;
  assigned_to?: number | null;
  title: string;
  description?: string | null;
  severity: 'low'|'medium'|'high'|'critical';
  status: 'open'|'in_progress'|'resolved'|'closed';
  created_at?: Date;
  updated_at?: Date;
}
