import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");

  if (!tenantId) {
    return NextResponse.json({ message: "Tenant manquant." }, { status: 400 });
  }

  if (!authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/vendors/me`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: authorization,
    },
  });

  const payload = await res.json().catch(() => ({
    message: "Impossible de charger le profil prestataire.",
  }));

  return NextResponse.json(payload, { status: res.status });
}
