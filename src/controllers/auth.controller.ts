// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/emailService";

// mock DB – in-memory for now
// (disappears when you restart the server)
type UserRecord = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
};

const users: UserRecord[] = [];

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = users.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: UserRecord = {
      id: users.length + 1,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
    };

    users.push(newUser);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error." });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // EMAIL (fire and forget)
    sendWelcomeEmail(newUser).catch((e) =>
      console.error("Email error:", e)
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// 👇 NEW LOGIN CONTROLLER
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = users.find((u) => u.email === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
