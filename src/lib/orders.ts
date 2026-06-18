import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Order, OrderStatus } from "@/types/order";

function extractOrders(payload: unknown): Order[] {
  if (Array.isArray(payload)) {
    return payload as Order[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as Order[];
    }
  }

  return [];
}

function extractOrder(payload: unknown): Order {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Order }).data;
  }

  return payload as Order;
}

export async function getMyOrders(
  slug: string,
  tenantId: string,
): Promise<Order[]> {
  const res = await authenticatedFetch(slug, tenantId, "/api/orders/user");

  if (!res.ok) {
    throw new Error("Impossible de charger les commandes.");
  }

  const payload = await res.json();
  return extractOrders(payload);
}

export async function getOrderById(
  slug: string,
  tenantId: string,
  orderId: string,
): Promise<Order> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/orders/${orderId}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger la commande.");
  }

  const payload = await res.json();
  return extractOrder(payload);
}

export async function updateOrderStatus(
  slug: string,
  tenantId: string,
  orderId: string,
  orderStatus: OrderStatus,
  notes?: string,
): Promise<Order> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus, notes }),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de mettre à jour la commande.");
  }

  const payload = await res.json();
  return extractOrder(payload);
}

export function getOrderServiceName(order: Order): string {
  if (typeof order.serviceName === "string") {
    return order.serviceName;
  }

  if (order.serviceName && typeof order.serviceName === "object") {
    const values = Object.values(order.serviceName);
    if (values[0]) return String(values[0]);
  }

  if (order.metadata?.service?.name) {
    return order.metadata.service.name;
  }

  if (order.service?.name) {
    if (typeof order.service.name === "string") {
      return order.service.name;
    }
    const values = Object.values(order.service.name);
    if (values[0]) return String(values[0]);
  }

  return "Prestation";
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  IN_REVIEW: "En révision",
  NEED_CHANGES: "Modifications demandées",
  UPCOMING: "À venir",
  REFUNDED: "Remboursé",
};

export const ORDER_STATUS_FILTERS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "IN_REVIEW",
  "NEED_CHANGES",
  "UPCOMING",
  "REFUNDED",
];

export type OrderCategoryFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export const ORDER_CATEGORY_KEYS: OrderCategoryFilter[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export const ORDER_CATEGORY_LABELS: Record<OrderCategoryFilter, string> = {
  all: "Toutes",
  pending: "En attente",
  confirmed: "Confirmé",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

export const ORDER_CATEGORY_FILTERS: Record<
  Exclude<OrderCategoryFilter, "all">,
  OrderStatus[]
> = {
  pending: ["PENDING", "UPCOMING", "IN_REVIEW", "NEED_CHANGES"],
  confirmed: ["CONFIRMED"],
  in_progress: ["IN_PROGRESS"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED", "REFUNDED"],
};

export function orderMatchesCategoryFilter(
  order: Order,
  filter: OrderCategoryFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  if (!order.orderStatus) {
    return false;
  }

  return ORDER_CATEGORY_FILTERS[filter].includes(order.orderStatus);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOrderPrice(order: Order): string | null {
  if (!order.paymentRequest) return null;

  const { amount, currency } = order.paymentRequest;
  const normalized = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[normalized];

  if (symbol === "€") {
    return `${formatAmount(amount)}€`;
  }

  if (symbol === "$" || symbol === "£") {
    return `${symbol}${formatAmount(amount)}`;
  }

  if (symbol) {
    return `${formatAmount(amount)} ${symbol}`;
  }

  return `${formatAmount(amount)} ${currency}`;
}

export function formatOrderDateTime(
  order: Order,
  options?: Intl.DateTimeFormatOptions,
): string {
  const source = order.scheduledAt || order.createdAt;
  if (!source) return "—";

  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}
