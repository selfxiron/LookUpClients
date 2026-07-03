export const AUTH_COOKIE = "lookup_auth";

const AUTH_SALT = "lookup-clients";

export function getAccessPassword(): string | undefined {
  return process.env.APP_ACCESS_PASSWORD?.trim() || undefined;
}

export function isAuthEnabled(): boolean {
  return Boolean(getAccessPassword());
}

export async function createAuthToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:${AUTH_SALT}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAuthToken(
  token: string | undefined,
): Promise<boolean> {
  const password = getAccessPassword();
  if (!password || !token) return false;
  return token === (await createAuthToken(password));
}
