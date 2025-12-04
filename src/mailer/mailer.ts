import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
export const sendMail = async (to: string, subject: string, html?: string) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html: html 
  };

  try {
   const mailRes = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully', mailRes);
    if (mailRes.accepted.length > 0) return "Email sent successfully";
    if (mailRes.rejected.length > 0) return "Email not sent";
    return "Email server rejected the email";
 } catch (error:any) {
  return JSON.stringify({message: error.message} );     
  }
};