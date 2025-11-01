export interface Comment {
  commentid?: number;      // Auto-incremented
  bugid: number;
  userid: number;
  content: string;
  timestamp?: Date;
}

export interface UpdateComment {
  commentid: number;      
  bugid: number;
  userid: number;
  content: string;
  timestamp?: Date;
}
