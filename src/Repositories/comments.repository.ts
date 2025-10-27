import { getPool } from "../db/config";

export const getAllComments = async () => {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM Comments");
  return result.recordset;
};

export const getCommentById = async (id: number) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("commentid", id)
    .query("SELECT * FROM Comments WHERE commentid = @commentid");
  return result.recordset[0];
};

export const createComment = async (comment: any) => {
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

export const updateComment = async (id: number, content: string) => {
  const pool = await getPool();
  await pool
    .request()
    .input("commentid", id)
    .input("content", content)
    .query(
      "UPDATE Comments SET content = @content, timestamp = GETDATE() WHERE commentid = @commentid"
    );
};

export const deleteComment = async (id: number) => {
  const pool = await getPool();
  await pool
    .request()
    .input("commentid", id)
    .query("DELETE FROM Comments WHERE commentid = @commentid");
};
