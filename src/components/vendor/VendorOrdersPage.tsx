"use client";

import OrderDetailDrawer from "@/components/orders/OrderDetailDrawer";
import VendorOrderCard from "@/components/vendor/dashboard/VendorOrderCard";
import VendorPendingApproval from "@/components/vendor/dashboard/VendorPendingApproval";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useTenantVendorMode } from "@/hooks/useTenantVendorMode";
import { useVendorApprovalGate } from "@/hooks/useVendorApprovalGate";
import { buildLoginUrl } from "@/lib/auth-url";
import { fetchVendorOrders } from "@/lib/vendors-me-client";
import type { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type OrderFilter = "all" | "pending" | "completed";

function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  if (filter === "all") return orders;

  return orders.filter((order) => {
    const status = order.orderStatus;

    if (filter === "completed") {
      return (
        status === "CANCELLED" ||
        status === "COMPLETED" ||
        status === "REFUNDED"
      );
    }

    return (
      status === "IN_REVIEW" ||
      status === "PENDING" ||
      status === "UPCOMING"
    );
  });
}

const FILTER_OPTIONS: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "pending", label: "En attente" },
  { id: "completed", label: "Terminées" },
];

export default function VendorOrdersPage() {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();
  const { isPendingApproval } = useVendorApprovalGate();
  const { isPublicVendorSignup } = useTenantVendorMode();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/pro/commandes"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isVendorLoading && !hasVendor) {
      router.replace(isPublicVendorSignup ? "/devenir-prestataire" : "/");
    }
  }, [
    hasVendor,
    isAuthenticated,
    isAuthLoading,
    isPublicVendorSignup,
    isVendorLoading,
    router,
  ]);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchVendorOrders(slug, tenantId);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    if (!isAuthenticated || !hasVendor || isPendingApproval) return;
    void loadOrders();
  }, [hasVendor, isAuthenticated, isPendingApproval, loadOrders]);

  const filteredOrders = useMemo(
    () => filterOrders(orders, filter),
    [orders, filter],
  );

  if (isAuthLoading || isVendorLoading || !isAuthenticated || !hasVendor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  if (isPendingApproval) {
    return <VendorPendingApproval />;
  }

  return (
    <main className="mx-auto w-full max-w-2xl py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Commandes</h1>
        <p className="mt-1 text-sm text-black/60">
          Suivez et gérez vos commandes clients.
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === option.id
                ? "bg-black text-white"
                : "bg-black/5 text-black/70 hover:bg-black/10"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-black/5"
            />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filteredOrders.map((order) => (
            <VendorOrderCard
              key={order.id}
              order={order}
              onClick={() => setSelectedOrderId(order.id)}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-black/15 bg-white p-6 text-center text-sm text-black/60">
          Aucune commande pour le moment.
        </p>
      )}

      <OrderDetailDrawer
        orderId={selectedOrderId}
        viewerType="vendor"
        onClose={() => setSelectedOrderId(null)}
        onOrderUpdated={loadOrders}
      />
    </main>
  );
}
