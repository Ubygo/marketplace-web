import { getAccessToken } from "@/lib/auth-session";

export async function authenticatedFetch(
  slug: string,
  tenantId: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken(slug);

  if (!token) {
    throw new Error("Non authentifié.");
  }

  return fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
}
