"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import CategoryIcon from "@/components/categories/CategoryIcon";
import {
  ORDER_DRAWER_BUTTON_DESTRUCTIVE,
  ORDER_DRAWER_BUTTON_OUTLINE,
  ORDER_DRAWER_BUTTON_PRIMARY,
} from "@/components/orders/orderDrawerStyles";
import {
  getVendorNextStatus,
  VENDOR_ACTION_BUTTON_CONFIG,
  type OrderViewerType,
} from "@/constants/orderStatus";
import { useTenant } from "@/contexts/TenantContext";
import { createConversation } from "@/lib/conversations";
import { ORDER_STATUS_LABELS, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/order";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface OrderDetailActionsProps {
  order: Order;
  viewerType?: OrderViewerType;
  onOrderUpdate: () => void;
}

type CustomerPendingAction = "validate" | "needChanges" | "cancel" | null;
type VendorPendingAction = "statusChange" | "cancel" | null;

const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "UPCOMING",
  "IN_PROGRESS",
  "NEED_CHANGES",
];

const CUSTOMER_CONFIRM_CONFIG: Record<
  Exclude<CustomerPendingAction, null>,
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
  viewerType = "customer",
  onOrderUpdate,
}: OrderDetailActionsProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [customerPendingAction, setCustomerPendingAction] =
    useState<CustomerPendingAction>(null);
  const [vendorPendingAction, setVendorPendingAction] =
    useState<VendorPendingAction>(null);

  const orderStatus = order.orderStatus;
  const serviceType = order.service?.serviceType ?? order.serviceType;

  const handleStatusUpdate = async (status: OrderStatus) => {
    setIsLoading(true);

    try {
      await updateOrderStatus(slug, tenantId, order.id, status);
      toast.success("Vous avez mis à jour le statut de la commande.");
      onOrderUpdate();
    } catch {
      toast.error("Impossible de mettre à jour la commande.");
    } finally {
      setIsLoading(false);
      setCustomerPendingAction(null);
      setVendorPendingAction(null);
    }
  };

  const handleContactCustomer = async () => {
    if (!order.user?.id || order.guestUserId) return;

    setIsLoading(true);

    try {
      const conversation = await createConversation(slug, tenantId, {
        userId: order.user.id,
      });
      router.push(`/pro/messages?conversation=${conversation.id}`);
    } catch {
      toast.error("Impossible de contacter le client.");
    } finally {
      setIsLoading(false);
    }
  };

  if (viewerType === "vendor") {
    const vendorButtonConfig =
      orderStatus ? VENDOR_ACTION_BUTTON_CONFIG[orderStatus] : null;
    const nextStatus =
      orderStatus && getVendorNextStatus(orderStatus, serviceType);
    const showVendorStatusButton =
      vendorButtonConfig?.visible && Boolean(nextStatus);
    const showVendorCancel =
      orderStatus &&
      !["IN_REVIEW", "COMPLETED", "CANCELLED", "REFUNDED"].includes(
        orderStatus,
      );
    const canMessageCustomer =
      Boolean(order.user?.id) && !order.guestUserId;

    const nextStatusLabel = nextStatus
      ? (ORDER_STATUS_LABELS[nextStatus] ?? nextStatus)
      : "";

    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          {showVendorCancel ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setVendorPendingAction("cancel")}
              aria-label="Annuler la commande"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white transition-opacity hover:bg-black/[0.03] disabled:opacity-50"
            >
              <CategoryIcon icon="Ionicons/close-outline" size={22} color="#000" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading || !canMessageCustomer}
            onClick={() => void handleContactCustomer()}
            className={`${ORDER_DRAWER_BUTTON_OUTLINE} min-w-0 flex-1`}
          >
            Message
          </button>

          {showVendorStatusButton && vendorButtonConfig ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setVendorPendingAction("statusChange")}
              className={`${ORDER_DRAWER_BUTTON_PRIMARY} min-w-0 flex-1`}
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              {vendorButtonConfig.label}
            </button>
          ) : null}
        </div>

        {vendorPendingAction === "cancel" ? (
          <ConfirmDialog
            open
            title="Annuler la commande"
            description="Voulez-vous vraiment annuler cette commande ?"
            destructive
            isConfirming={isLoading}
            onConfirm={() => void handleStatusUpdate("CANCELLED")}
            onCancel={() => setVendorPendingAction(null)}
          />
        ) : null}

        {vendorPendingAction === "statusChange" && nextStatus ? (
          <ConfirmDialog
            open
            title="Changer le statut"
            description={`Voulez-vous passer cette commande au statut « ${nextStatusLabel} » ?`}
            isConfirming={isLoading}
            onConfirm={() => void handleStatusUpdate(nextStatus)}
            onCancel={() => setVendorPendingAction(null)}
          />
        ) : null}
      </>
    );
  }

  const customerConfirmConfig = customerPendingAction
    ? CUSTOMER_CONFIRM_CONFIG[customerPendingAction]
    : null;

  const handleCustomerConfirm = () => {
    if (!customerPendingAction) return;

    const statusMap: Record<Exclude<CustomerPendingAction, null>, OrderStatus> =
      {
        validate: "COMPLETED",
        needChanges: "NEED_CHANGES",
        cancel: "CANCELLED",
      };

    void handleStatusUpdate(statusMap[customerPendingAction]);
  };

  if (orderStatus === "IN_REVIEW") {
    return (
      <>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setCustomerPendingAction("needChanges")}
            className={ORDER_DRAWER_BUTTON_OUTLINE}
          >
            Demander des modifications
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setCustomerPendingAction("validate")}
            className={ORDER_DRAWER_BUTTON_PRIMARY}
            style={{ backgroundColor: "var(--tenant-primary)" }}
          >
            Valider la commande
          </button>
        </div>
        {customerConfirmConfig ? (
          <ConfirmDialog
            open
            title={customerConfirmConfig.title}
            description={customerConfirmConfig.description}
            destructive={customerConfirmConfig.destructive}
            isConfirming={isLoading}
            onConfirm={handleCustomerConfirm}
            onCancel={() => setCustomerPendingAction(null)}
          />
        ) : null}
      </>
    );
  }

  if (orderStatus && CUSTOMER_CANCELLABLE_STATUSES.includes(orderStatus)) {
    return (
      <>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setCustomerPendingAction("cancel")}
          className={ORDER_DRAWER_BUTTON_DESTRUCTIVE}
        >
          Demander l&apos;annulation
        </button>
        {customerConfirmConfig ? (
          <ConfirmDialog
            open
            title={customerConfirmConfig.title}
            description={customerConfirmConfig.description}
            destructive={customerConfirmConfig.destructive}
            isConfirming={isLoading}
            onConfirm={handleCustomerConfirm}
            onCancel={() => setCustomerPendingAction(null)}
          />
        ) : null}
      </>
    );
  }

  return null;
}
