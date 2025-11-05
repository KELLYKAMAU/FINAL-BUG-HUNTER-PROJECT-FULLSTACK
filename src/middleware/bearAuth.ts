import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

interface JwtPayload {
  userid: number;
  role: "admin" | "developer" | "tester";
}


export const getAuthUser = (req: Request) => {
  const user = (req as any).user;
  return { userId: user.sub, role: user.role };
};


// Middleware factory for checking roles
export const checkroles = (
  requiredRole: "admin" | "developer" | "tester" | "admin & developer" | "all") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    try {
      // Verify and decode JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      (req as any).user = decoded; // attach to request for later use

      // Role validation
      if (!decoded.role) {
        res.status(401).json({ message: 'Invalid token payload' });
        return;
      }

      // Allow all roles
      if (requiredRole === 'all') {
        next();
        return;
      }

      // Allow admin or developer
      if (requiredRole === 'admin & developer') {
        if (decoded.role === 'admin' || decoded.role === 'developer') {
          next();
          return;
        }
      }

      // Allow specific single roles
      if (decoded.role === requiredRole) {
        next();
        return;
      }

      // Role not authorized
      res.status(403).json({ message: 'Forbidden' });
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

// Role shortcuts for routes
export const adminOnly = checkroles('admin');
export const developerOnly = checkroles('developer');
export const testerOnly = checkroles('tester');
export const allRoles = checkroles('all');
export const adminOrDeveloper = checkroles('admin & developer');
