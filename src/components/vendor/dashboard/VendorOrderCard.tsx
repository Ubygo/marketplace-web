"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { formatOrderPrice, getOrderServiceName, ORDER_STATUS_LABELS } from "@/lib/orders";
import type { Order } from "@/types/order";
import Image from "next/image";

interface VendorOrderCardProps {
  order: Order;
  onClick: () => void;
}

function resolveCustomerName(order: Order): string {
  if (order.user?.firstName || order.user?.lastName) {
    return `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim();
  }

  return order.customerName ?? order.customerEmail ?? "Client invité";
}

function formatCompactSchedule(order: Order): string | null {
  const source = order.scheduledAt ?? order.createdAt;
  if (!source) return null;

  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return null;

  const dayMonth = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);

  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${dayMonth} · ${time}`;
}

export default function VendorOrderCard({ order, onClick }: VendorOrderCardProps) {
  const customerImageUrl = order.user?.photoUrl ?? order.user?.image ?? null;
  const customerName = resolveCustomerName(order);
  const statusLabel = order.orderStatus
    ? (ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus)
    : null;
  const priceLabel = formatOrderPrice(order);
  const scheduleLabel = formatCompactSchedule(order);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-white p-4 text-left transition-opacity hover:opacity-80"
    >
      {customerImageUrl ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          <Image
            src={customerImageUrl}
            alt={customerName}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100">
          <CategoryIcon icon="Ionicons/person-outline" size={24} color={TEXT_COLOR} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-black">
          {getOrderServiceName(order)}
        </p>
        <p className="truncate text-sm text-black/60">{customerName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-black/70">
          {statusLabel ? (
            <span className="rounded-md bg-black/5 px-1.5 py-0.5 font-semibold">
              {statusLabel}
            </span>
          ) : null}
          {priceLabel ? (
            <>
              {statusLabel ? <span className="text-black/30">·</span> : null}
              <span>{priceLabel}</span>
            </>
          ) : null}
          {scheduleLabel ? (
            <>
              <span className="text-black/30">·</span>
              <span className="text-black/50">{scheduleLabel}</span>
            </>
          ) : null}
        </div>
      </div>

      <CategoryIcon icon="Ionicons/chevron-forward" size={20} color={TEXT_COLOR} />
    </button>
  );
}
