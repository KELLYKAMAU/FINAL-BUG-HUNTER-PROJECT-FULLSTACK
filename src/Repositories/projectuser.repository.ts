import { getPool } from "../db/config";

export const addMember = async ({
  projectid,
  userid,
  role_in_project,
}: {
  projectid: number;
  userid: number;
  role_in_project: string;
}) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("projectid", projectid)
    .input("userid", userid)
    .input("role_in_project", role_in_project)
    .query(`
      INSERT INTO UserProject (projectid, userid, role_in_project)
      OUTPUT INSERTED.*
      VALUES (@projectid, @userid, @role_in_project);
    `);
  return result.recordset[0];
};
