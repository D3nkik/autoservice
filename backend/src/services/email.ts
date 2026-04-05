import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log(`[Email skipped — SMTP not configured] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'АвтоСервис <noreply@autoservice.ru>',
    to,
    subject,
    html,
  });
}
