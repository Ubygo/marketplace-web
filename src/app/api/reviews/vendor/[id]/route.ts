import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const { id: vendorId } = await context.params;

  if (!tenantId) {
    return NextResponse.json({ error: "Tenant manquant." }, { status: 400 });
  }

  const res = await fetch(`${API_BASE_URL}/reviews/vendor/${vendorId}`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Impossible de charger les avis." },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}
