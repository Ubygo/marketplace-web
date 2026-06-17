import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");

  if (!tenantId) {
    return NextResponse.json({ message: "Tenant manquant." }, { status: 400 });
  }

  const body = await request.json();

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({
    message: "La connexion a échoué.",
  }));

  return NextResponse.json(payload, { status: res.status });
}
