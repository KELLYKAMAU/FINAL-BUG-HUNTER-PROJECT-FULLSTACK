// src/config/mail.ts
import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const mailTransporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

mailTransporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email server connection failed:", error);
  } else {
    console.log("📨 Email server ready to send messages.");
  }
});
