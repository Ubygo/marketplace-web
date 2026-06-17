import type { Session } from "@/types/auth";

export function buildSessionStorageKey(slug: string): string {
  return `marketplace-web:${slug.trim().toLowerCase()}:session`;
}

export function getStoredSession(slug: string): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildSessionStorageKey(slug));
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function storeSession(slug: string, session: Session): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    buildSessionStorageKey(slug),
    JSON.stringify(session),
  );
}

export function clearStoredSession(slug: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(buildSessionStorageKey(slug));
}

export function getAccessToken(slug: string): string | null {
  return getStoredSession(slug)?.accessToken ?? null;
}
