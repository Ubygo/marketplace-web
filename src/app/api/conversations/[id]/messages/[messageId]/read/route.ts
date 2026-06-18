import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ id: string; messageId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { id, messageId } = await context.params;

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const res = await fetch(
    `${API_BASE_URL}/conversations/${id}/messages/${messageId}/read`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "X-Tenant-Id": tenantId,
        Authorization: authorization,
      },
    },
  );

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
