"use client";

import OrderDetailDrawer from "@/components/orders/OrderDetailDrawer";
import VendorOrderCard from "@/components/vendor/dashboard/VendorOrderCard";
import { useTenant } from "@/contexts/TenantContext";
import { fetchVendorOrders } from "@/lib/vendors-me-client";
import type { Order } from "@/types/order";
import { useCallback, useEffect, useState } from "react";

export default function VendorRecentOrders() {
  const { slug, tenantId } = useTenant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchVendorOrders(slug, tenantId);
      setOrders(data.slice(0, 5));
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-black">Commandes récentes</h2>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-black/5"
              />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {orders.map((order) => (
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
      </section>

      <OrderDetailDrawer
        orderId={selectedOrderId}
        viewerType="vendor"
        onClose={() => setSelectedOrderId(null)}
        onOrderUpdated={loadOrders}
      />
    </>
  );
}
