import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { id } = await context.params;
  const date = request.nextUrl.searchParams.get("date");

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  if (!date) {
    return NextResponse.json(
      { message: "Le paramètre date est requis." },
      { status: 400 },
    );
  }

  const res = await fetch(
    `${API_BASE_URL}/services/${id}/available-slots?date=${encodeURIComponent(date)}`,
    {
      headers: {
        Accept: "application/json",
        "X-Tenant-Id": tenantId,
        Authorization: authorization,
      },
    },
  );

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
