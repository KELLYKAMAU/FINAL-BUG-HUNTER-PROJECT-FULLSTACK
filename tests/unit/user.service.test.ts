import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as userService from '../../src/services/user.service';
import * as userRepositories from '../../src/Repositories/users.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { NewUser, UpdateUser, User } from '../../src/Types/users.types';

vi.mock('../../src/Repositories/users.repository');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');

describe('user.service', () => {
  const baseUser: User = {
    userid: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password_hash: 'hashed',
    role_user: 'user',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listUsers returns repository data', async () => {
    (userRepositories.getUsers as any).mockResolvedValueOnce([baseUser]);
    const result = await userService.listUsers();
    expect(result).toEqual([baseUser]);
  });

  describe('getUser', () => {
    it('throws for invalid id', async () => {
      await expect(userService.getUser(NaN as any)).rejects.toThrow('Invalid User Id');
    });

    it('returns user when exists', async () => {
      (userRepositories.getUserById as any).mockResolvedValueOnce(baseUser);
      const result = await userService.getUser(1);
      expect(result).toEqual(baseUser);
    });
  });

  describe('createUser', () => {
    const makeNewUser = (overrides: Partial<NewUser> = {}): NewUser =>
      ({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password_hash: 'plain',
        ...overrides,
      } as any);

    it('throws when email already exists', async () => {
      (userRepositories.emailExists as any).mockResolvedValueOnce(true);
      await expect(userService.createUser(makeNewUser())).rejects.toThrow('Email already exists');
    });

    it('hashes password and creates user', async () => {
      (userRepositories.emailExists as any).mockResolvedValueOnce(false);
      (bcrypt.hash as any).mockResolvedValueOnce('hashedpw');
      (userRepositories.createUser as any).mockResolvedValueOnce(baseUser);

      const user = makeNewUser();
      const result = await userService.createUser(user);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(userRepositories.createUser).toHaveBeenCalled();
      expect(result).toEqual(baseUser);
    });
  });

  describe('updateUser', () => {
    const update: UpdateUser = { first_name: 'Jane', password_hash: 'newPlain' } as any;

    it('throws for invalid id', async () => {
      await expect(
        userService.updateUser(NaN as any, update),
      ).rejects.toThrow('Invalid User Id');
    });

    it('hashes password on update and calls repo', async () => {
      (userRepositories.getUserById as any).mockResolvedValueOnce(baseUser);
      (bcrypt.hash as any).mockResolvedValueOnce('newHashed');
      (userRepositories.updateUser as any).mockResolvedValueOnce(baseUser);

      const result = await userService.updateUser(1, update);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPlain', 10);
      expect(userRepositories.updateUser).toHaveBeenCalled();
      expect(result).toEqual(baseUser);
    });
  });

  describe('deleteUser', () => {
    it('throws for invalid id', async () => {
      await expect(userService.deleteUser(NaN as any)).rejects.toThrow('Invaid User Id');
    });

    it('deletes user when exists', async () => {
      (userRepositories.getUserById as any).mockResolvedValueOnce(baseUser);
      (userRepositories.deleteUser as any).mockResolvedValueOnce({ message: 'Deleted' });

      const result = await userService.deleteUser(1);
      expect(userRepositories.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Deleted' });
    });
  });

  describe('loginUser', () => {
    it('throws when user not found', async () => {
      (userRepositories.getUserByEmail as any).mockResolvedValueOnce(null);
      await expect(
        userService.loginUser('no@example.com', 'pw'),
      ).rejects.toThrow('User not found');
    });

    it('throws when password invalid', async () => {
      (userRepositories.getUserByEmail as any).mockResolvedValueOnce(baseUser);
      (bcrypt.compare as any).mockResolvedValueOnce(false);

      await expect(
        userService.loginUser('john@example.com', 'wrong'),
      ).rejects.toThrow('Invalid Credentials');
    });

    it('returns token and user info on success', async () => {
      const envBackup = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'secret';

      (userRepositories.getUserByEmail as any).mockResolvedValueOnce(baseUser);
      (bcrypt.compare as any).mockResolvedValueOnce(true);
      (jwt.sign as any).mockReturnValueOnce('token123');

      const result = await userService.loginUser('john@example.com', 'pw');
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toMatchObject({
        message: 'Login successfull',
        token: 'token123',
        user: {
          userid: baseUser.userid,
          email: baseUser.email,
        },
      });

      process.env.JWT_SECRET = envBackup;
    });
  });
});


