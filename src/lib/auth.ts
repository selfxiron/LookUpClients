import { createHash } from "crypto";

export const AUTH_COOKIE = "lookup_auth";

export function getAccessPassword(): string | undefined {
  return process.env.APP_ACCESS_PASSWORD?.trim() || undefined;
}

export function isAuthEnabled(): boolean {
  return Boolean(getAccessPassword());
}

export function createAuthToken(password: string): string {
  return createHash("sha256")
    .update(`${password}:lookup-clients`)
    .digest("hex");
}

export function isValidAuthToken(token: string | undefined): boolean {
  const password = getAccessPassword();
  if (!password || !token) return false;
  return token === createAuthToken(password);
}
