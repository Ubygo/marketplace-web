import OrdersPage from "@/components/orders/OrdersPage";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CommandesPage({ searchParams }: PageProps) {
  const { order } = await searchParams;

  return (
    <Suspense fallback={null}>
      <OrdersPage initialOrderId={order ?? null} />
    </Suspense>
  );
}
