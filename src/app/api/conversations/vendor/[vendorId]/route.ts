import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ vendorId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { vendorId } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "100";

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const res = await fetch(
    `${API_BASE_URL}/conversations/vendor/${vendorId}?page=${page}&limit=${limit}`,
    {
      headers: {
        Accept: "application/json",
        "X-Tenant-Id": tenantId,
        Authorization: authorization,
      },
    },
  );

  const payload = await res.json().catch(() => ({ data: [] }));
  return NextResponse.json(payload, { status: res.status });
}
