"use client";

import { useAuth } from "@/contexts/AuthContext";
import { TEXT_COLOR } from "@/constants/theme";
import { buildLoginUrl } from "@/lib/auth-url";
import { formatPrice } from "@/lib/format-price";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface VendorBookingSidebarProps {
  vendor: Vendor;
  services: Service[];
  currency: string;
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
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

  const currentPath =
    searchParams.toString().length > 0
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
  const loginUrl = buildLoginUrl(currentPath);

  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <p className="text-sm text-black/70">
          Aucun service disponible pour le moment.
        </p>
      </div>
    );
  }

  const activeServiceId = selectedServiceId ?? services[0].id;
  const selectedService =
    services.find((service) => service.id === activeServiceId) ?? services[0];
  const displayCurrency = selectedService.currency
    ? selectedService.currency.toUpperCase()
    : currency;
  const showTabs = services.length > 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      {showTabs ? (
        <div className="flex border-b border-black/5">
          {services.map((service) => {
            const isSelected = service.id === selectedService.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service.id)}
                className="min-w-0 flex-1 truncate px-3 py-3 text-center text-sm font-semibold transition-colors"
                style={{
                  color: isSelected ? TEXT_COLOR : "rgba(0,0,0,0.45)",
                  borderBottom: isSelected
                    ? `2px solid ${TEXT_COLOR}`
                    : "2px solid transparent",
                }}
              >
                {service.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-5">
        {selectedService.price > 0 ? (
          <p className="text-3xl font-bold" style={{ color: TEXT_COLOR }}>
            {formatPrice(selectedService.price, displayCurrency)}
          </p>
        ) : null}

        <div>
          <p className="text-base font-semibold" style={{ color: TEXT_COLOR }}>
            {selectedService.name}
          </p>
          {selectedService.description ? (
            <p
              className="mt-2 line-clamp-4 text-sm leading-relaxed text-black/70"
            >
              {selectedService.description}
            </p>
          ) : null}
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            className="block w-full rounded-full py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: TEXT_COLOR }}
          >
            Réserver
          </button>
        ) : (
          <Link
            href={loginUrl}
            className="block w-full rounded-full py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: TEXT_COLOR }}
          >
            Réserver
          </Link>
        )}

        {vendor.phoneNumber ? (
          isAuthenticated ? (
            <a
              href={`tel:${vendor.phoneNumber}`}
              className="block w-full rounded-full border border-black/10 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: TEXT_COLOR }}
            >
              Contacter
            </a>
          ) : (
            <Link
              href={loginUrl}
              className="block w-full rounded-full border border-black/10 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: TEXT_COLOR }}
            >
              Contacter
            </Link>
          )
        ) : null}
      </div>
    </div>
  );
}
