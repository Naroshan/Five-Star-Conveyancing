// Five Star Conveyancing — outbound transactional email via SMTP (the
// client's own Microsoft 365 mailbox, not a third-party email API).
// Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS set in the host
// environment — never hard-coded, same convention as DATABASE_URL. For
// Microsoft 365: host smtp.office365.com, port 587, an app password (SMTP
// AUTH must be enabled for the mailbox in the M365 admin center first).

import nodemailer from "nodemailer";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS must all be set — email sending is not configured.");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  });
}
