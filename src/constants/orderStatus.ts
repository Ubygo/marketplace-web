import type { OrderStatus } from "@/types/order";

export interface ActionButtonConfig {
  label: string;
  nextStatus?: OrderStatus;
  icon?: "check" | "play";
  visible: boolean;
}

export const VENDOR_ACTION_BUTTON_CONFIG: Partial<
  Record<OrderStatus, ActionButtonConfig>
> = {
  PENDING: {
    label: "Démarrer",
    nextStatus: "IN_PROGRESS",
    visible: true,
  },
  UPCOMING: {
    label: "Démarrer",
    visible: false,
  },
  CONFIRMED: {
    label: "Démarrer",
    nextStatus: "IN_PROGRESS",
    icon: "check",
    visible: true,
  },
  IN_PROGRESS: {
    label: "Terminer",
    nextStatus: "COMPLETED",
    icon: "check",
    visible: true,
  },
  COMPLETED: {
    label: "Terminé",
    visible: false,
  },
  CANCELLED: {
    label: "Annulé",
    visible: false,
  },
  IN_REVIEW: {
    label: "En révision",
    visible: false,
  },
  NEED_CHANGES: {
    label: "Reprendre",
    nextStatus: "IN_PROGRESS",
    icon: "play",
    visible: true,
  },
  REFUNDED: {
    label: "Remboursé",
    visible: false,
  },
};

export function getVendorNextStatus(
  currentStatus: OrderStatus,
  serviceType?: string,
): OrderStatus | undefined {
  const config = VENDOR_ACTION_BUTTON_CONFIG[currentStatus];
  if (!config?.nextStatus) return undefined;

  if (currentStatus === "IN_PROGRESS" && serviceType === "INSTANT") {
    return "IN_REVIEW";
  }

  return config.nextStatus;
}

export type OrderViewerType = "customer" | "vendor";
