import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";

  const res = await fetch(
    `${API_BASE_URL}/services/my-services?page=${page}&limit=${limit}`,
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
