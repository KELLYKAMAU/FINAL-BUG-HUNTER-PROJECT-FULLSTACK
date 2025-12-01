// src/services/emailService.ts
import { mailTransporter } from "../config/mail";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<void> => {
  try {
    await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

// ----------------------
// WELCOME EMAIL
// ----------------------
export const sendWelcomeEmail = async (user: { name: string; email: string }) => {
  const subject = "Welcome to Bug Tracker 🐞";
  const html = `
    <div style="font-family: Arial;">
      <h2>Hello ${user.name},</h2>
      <p>Welcome to <strong>Bug Tracker</strong> — your platform for tracking and resolving issues efficiently.</p>
      <p>Start managing your projects today.</p>
      <p>Regards,<br>Bug Tracker Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text: `Hello ${user.name}, welcome to Bug Tracker!`,
  });
};

// ----------------------
// PASSWORD RESET EMAIL
// ----------------------
export const sendPasswordResetEmail = async (
  user: { name: string; email: string },
  token: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const subject = "Reset your Bug Tracker password";
  const html = `
    <div style="font-family: Arial;">
      <h2>Password Reset</h2>
      <p>Hi ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link is valid for 1 hour.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text: `Reset your password: ${resetUrl}`,
  });
};
