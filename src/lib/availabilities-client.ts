import { authenticatedFetch } from "@/lib/authenticated-fetch";

export interface Availability {
  id: string;
  name?: string;
  timezone?: string;
}

export interface AvailabilitySlot {
  id: string;
  weekDay: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

function extractAvailabilities(payload: unknown): Availability[] {
  if (Array.isArray(payload)) {
    return payload as Availability[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as Availability[];
    }
  }

  return [];
}

function extractSlots(payload: unknown): AvailabilitySlot[] {
  if (Array.isArray(payload)) {
    return payload as AvailabilitySlot[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as AvailabilitySlot[];
    }
  }

  return [];
}

export async function fetchAvailabilities(
  slug: string,
  tenantId: string,
): Promise<Availability[]> {
  const res = await authenticatedFetch(slug, tenantId, "/api/availabilities");

  if (!res.ok) {
    throw new Error("Impossible de charger les disponibilités.");
  }

  const payload = await res.json();
  return extractAvailabilities(payload);
}

export async function fetchAvailabilitySlots(
  slug: string,
  tenantId: string,
  availabilityId: string,
): Promise<AvailabilitySlot[]> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/availabilities/${availabilityId}/slots`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les créneaux.");
  }

  const payload = await res.json();
  return extractSlots(payload);
}

export async function hasConfiguredAvailabilities(
  slug: string,
  tenantId: string,
): Promise<boolean> {
  try {
    const availabilities = await fetchAvailabilities(slug, tenantId);
    if (availabilities.length === 0) return false;

    const slots = await fetchAvailabilitySlots(
      slug,
      tenantId,
      availabilities[0].id,
    );
    return slots.length > 0;
  } catch {
    return false;
  }
}
