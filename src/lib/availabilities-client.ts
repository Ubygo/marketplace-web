import { authenticatedFetch } from "@/lib/authenticated-fetch";
import {
  matchesWeekDay,
  normalizeApiWeekDay,
  toApiWeekDay,
} from "@/lib/availability-weekday";

export const DEFAULT_AVAILABILITY_NAME = "Standard Business Hours";

export interface Availability {
  id: string;
  name: string;
  vendorId?: string;
  timezone: string;
}

export interface AvailabilitySlot {
  id: string;
  weekDay: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface VendorAvailabilityData {
  availabilityId: string | null;
  slots: AvailabilitySlot[];
}

function extractPayload(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }

  return payload;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return fallback;
  }

  const message = (payload as { message: unknown }).message;

  if (Array.isArray(message)) {
    return message.map(String).join(" ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
}

function normalizeAvailability(raw: unknown): Availability | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = record.id ?? record.availabilityId;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    id: String(id),
    name:
      typeof record.name === "string"
        ? record.name
        : DEFAULT_AVAILABILITY_NAME,
    vendorId:
      typeof record.vendorId === "string" ? record.vendorId : undefined,
    timezone:
      typeof record.timezone === "string"
        ? record.timezone
        : Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function normalizeTime(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "09:00";
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return trimmed.slice(0, 5);
  }

  const hours = String(Number(match[1])).padStart(2, "0");
  const minutes = match[2];
  return `${hours}:${minutes}`;
}

function normalizeSlot(raw: unknown): AvailabilitySlot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const slot = raw as Record<string, unknown>;
  const id = slot.id ?? slot.slotId ?? slot.availabilitySlotId;
  const weekDay = slot.weekDay ?? slot.weekday ?? slot.dayOfWeek;

  if (id === undefined || id === null || weekDay === undefined) {
    return null;
  }

  return {
    id: String(id),
    weekDay: normalizeApiWeekDay(Number(weekDay)),
    startTime: normalizeTime(slot.startTime ?? slot.start),
    endTime: normalizeTime(slot.endTime ?? slot.end),
    active: slot.active !== false,
  };
}

function extractSlots(payload: unknown): AvailabilitySlot[] {
  const data = extractPayload(payload);

  if (Array.isArray(data)) {
    return data
      .map(normalizeSlot)
      .filter((slot): slot is AvailabilitySlot => slot !== null);
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const nested = record.slots ?? record.availabilitySlots ?? record.items;

    if (Array.isArray(nested)) {
      return nested
        .map(normalizeSlot)
        .filter((slot): slot is AvailabilitySlot => slot !== null);
    }
  }

  return [];
}

function extractAvailabilityId(payload: unknown): string | null {
  const normalized = normalizeAvailability(extractPayload(payload) ?? payload);
  return normalized?.id ?? null;
}

export async function fetchAvailabilitiesList(
  slug: string,
  tenantId: string,
): Promise<Availability[]> {
  const res = await authenticatedFetch(slug, tenantId, "/api/availabilities");

  if (!res.ok) {
    throw new Error("Impossible de charger les disponibilités.");
  }

  const payload = await res.json();
  const data = extractPayload(payload);

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(normalizeAvailability)
    .filter((item): item is Availability => item !== null);
}

