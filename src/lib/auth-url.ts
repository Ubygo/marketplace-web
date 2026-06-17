export function sanitizeRedirect(redirect?: string | null): string | null {
  if (!redirect) {
    return null;
  }

  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return null;
  }

  return redirect;
}

export function buildLoginUrl(redirect?: string | null): string {
  const safeRedirect = sanitizeRedirect(redirect);
  if (!safeRedirect) {
    return "/login";
  }

  return `/login?redirect=${encodeURIComponent(safeRedirect)}`;
}

export function buildRegisterUrl(redirect?: string | null): string {
  const safeRedirect = sanitizeRedirect(redirect);
  if (!safeRedirect) {
    return "/register";
  }

  return `/register?redirect=${encodeURIComponent(safeRedirect)}`;
}

export function buildGoogleLoginUrl(
  tenantId: string,
  redirect?: string | null,
): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  const callbackUrl = new URL("/auth/callback", window.location.origin);

  const safeRedirect = sanitizeRedirect(redirect);
  if (safeRedirect) {
    callbackUrl.searchParams.set("redirect", safeRedirect);
  }

  const params = new URLSearchParams({
    tenantId,
    scheme: window.location.origin,
    redirectUrl: callbackUrl.toString(),
  });

  return `${apiBaseUrl}/auth/google/login?${params.toString()}`;
}

export function parseAuthRedirectUrl(url: string): {
  token?: string;
  error?: string;
} {
  try {
    const parsed = new URL(url);
    return {
      token: parsed.searchParams.get("token") ?? undefined,
      error: parsed.searchParams.get("error") ?? undefined,
    };
  } catch {
    const query = url.split("?")[1];
    if (!query) {
      return {};
    }

    const params = new URLSearchParams(query);
    return {
      token: params.get("token") ?? undefined,
      error: params.get("error") ?? undefined,
    };
  }
}
