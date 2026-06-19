import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type {
  CreateServiceRequest,
  PaginatedServicesResponse,
  Service,
} from "@/types/service";

function normalizeService(payload: unknown): Service {
  if (!payload || typeof payload !== "object") {
    return payload as Service;
  }

  const obj = payload as Record<string, unknown>;
  return (obj.data ?? obj) as Service;
}

function extractServices(payload: unknown): Service[] {
  if (Array.isArray(payload)) {
    return payload as Service[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as PaginatedServicesResponse).data;
    if (Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

export async function fetchMyServices(
  slug: string,
  tenantId: string,
  page = 1,
  limit = 50,
): Promise<Service[]> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/my-services?page=${page}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger vos prestations.");
  }

  const payload = await res.json();
  return extractServices(payload);
}

export async function fetchServiceById(
  slug: string,
  tenantId: string,
  serviceId: string,
): Promise<Service> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/${serviceId}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger la prestation.");
  }

  const payload = await res.json();
  return normalizeService(payload);
}

export async function createService(
  slug: string,
  tenantId: string,
  data: CreateServiceRequest,
): Promise<Service> {
  const res = await authenticatedFetch(slug, tenantId, "/api/services", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Impossible de créer la prestation.");
  }

  const payload = await res.json();
  return normalizeService(payload);
}

export async function updateService(
  slug: string,
  tenantId: string,
  serviceId: string,
  data: Partial<CreateServiceRequest>,
): Promise<Service> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/${serviceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de mettre à jour la prestation.");
  }

  const payload = await res.json();
  return normalizeService(payload);
}

export async function deleteService(
  slug: string,
  tenantId: string,
  serviceId: string,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/${serviceId}`,
    { method: "DELETE" },
  );

  if (!res.ok) {
    throw new Error("Impossible de supprimer la prestation.");
  }
}
