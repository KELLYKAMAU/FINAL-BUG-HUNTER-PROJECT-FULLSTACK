import { getPool } from "../db/config";
import { Comment, UpdateComment } from "../Types/comments.types";

// Fetch all comments
export const getAllComments = async (): Promise<Comment[]> => {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM Comments");
  return result.recordset;
};

// Get comment by ID
export const getCommentById = async (id: number) => {
  const query = `
    SELECT * FROM Comments WHERE commentid = @id
  `;
  const pool = await getPool();

  const result = await pool.request().input("id", id).query(query);
  return result.recordset[0];
};

// Get comments by bug ID
export const getCommentsByBugId = async (bugid: number): Promise<Comment[] | null> => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("bugid", bugid)
    .query("SELECT * FROM Comments WHERE bugid = @bugid");
  return result.recordset;
};

// Create a new comment
export const createComment = async (comment: Comment): Promise<void> => {
  const pool = await getPool();
  await pool
    .request()
    .input("bugid", comment.bugid)
    .input("userid", comment.userid)
    .input("content", comment.content)
    .query(
      "INSERT INTO Comments (bugid, userid, content, timestamp) VALUES (@bugid, @userid, @content, GETDATE())"
    );
};

// Delete a comment
export const deleteComment = async (commentid: number): Promise<void> => {
  const pool = await getPool();
  await pool
    .request()
    .input("commentid", commentid)
    .query("DELETE FROM Comments WHERE commentid = @commentid");
};

//update comment
export const updateComment = async (
  id: number,
  commentData: UpdateComment
): Promise<{ message: string }> => {
  const pool = await getPool();
  await pool
    .request()
    .input("id", id)
    .input("bugid", commentData.bugid)
    .input("userid", commentData.userid)
    .input("content", commentData.content)
    .query(`
      UPDATE comments 
      SET bug_id = @bugid,
          user_id = @userid,
          content = @content
      WHERE commentid = @id
    `);

  return { message: "Comment updated successfully" };
};