async function fetchAvailabilitySlots(
  slug: string,
  tenantId: string,
  availabilityId: string,
): Promise<AvailabilitySlot[]> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/availabilities/${availabilityId}/slots`,
  );

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error("Impossible de charger les créneaux.");
  }

  const payload = await res.json();
  return extractSlots(payload);
}

export async function loadVendorAvailabilityData(
  slug: string,
  tenantId: string,
): Promise<VendorAvailabilityData> {
  const availabilities = await fetchAvailabilitiesList(slug, tenantId);

  if (availabilities.length === 0) {
    return { availabilityId: null, slots: [] };
  }

  const availabilityId = availabilities[0].id;
  const slots = await fetchAvailabilitySlots(slug, tenantId, availabilityId);

  return { availabilityId, slots };
}

export async function ensureDefaultAvailability(
  slug: string,
  tenantId: string,
): Promise<string> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const res = await authenticatedFetch(slug, tenantId, "/api/availabilities", {
    method: "POST",
    body: JSON.stringify({
      name: DEFAULT_AVAILABILITY_NAME,
      timezone,
    }),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(payload, "Impossible de créer les disponibilités."),
    );
  }

  const payload = await res.json();
  const availabilityId = extractAvailabilityId(payload);

  if (!availabilityId) {
    throw new Error("Réponse de création de disponibilité invalide.");
  }

  return availabilityId;
}

export async function createAvailabilitySlot(
  slug: string,
  tenantId: string,
  availabilityId: string,
  slot: Omit<AvailabilitySlot, "id">,
): Promise<AvailabilitySlot> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/availabilities/${availabilityId}/slots`,
    {
      method: "POST",
      body: JSON.stringify({
        weekDay: toApiWeekDay(slot.weekDay),
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: slot.active,
      }),
    },
  );

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(payload, "Impossible de créer le créneau."),
    );
  }

  const payload = await res.json();
  const created = normalizeSlot(extractPayload(payload) ?? payload);

  if (!created) {
    throw new Error("Réponse de création de créneau invalide.");
  }

  return created;
}

export async function updateAvailabilitySlot(
  slug: string,
  tenantId: string,
  slotId: string,
  slot: Omit<AvailabilitySlot, "id">,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/availabilities/slots/${slotId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        weekDay: toApiWeekDay(slot.weekDay),
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: slot.active,
      }),
    },
  );

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(payload, "Impossible de mettre à jour le créneau."),
    );
  }
}

export async function deleteAvailabilitySlot(
  slug: string,
  tenantId: string,
  slotId: string,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/availabilities/slots/${slotId}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok && res.status !== 204) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(payload, "Impossible de supprimer le créneau."),
    );
  }
}

export function isTemporarySlotId(id: string): boolean {
  return id.startsWith("temp-");
}

export interface AvailabilityDiff {
  toCreate: Omit<AvailabilitySlot, "id">[];
  toUpdate: AvailabilitySlot[];
  toDelete: string[];
}

export function computeAvailabilityDiff(
  savedSlots: AvailabilitySlot[],
  currentSlots: AvailabilitySlot[],
): AvailabilityDiff {
  const savedById = new Map(savedSlots.map((slot) => [slot.id, slot]));
  const currentPersisted = currentSlots.filter(
    (slot) => !isTemporarySlotId(slot.id),
  );
  const currentIds = new Set(currentPersisted.map((slot) => slot.id));

  const toDelete = savedSlots
    .filter((slot) => !currentIds.has(slot.id))
    .map((slot) => slot.id);

  const toCreate: Omit<AvailabilitySlot, "id">[] = [];
  const toUpdate: AvailabilitySlot[] = [];

  for (const slot of currentSlots) {
    if (isTemporarySlotId(slot.id)) {
      toCreate.push({
        weekDay: slot.weekDay,
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: slot.active,
      });
      continue;
    }

    const saved = savedById.get(slot.id);
    if (!saved) {
      continue;
    }

    if (
      saved.weekDay !== slot.weekDay ||
      saved.startTime !== slot.startTime ||
      saved.endTime !== slot.endTime ||
      saved.active !== slot.active
    ) {
      toUpdate.push(slot);
    }
  }

  return { toCreate, toUpdate, toDelete };
}

export async function saveAvailabilityDiff(
  slug: string,
  tenantId: string,
  availabilityId: string,
  diff: AvailabilityDiff,
): Promise<void> {
  for (const slotId of diff.toDelete) {
    await deleteAvailabilitySlot(slug, tenantId, slotId);
  }

  for (const slot of diff.toCreate) {
    await createAvailabilitySlot(slug, tenantId, availabilityId, slot);
  }

  for (const slot of diff.toUpdate) {
    await updateAvailabilitySlot(slug, tenantId, slot.id, slot);
  }
}

export { matchesWeekDay };

export async function hasConfiguredAvailabilities(
  slug: string,
  tenantId: string,
): Promise<boolean> {
  try {
    const availabilities = await fetchAvailabilitiesList(slug, tenantId);

    if (availabilities.length === 0) {
      return false;
    }

    const slots = await fetchAvailabilitySlots(
      slug,
      tenantId,
      availabilities[0].id,
    );

    return slots.some((slot) => slot.active);
  } catch {
    return false;
  }
}
