import {
  clearStoredSession,
  getAccessToken,
  storeSession,
} from "@/lib/auth-session";
import type {
  AuthError,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Session,
  User,
} from "@/types/auth";

async function parseAuthError(res: Response): Promise<never> {
  const payload = (await res.json().catch(() => null)) as AuthError | null;
  throw new Error(payload?.message ?? "Une erreur est survenue.");
}

async function authFetch(
  slug: string,
  path: string,
  init: RequestInit & { tenantId?: string } = {},
): Promise<Response> {
  const { tenantId, headers, ...rest } = init;
  const token = getAccessToken(slug);

  return fetch(path, {
    ...rest,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

export async function loginUser(
  slug: string,
  tenantId: string,
  credentials: LoginCredentials,
): Promise<Session> {
  const res = await authFetch(slug, "/api/auth/login", {
    method: "POST",
    tenantId,
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    await parseAuthError(res);
  }

  const response = (await res.json()) as AuthResponse;
  const session: Session = {
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: response.expiresAt,
  };

  try {
    const currentUser = await getCurrentUser(slug, tenantId);
    const updatedSession = { ...session, user: currentUser };
    storeSession(slug, updatedSession);
    return updatedSession;
  } catch {
    storeSession(slug, session);
    return session;
  }
}

export async function registerUser(
  slug: string,
  tenantId: string,
  credentials: RegisterCredentials,
): Promise<Session> {
  const res = await authFetch(slug, "/api/auth/register", {
    method: "POST",
    tenantId,
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    await parseAuthError(res);
  }

  const response = (await res.json()) as AuthResponse;
  const session: Session = {
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: response.expiresAt,
  };

  try {
    const currentUser = await getCurrentUser(slug, tenantId);
    const updatedSession = { ...session, user: currentUser };
    storeSession(slug, updatedSession);
    return updatedSession;
  } catch {
    storeSession(slug, session);
    return session;
  }
}

export async function getCurrentUser(
  slug: string,
  tenantId: string,
): Promise<User> {
  const res = await authFetch(slug, "/api/auth/me", {
    method: "GET",
    tenantId,
  });

  if (!res.ok) {
    await parseAuthError(res);
  }

  return res.json();
}

export async function loginWithAccessToken(
  slug: string,
  tenantId: string,
  accessToken: string,
): Promise<Session> {
  clearStoredSession(slug);
  storeSession(slug, {
    user: {
      id: "",
      email: "",
      emailVerified: false,
      phoneVerified: false,
      isActive: true,
    },
    accessToken,
  });

  const currentUser = await getCurrentUser(slug, tenantId);
  const session: Session = { user: currentUser, accessToken };
  storeSession(slug, session);
  return session;
}

export function logoutUser(slug: string): void {
  clearStoredSession(slug);
}
