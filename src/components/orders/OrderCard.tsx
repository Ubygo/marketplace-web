import type { Order } from "@/types/order";
import {
  getOrderServiceName,
  ORDER_STATUS_LABELS,
} from "@/lib/orders";
import Image from "next/image";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

function formatOrderDate(order: Order): string {
  const source = order.scheduledAt || order.createdAt;
  if (!source) return "";

  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const imageUrl = order.serviceImage?.url;
  const statusLabel = order.orderStatus
    ? (ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus)
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full cursor-pointer rounded-2xl border border-black/10 bg-white p-4 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex gap-3">
        {imageUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
            <Image
              src={imageUrl}
              alt={getOrderServiceName(order)}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-xl bg-neutral-200" />
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-black">
              {formatOrderDate(order)}
            </p>
            {statusLabel ? (
              <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/70">
                {statusLabel}
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm text-black/70">
            {order.vendor?.name ?? "Prestataire"}
          </p>
          <p className="truncate text-sm font-semibold text-black">
            {getOrderServiceName(order)}
          </p>
        </div>
      </div>
    </button>
  );
}
