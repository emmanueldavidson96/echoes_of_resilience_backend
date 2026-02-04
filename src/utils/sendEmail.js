import nodemailer from 'nodemailer';

const buildTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'gmail';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service,
    auth: {
      user,
      pass
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = buildTransporter();

  if (!transporter) {
    console.warn('Email credentials not configured. Skipping email send.');
    return false;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });

  return true;
};

export default sendEmail;
