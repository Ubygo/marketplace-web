"use client";

import {
  ORDER_CATEGORY_KEYS,
  ORDER_CATEGORY_LABELS,
  orderMatchesCategoryFilter,
  type OrderCategoryFilter,
} from "@/lib/orders";
import type { Order } from "@/types/order";
import { useMemo } from "react";

interface OrderStatusTabsProps {
  orders: Order[];
  selectedFilter: OrderCategoryFilter;
  onFilterChange: (filter: OrderCategoryFilter) => void;
}

export default function OrderStatusTabs({
  orders,
  selectedFilter,
  onFilterChange,
}: OrderStatusTabsProps) {
  const counts = useMemo(() => {
    const byCategory: Record<OrderCategoryFilter, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const key of ORDER_CATEGORY_KEYS) {
      byCategory[key] = orders.filter((order) =>
        orderMatchesCategoryFilter(order, key),
      ).length;
    }

    return byCategory;
  }, [orders]);

  return (
    <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-6 border-b border-black/10">
        {ORDER_CATEGORY_KEYS.map((key) => {
          const isActive = selectedFilter === key;
          const count = counts[key] ?? 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              className={`shrink-0 cursor-pointer pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-b-2 text-[var(--tenant-primary)]"
                  : "border-b-2 border-transparent text-black/60 hover:text-black"
              }`}
              style={
                isActive
                  ? { borderBottomColor: "var(--tenant-primary)" }
                  : undefined
              }
            >
              {ORDER_CATEGORY_LABELS[key]}{" "}
              <span className={isActive ? "" : "text-black/50"}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
