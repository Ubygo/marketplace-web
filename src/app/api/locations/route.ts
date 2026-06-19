import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/locations`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: authorization,
    },
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(`${API_BASE_URL}/locations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
