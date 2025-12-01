// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/emailService";

// mock DB
const users: any[] = [];

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const existing = users.find((u) => u.email === email.toLowerCase());
    if (existing)
      return res.status(400).json({ message: "Email already exists." });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
    };

    users.push(newUser);

    // JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // EMAIL (non-blocking)
    sendWelcomeEmail(newUser).catch((e) =>
      console.error("Email error:", e)
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
