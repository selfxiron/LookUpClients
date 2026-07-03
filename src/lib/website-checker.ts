import { SOCIAL_DOMAINS } from "./constants";
import type { WebsiteStatus } from "@/generated/prisma/client";

function getHostname(url: string): string | null {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isSocialUrl(url: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;
  return SOCIAL_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

/**
 * Infer status from listed URLs only (no live HTTP).
 * Missing map data must be UNKNOWN — absence of a website tag does not mean no website.
 */
export function inferWebsiteStatus(
  websiteUrl: string | null | undefined,
): { status: WebsiteStatus; url: string | null } {
  if (!websiteUrl?.trim()) {
    return { status: "UNKNOWN", url: null };
  }

  const url = websiteUrl.trim();
  if (isSocialUrl(url)) {
    return { status: "SOCIAL_ONLY", url };
  }

  return { status: "HAS_WEBSITE", url };
}

export async function checkWebsiteStatus(
  websiteUrl: string | null | undefined,
): Promise<{ status: WebsiteStatus; url: string | null }> {
  if (!websiteUrl?.trim()) {
    return { status: "NO_WEBSITE", url: null };
  }

  const url = websiteUrl.trim();

  if (isSocialUrl(url)) {
    return { status: "SOCIAL_ONLY", url };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.startsWith("http") ? url : `https://${url}`, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "LookUpClients/1.0" },
    });

    clearTimeout(timeout);

    if (response.ok || response.status < 500) {
      return { status: "HAS_WEBSITE", url };
    }

    return { status: "UNREACHABLE", url };
  } catch {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url.startsWith("http") ? url : `https://${url}`, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "LookUpClients/1.0" },
      });

      clearTimeout(timeout);

      if (response.ok || response.status < 500) {
        return { status: "HAS_WEBSITE", url };
      }

      return { status: "UNREACHABLE", url };
    } catch {
      return { status: "UNREACHABLE", url };
    }
  }
}
