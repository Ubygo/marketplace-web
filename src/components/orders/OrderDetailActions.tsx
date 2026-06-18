"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  ORDER_DRAWER_BUTTON_DESTRUCTIVE,
  ORDER_DRAWER_BUTTON_OUTLINE,
  ORDER_DRAWER_BUTTON_PRIMARY,
} from "@/components/orders/orderDrawerStyles";
import { useTenant } from "@/contexts/TenantContext";
import { updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/order";
import { useState } from "react";

interface OrderDetailActionsProps {
  order: Order;
  onOrderUpdate: () => void;
}

type PendingAction = "validate" | "needChanges" | "cancel" | null;

const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "UPCOMING",
  "IN_PROGRESS",
  "NEED_CHANGES",
];

const CONFIRM_CONFIG: Record<
  Exclude<PendingAction, null>,
  { title: string; description: string; destructive?: boolean }
> = {
  validate: {
    title: "Valider la prestation",
    description: "Voulez-vous vraiment valider la prestation ?",
  },
  needChanges: {
    title: "Demander des modifications",
    description: "Voulez-vous vraiment demander des modifications ?",
  },
  cancel: {
    title: "Annuler la réservation",
    description: "Voulez-vous vraiment annuler la réservation ?",
    destructive: true,
  },
};

export default function OrderDetailActions({
  order,
  onOrderUpdate,
}: OrderDetailActionsProps) {
  const { slug, tenantId } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const orderStatus = order.orderStatus;

  const handleStatusUpdate = async (status: OrderStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateOrderStatus(slug, tenantId, order.id, status);
      onOrderUpdate();
    } catch {
      setError("Impossible de mettre à jour la commande.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const confirmConfig = pendingAction ? CONFIRM_CONFIG[pendingAction] : null;

  const handleConfirm = () => {
    if (!pendingAction) return;

    const statusMap: Record<Exclude<PendingAction, null>, OrderStatus> = {
      validate: "COMPLETED",
      needChanges: "NEED_CHANGES",
      cancel: "CANCELLED",
    };

    void handleStatusUpdate(statusMap[pendingAction]);
  };

  if (orderStatus === "IN_REVIEW") {
    return (
      <>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setPendingAction("needChanges")}
            className={ORDER_DRAWER_BUTTON_OUTLINE}
          >
            Demander des modifications
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setPendingAction("validate")}
            className={ORDER_DRAWER_BUTTON_PRIMARY}
            style={{ backgroundColor: "var(--tenant-primary)" }}
          >
            Valider la commande
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {confirmConfig ? (
          <ConfirmDialog
            open
            title={confirmConfig.title}
            description={confirmConfig.description}
            destructive={confirmConfig.destructive}
            onConfirm={handleConfirm}
            onCancel={() => setPendingAction(null)}
          />
        ) : null}
      </>
    );
  }

  if (orderStatus && CANCELLABLE_STATUSES.includes(orderStatus)) {
    return (
      <>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setPendingAction("cancel")}
          className={ORDER_DRAWER_BUTTON_DESTRUCTIVE}
        >
          Demander l&apos;annulation
        </button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {confirmConfig ? (
          <ConfirmDialog
            open
            title={confirmConfig.title}
            description={confirmConfig.description}
            destructive={confirmConfig.destructive}
            onConfirm={handleConfirm}
            onCancel={() => setPendingAction(null)}
          />
        ) : null}
      </>
    );
  }

  return null;
}
