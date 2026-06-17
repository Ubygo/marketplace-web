import { headers } from "next/headers";

const RESERVED_SUBDOMAINS = new Set(["www"]);

function stripPort(host: string): string {
  return host.split(":")[0] ?? host;
}

export function extractTenantFromHost(host: string): string | null {
  const hostname = stripPort(host);

  if (!hostname || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.slice(0, -".localhost".length).split(".")[0];
    return subdomain && !RESERVED_SUBDOMAINS.has(subdomain) ? subdomain : null;
  }

  const parts = hostname.split(".");
  if (parts.length < 2) {
    return null;
  }

  const subdomain = parts[0];
  return subdomain && !RESERVED_SUBDOMAINS.has(subdomain) ? subdomain : null;
}

export async function getTenantFromHeaders(): Promise<string | null> {
  return (await headers()).get("x-tenant");
}
