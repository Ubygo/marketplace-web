import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { id } = await context.params;

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: authorization,
    },
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { id } = await context.params;

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "PATCH",
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const tenantId = request.headers.get("x-tenant-id");
  const authorization = request.headers.get("authorization");
  const { id } = await context.params;

  if (!tenantId || !authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: authorization,
    },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
