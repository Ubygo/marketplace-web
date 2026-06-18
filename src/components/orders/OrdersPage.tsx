"use client";

import OrderCard from "@/components/orders/OrderCard";
import OrderCardSkeleton from "@/components/orders/OrderCardSkeleton";
import OrderDetailDrawer from "@/components/orders/OrderDetailDrawer";
import OrderStatusTabs from "@/components/orders/OrderStatusTabs";
import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { buildLoginUrl } from "@/lib/auth-url";
import {
  getMyOrders,
  orderMatchesCategoryFilter,
  type OrderCategoryFilter,
} from "@/lib/orders";
import type { Order } from "@/types/order";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface OrdersPageProps {
  initialOrderId?: string | null;
}

export default function OrdersPage({ initialOrderId = null }: OrdersPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug, tenantId } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<OrderCategoryFilter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrderId,
  );

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Paiement réussi");
      router.replace("/commandes", { scroll: false });
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/commandes"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyOrders(slug, tenantId);
      setOrders(data);
    } catch {
      setError("Impossible de charger vos commandes.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadOrders();
  }, [isAuthenticated, loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      orderMatchesCategoryFilter(order, selectedFilter),
    );
  }, [orders, selectedFilter]);

  const handleCloseDrawer = useCallback(() => {
    setSelectedOrderId(null);

    if (searchParams.get("order")) {
      router.replace("/commandes", { scroll: false });
    }
  }, [router, searchParams]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  const showSkeleton = isAuthLoading || isLoading;

  return (
    <main>
      <ContentContainer>
        <h1 className="mb-6 text-2xl font-bold text-black">Vos commandes</h1>

        {!showSkeleton && !error ? (
          <OrderStatusTabs
            orders={orders}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        ) : null}

        {showSkeleton ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-black/60">
            Aucune commande trouvée
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrderId(order.id)}
              />
            ))}
          </div>
        )}
      </ContentContainer>

      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={handleCloseDrawer}
        onOrderUpdated={loadOrders}
      />
    </main>
  );
}
