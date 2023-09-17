import nodemailer from "nodemailer";

export const sendEmail = (to: string, subject: string, text: string) => {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  });
};

export const sendAdminEmail = (subject: string, text: string) => {
  return sendEmail(process.env.EMAIL_ADMIN_TO, subject, text);
};

const getTransporter = () => {
  const host = process.env.SMTP_HOSTNAME;
  const port = process.env?.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_LOGIN;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error("Email is not configured");
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
};
