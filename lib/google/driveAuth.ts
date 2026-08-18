import { JWT } from "google-auth-library";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

let cachedClient: JWT | null = null;

export function getDriveAuthClient(): JWT {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must be set to use Drive sync.",
    );
  }

  cachedClient = new JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: [DRIVE_SCOPE],
  });
  return cachedClient;
}
