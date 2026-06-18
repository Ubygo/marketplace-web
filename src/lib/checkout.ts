import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Service } from "@/types/service";

export interface CreateOrderRequest {
  customerEmail?: string;
  scheduledAt?: string;
  scheduledDuration?: number;
  bookingLocationId?: string;
  clientLocation?: {
    name: string;
    street: string;
    city: string;
    zipcode: string;
    country: string;
    lng: number;
    lat: number;
  };
  bookingNotes?: string;
}

export interface CreateOrderResponse {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface ServiceAvailabilitiesSummary {
  firstAvailableSlot?: string | null;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  utcStart?: string;
  utcEnd?: string;
  available: boolean;
}

export interface ServiceAvailabilities {
  date: string;
  timezone?: string;
  availableSlots: AvailableSlot[];
}

function extractPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
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
    throw new Error("Impossible de charger le service.");
  }

  const payload = await res.json();
  return extractPayload<Service>(payload);
}

export async function createOrder(
  slug: string,
  tenantId: string,
  serviceId: string,
  orderData: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/${serviceId}/order`,
    {
      method: "POST",
      body: JSON.stringify(orderData),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(" ")
      : typeof rawMessage === "string"
        ? rawMessage
        : "Impossible de créer la commande.";
    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  const payload = await res.json();
  return extractPayload<CreateOrderResponse>(payload);
}

export async function getServiceAvailabilitiesSummary(
  slug: string,
  tenantId: string,
  serviceId: string,
): Promise<ServiceAvailabilitiesSummary> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/${serviceId}/availabilities`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les disponibilités.");
  }

  const payload = await res.json();
  return extractPayload<ServiceAvailabilitiesSummary>(payload);
}

export async function getServiceAvailableSlots(
  slug: string,
  tenantId: string,
  serviceId: string,
  date: string,
): Promise<ServiceAvailabilities> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/services/${serviceId}/available-slots?date=${encodeURIComponent(date)}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les créneaux.");
  }

  const payload = await res.json();
  return extractPayload<ServiceAvailabilities>(payload);
}
