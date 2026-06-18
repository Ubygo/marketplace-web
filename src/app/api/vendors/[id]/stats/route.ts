import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { id } = await context.params;

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/vendors/${id}/stats${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: authorization,
    },
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
