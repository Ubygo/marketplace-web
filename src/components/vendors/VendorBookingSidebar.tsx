"use client";

import { useAuth } from "@/contexts/AuthContext";
import { TEXT_COLOR } from "@/constants/theme";
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { buildLoginUrl } from "@/lib/auth-url";
import { formatPrice } from "@/lib/format-price";
import { getPrimaryServiceImageUrl } from "@/lib/service-display";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface VendorBookingSidebarProps {
  vendor: Vendor;
  services: Service[];
  currency: string;
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

function ServiceOption({
  service,
  currency,
  selected,
  onSelect,
}: {
  service: Service;
  currency: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const displayCurrency = service.currency
    ? service.currency.toUpperCase()
    : currency;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
        selected
          ? "bg-[var(--tenant-primary)]/[0.07]"
          : "hover:bg-black/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected
              ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)]"
              : "border-black/20 bg-white"
          }`}
          aria-hidden
        >
          {selected ? (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          ) : null}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold leading-snug text-black">
              {service.name}
            </p>
            {service.price > 0 ? (
              <span className="shrink-0 text-sm font-bold text-black">
                {formatPrice(service.price, displayCurrency)}
              </span>
            ) : null}
          </div>

          {service.serviceType === "BOOKING" && service.duration ? (
            <p className="mt-0.5 text-xs text-black/45">{service.duration} min</p>
          ) : null}

          {selected && service.description ? (
            <p className="mt-2 text-sm leading-relaxed text-black/60">
              {service.description}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export default function VendorBookingSidebar({
  vendor,
  services,
  currency,
  selectedServiceId,
  onSelectService,
}: VendorBookingSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { handleBook, isLoading, isStripeEnabled, paymentModal } =
    useBookingFlow(vendor.id);

  const currentPath =
    searchParams.toString().length > 0
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
  const loginUrl = buildLoginUrl(currentPath);

  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <p className="text-sm text-black/70">
          Aucun service disponible pour le moment.
        </p>
      </div>
    );
  }

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ??
    services[0];
  const displayCurrency = selectedService.currency
    ? selectedService.currency.toUpperCase()
    : currency;
  const isDisabled =
    !isStripeEnabled || selectedService.price <= 0 || isLoading;
  const showPicker = services.length > 1;
  const selectedServiceImageUrl = getPrimaryServiceImageUrl(selectedService);

  return (
    <>
      <div className="flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="shrink-0 px-5 pb-3 pt-5">
          <h2 className="text-lg font-bold text-black">Réserver</h2>
          {showPicker ? (
            <p className="mt-1 text-sm text-black/50">
              {services.length} prestations · choisissez la vôtre
            </p>
          ) : null}
        </div>

        {showPicker ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <div className="flex flex-col gap-0.5">
              {services.map((service) => (
                <ServiceOption
                  key={service.id}
                  service={service}
                  currency={currency}
                  selected={service.id === selectedService.id}
                  onSelect={() => onSelectService(service.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-2 pb-2">
            <ServiceOption
              service={services[0]}
              currency={currency}
              selected
              onSelect={() => onSelectService(services[0].id)}
            />
          </div>
        )}

        {selectedServiceImageUrl ? (
          <div className="shrink-0 px-3 pb-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={selectedServiceImageUrl}
                alt={selectedService.name}
                fill
                className="object-cover"
                sizes="380px"
              />
            </div>
          </div>
        ) : null}

        <div className="shrink-0 space-y-3 border-t border-black/5 bg-neutral-50/80 px-5 py-4">
          {selectedService.price > 0 ? (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-black/50">Total</span>
              <span className="text-2xl font-bold" style={{ color: TEXT_COLOR }}>
                {formatPrice(selectedService.price, displayCurrency)}
              </span>
            </div>
          ) : null}

          {!isStripeEnabled ? (
            <p className="text-sm text-black/60">Paiement indisponible.</p>
          ) : null}

          {isAuthenticated ? (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => void handleBook(selectedService.id)}
              className="block w-full rounded-full py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: TEXT_COLOR }}
            >
              {isLoading ? "Chargement..." : "Réserver"}
            </button>
          ) : (
            <Link
              href={loginUrl}
              className="block w-full rounded-full py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: TEXT_COLOR }}
            >
              Réserver
            </Link>
          )}

          {vendor.phoneNumber ? (
            isAuthenticated ? (
              <a
                href={`tel:${vendor.phoneNumber}`}
                className="block w-full rounded-full border border-black/10 bg-white py-3 text-center text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: TEXT_COLOR }}
              >
                Contacter
              </a>
            ) : (
              <Link
                href={loginUrl}
                className="block w-full rounded-full border border-black/10 bg-white py-3 text-center text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: TEXT_COLOR }}
              >
                Contacter
              </Link>
            )
          ) : null}
        </div>
      </div>
      {paymentModal}
    </>
  );
}
