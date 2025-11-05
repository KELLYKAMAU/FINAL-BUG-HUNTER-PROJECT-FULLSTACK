// import modules 
import { getPool } from '../db/config'
import { NewUser, UpdateUser, User } from '../Types/users.types';

//get all users
export const getUsers = async (): Promise<User[]> => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Users');
    return result.recordset;
}

//get user by id
export const getUserById = async (id: number): Promise<User[]> => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM Users WHERE userid = @id');
    return result.recordset[0];
};

// get active users only 
export const getActiveUsers = async (): Promise<User[]> => {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Users WHERE is_active = 1');
  return result.recordset;
};

// check if email already exists 
export const emailExists = async (email: string): Promise<boolean> => {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', email)
    .query('SELECT COUNT(*) as count FROM Users WHERE email = @email');
  return result.recordset[0].count > 0;
};

//create new user
export const createUser = async (user: NewUser) => {
    const pool = await getPool();
    await pool
        .request()
        .input('first_name', user.first_name)
        .input('last_name', user.last_name)
        .input('email', user.email)
        .input('role_user', user.role_user)
        .input('password_hash', user.password_hash || 'defaultpasswordhash')
        .input('created_at', new Date())
        .query(`
            INSERT INTO Users 
            (first_name, last_name, email, role_user, password_hash, created_at)
            VALUES (@first_name, @last_name, @email, @role_user, @password_hash, @created_at)
        `);
    return { message: 'User created successfully' };
};



//update a user : the function updates only records provided
export const updateUser = async (id: number, user: UpdateUser) => {
  const pool = await getPool();
  const request = pool.request();

  // Prepare the inputs dynamically
  const fields = Object.entries(user)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      request.input(key, value);
      return `${key} = @${key}`;
    });

  if (fields.length === 0) throw new Error('No fields to update');

  request.input('id', id);

  const query = `UPDATE Users SET ${fields.join(', ')} WHERE userid = @id`;
  await request.query(query);

  return { message: 'User updated successfully' };
};


//delete a user
export const deleteUser = async (id: number) => {
    const pool = await getPool();
    await pool
        .request()
        .input('id', id)
        .query('DELETE FROM Users WHERE userid = @id');
    return { message: 'User deleted successfully' };
}

// get user by email :email used as login credential 
export const getUserByEmail=async(email:string):Promise<User|null>=>{
    const pool = await getPool();
    const result= await pool
    .request()
    .input('email',email)
    .query('SELECT *FROM Users WHERE email=@email')
    return result.recordset[0] || null //available users returned otherwise null
}