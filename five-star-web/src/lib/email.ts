// Five Star Conveyancing — outbound transactional email via Resend
// Requires RESEND_API_KEY (and optionally RESEND_FROM_EMAIL, which must be a
// sender address on a domain verified in the Resend dashboard) set in the
// host environment — never hard-coded, same convention as DATABASE_URL.

import { Resend } from "resend";

const DEFAULT_FROM = "Five Star Conveyancing <quotes@fivestarconveyancing.co.uk>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — email sending is not configured.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
}
