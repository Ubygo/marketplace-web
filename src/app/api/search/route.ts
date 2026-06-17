import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");

  if (!tenantId) {
    return NextResponse.json({ error: "Tenant manquant." }, { status: 400 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Requête manquante." }, { status: 400 });
  }

  const params = new URLSearchParams({
    q,
    page: searchParams.get("page") ?? "1",
    limit: searchParams.get("limit") ?? "10",
    type: searchParams.get("type") ?? "all",
  });

  const categoryId = searchParams.get("categoryId");
  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  const res = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "La recherche a échoué." },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}
