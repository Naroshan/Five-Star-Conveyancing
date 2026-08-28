// Five Star Conveyancing — outbound transactional email via the Microsoft
// Graph API (the client's own Microsoft 365 mailbox, not a third-party email
// API). SMTP AUTH with an app password isn't available on this tenant (app
// passwords are disabled), so this authenticates as an Entra app registration
// via OAuth2 client-credentials and calls Graph's /sendMail endpoint instead.
// Requires MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, and MS_SENDER_EMAIL
// set in the host environment — never hard-coded, same convention as
// DATABASE_URL. The Entra app needs the Mail.Send *application* permission
// with admin consent granted, scoped to send as MS_SENDER_EMAIL.

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let cachedToken: CachedToken | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set — email sending is not configured.`);
  }
  return value;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const tenantId = requireEnv("MS_TENANT_ID");
  const clientId = requireEnv("MS_CLIENT_ID");
  const clientSecret = requireEnv("MS_CLIENT_SECRET");

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain Microsoft Graph access token: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.accessToken;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const senderEmail = requireEnv("MS_SENDER_EMAIL");
  const accessToken = await getAccessToken();

  const message = {
    subject: input.subject,
    body: { contentType: "HTML", content: input.html },
    toRecipients: [{ emailAddress: { address: input.to } }],
    attachments: input.attachments?.map((a) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: a.filename,
      contentBytes: a.content.toString("base64"),
    })),
  };

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ message, saveToSentItems: true }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email via Microsoft Graph: ${response.status} ${await response.text()}`);
  }
}
