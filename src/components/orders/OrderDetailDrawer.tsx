"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import OrderDetailActions from "@/components/orders/OrderDetailActions";
import OrderDetailSkeleton from "@/components/orders/OrderDetailSkeleton";
import { ORDER_DRAWER_BUTTON_PRIMARY } from "@/components/orders/orderDrawerStyles";
import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { createConversation } from "@/lib/conversations";
import {
  formatOrderDateTime,
  formatOrderPrice,
  getOrderById,
  getOrderServiceName,
  ORDER_STATUS_LABELS,
} from "@/lib/orders";
import { fetchVendorByIdClient } from "@/lib/vendors-client";
import { getVendorImageUrl } from "@/lib/vendor-display";
import type { OrderViewerType } from "@/constants/orderStatus";
import type { Order } from "@/types/order";
import type { Vendor } from "@/types/vendor";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface OrderDetailDrawerProps {
  orderId: string | null;
  viewerType?: OrderViewerType;
  onClose: () => void;
  onOrderUpdated: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-black/60">{label}</dt>
      <dd className="text-right text-sm font-semibold text-black">{value}</dd>
    </div>
  );
}

function mergeVendorIntoOrder(order: Order, vendor: Vendor): Order {
  return {
    ...order,
    vendor: {
      id: vendor.id,
      name: vendor.name ?? order.vendor?.name,
      description: vendor.description ?? order.vendor?.description,
      phoneNumber: vendor.phoneNumber ?? order.vendor?.phoneNumber,
      photo: vendor.photo ?? order.vendor?.photo,
      images: vendor.images ?? order.vendor?.images,
      vendorImages: vendor.vendorImages ?? order.vendor?.vendorImages,
    },
  };
}

function resolveVendorImageUrl(
  order: Order,
  vendorDetails: Vendor | null,
): string | null {
  if (vendorDetails) {
    return getVendorImageUrl(vendorDetails) ?? null;
  }

  return (
    order.vendor?.photo ??
    order.vendor?.images?.[0]?.url ??
    order.vendor?.vendorImages?.[0]?.url ??
    null
  );
}

