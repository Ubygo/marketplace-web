import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractTenantFromHost } from "@/lib/tenant";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const detectedTenant = extractTenantFromHost(host);

  const requestHeaders = new Headers(request.headers);
  if (detectedTenant) {
    requestHeaders.set("x-tenant", detectedTenant);
  } else {
    requestHeaders.delete("x-tenant");
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
