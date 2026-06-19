import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const { id } = await context.params;

  if (!tenantId) {
    return NextResponse.json({ message: "Tenant requis." }, { status: 400 });
  }

  const res = await fetch(`${API_BASE_URL}/vendors/${id}`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    return NextResponse.json({ message: "Prestataire introuvable." }, { status: 404 });
  }

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