function resolveCustomerName(order: Order): string {
  if (order.user?.firstName || order.user?.lastName) {
    return `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim();
  }

  return order.customerName ?? order.customerEmail ?? "Client invité";
}

function resolveCustomerImageUrl(order: Order): string | null {
  return order.user?.photoUrl ?? order.user?.image ?? null;
}

export default function OrderDetailDrawer({
  orderId,
  viewerType = "customer",
  onClose,
  onOrderUpdated,
}: OrderDetailDrawerProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const [order, setOrder] = useState<Order | null>(null);
  const [vendorDetails, setVendorDetails] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContacting, setIsContacting] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);
    setVendorDetails(null);

    try {
      let data = await getOrderById(slug, tenantId, orderId);
      const vendorId = data.vendor?.id;

      if (vendorId && viewerType === "customer") {
        const hasVendorImage = Boolean(
          data.vendor?.photo ||
          data.vendor?.images?.[0]?.url ||
          data.vendor?.vendorImages?.[0]?.url,
        );

        if (!hasVendorImage || !data.vendor?.description) {
          try {
            const vendor = await fetchVendorByIdClient(
              slug,
              tenantId,
              vendorId,
            );
            if (vendor) {
              setVendorDetails(vendor);
              data = mergeVendorIntoOrder(data, vendor);
            }
          } catch {
            // Keep order data if vendor fetch fails.
          }
        }
      }

      setOrder(data);
    } catch {
      setError("Impossible de charger cette commande.");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, slug, tenantId, viewerType]);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setVendorDetails(null);
      setError(null);
      return;
    }

    void loadOrder();
  }, [orderId, loadOrder]);

  useEffect(() => {
    if (!orderId) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [orderId, onClose]);

  const handleOrderUpdate = useCallback(() => {
    void loadOrder();
    onOrderUpdated();
  }, [loadOrder, onOrderUpdated]);

  const handleContactVendor = async () => {
    const vendorId = order?.vendor?.id;
    if (!vendorId) return;

    setIsContacting(true);

    try {
      const conversation = await createConversation(slug, tenantId, {
        vendorId,
      });
      onClose();
      router.push(`/messages?conversation=${conversation.id}`);
    } catch {
      setError("Impossible de contacter le prestataire.");
    } finally {
      setIsContacting(false);
    }
  };

  if (!orderId) {
    return null;
  }

  const statusLabel = order?.orderStatus
    ? (ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus)
    : "—";
  const priceLabel = order ? formatOrderPrice(order) : null;
  const vendorImageUrl = order
    ? resolveVendorImageUrl(order, vendorDetails)
    : null;
  const vendorName = order?.vendor?.name ?? "Prestataire";
  const vendorDescription =
    vendorDetails?.description ?? order?.vendor?.description ?? null;
  const showReviewButton =
    viewerType === "customer" &&
    order?.orderStatus === "COMPLETED" &&
    !order.hasReview &&
    Boolean(order.vendor?.id);
  const customerName = order ? resolveCustomerName(order) : "Client";
  const customerImageUrl = order ? resolveCustomerImageUrl(order) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 animate-overlay-in cursor-pointer bg-black/40"
        onClick={onClose}
      />

      <aside className="relative z-10 flex h-full w-full max-w-none animate-drawer-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 md:w-[45%] md:max-w-[45vw] md:min-w-[22rem]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="min-h-[3.25rem]">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-28 animate-pulse rounded-full bg-neutral-200" />
                <div className="h-4 w-36 animate-pulse rounded-full bg-neutral-200" />
              </div>
            ) : (
              <>
                {order?.orderNumber ? (
                  <p className="text-lg font-bold text-black">
                    #{order.orderNumber}
                  </p>
                ) : null}
                <p className="text-sm text-black/60">Détails de la commande</p>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5"
          >
            <CategoryIcon icon="Ionicons/close" size={24} color={TEXT_COLOR} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <OrderDetailSkeleton />
          ) : error || !order ? (
            <p className="text-sm text-red-600">
              {error ?? "Commande introuvable."}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              <section>
                <h2 className="mb-3 text-sm font-semibold text-black/60">
                  Prestation
                </h2>
                <div className="flex items-center gap-3">
                  {order.serviceImage?.url ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                      <Image
                        src={order.serviceImage.url}
                        alt={getOrderServiceName(order)}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-neutral-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black">
                      {getOrderServiceName(order)}
                    </p>
                  </div>
                  {priceLabel ? (
                    <p className="shrink-0 text-sm font-bold text-black">
                      {priceLabel}
                    </p>
                  ) : null}
                </div>
              </section>

              <section>
                <h2 className="mb-1 text-sm font-semibold text-black/60">
                  Informations
                </h2>
                <dl>
                  <InfoRow
                    label="Créée le"
                    value={formatOrderDateTime(order, {
                      hour: undefined,
                      minute: undefined,
                    })}
                  />
                  <InfoRow label="Statut" value={statusLabel} />
                  {order.bookingNotes ? (
                    <InfoRow label="Notes" value={order.bookingNotes} />
                  ) : null}
                </dl>
              </section>

              {viewerType === "vendor" && (order.user || order.customerName || order.customerEmail) ? (
                <section className="rounded-2xl bg-black/[0.03] p-4">
                  <h2 className="mb-3 text-sm font-semibold text-black/60">
                    Client
                  </h2>
                  <div className="flex items-center gap-3">
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                        <CategoryIcon
                          icon="Ionicons/person-outline"
                          size={24}
                          color={TEXT_COLOR}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-black">
                        {customerName}
                      </p>
                      {order.customerEmail ? (
                        <p className="truncate text-xs text-black/60">
                          {order.customerEmail}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}

              {viewerType === "customer" && order.vendor ? (
                <section className="rounded-2xl bg-black/[0.03] p-4">
                  <h2 className="mb-3 text-sm font-semibold text-black/60">
                    Prestataire
                  </h2>
                  <div className="flex items-center gap-3">
                    {order.vendor.id ? (
                      <Link
                        href={`/vendors/${order.vendor.id}`}
                        onClick={onClose}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl transition-opacity hover:opacity-80"
                      >
                        {vendorImageUrl ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                            <Image
                              src={vendorImageUrl}
                              alt={vendorName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                            <CategoryIcon
                              icon="MaterialIcons/store"
                              size={24}
                              color={TEXT_COLOR}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-black">
                            {vendorName}
                          </p>
                          {vendorDescription ? (
                            <p className="line-clamp-2 text-xs text-black/60">
                              {vendorDescription}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {vendorImageUrl ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                            <Image
                              src={vendorImageUrl}
                              alt={vendorName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                            <CategoryIcon
                              icon="MaterialIcons/store"
                              size={24}
                              color={TEXT_COLOR}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-black">
                            {vendorName}
                          </p>
                          {vendorDescription ? (
                            <p className="line-clamp-2 text-xs text-black/60">
                              {vendorDescription}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Envoyer un message"
                      disabled={isContacting}
                      onClick={() => void handleContactVendor()}
                      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white transition-opacity hover:bg-black/[0.03] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CategoryIcon
                        icon="Ionicons/chatbubble-outline"
                        size={22}
                        color={TEXT_COLOR}
                      />
                    </button>
                  </div>
                  {showReviewButton && order.vendor.id ? (
                    <Link
                      href={`/vendors/${order.vendor.id}`}
                      onClick={onClose}
                      className={`${ORDER_DRAWER_BUTTON_PRIMARY} mt-3`}
                      style={{ backgroundColor: "var(--tenant-primary)" }}
                    >
                      Donner un avis
                    </Link>
                  ) : null}
                </section>
              ) : null}

              <section>
                <OrderDetailActions
                  order={order}
                  viewerType={viewerType}
                  onOrderUpdate={handleOrderUpdate}
                />
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
