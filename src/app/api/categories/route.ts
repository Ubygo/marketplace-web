import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");

  if (!tenantId) {
    return NextResponse.json({ message: "Tenant manquant." }, { status: 400 });
  }

  const res = await fetch(`${API_BASE_URL}/categories?page=1&limit=100`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
  });

  const payload = await res.json().catch(() => ({ data: [] }));
  return NextResponse.json(payload, { status: res.status });
}
