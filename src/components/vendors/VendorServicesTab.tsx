import { formatPrice } from "@/lib/format-price";
import type { Category } from "@/types/category";
import type { Service } from "@/types/service";

interface VendorServicesTabProps {
  services: Service[];
  categories: Category[];
  currency: string;
  selectedServiceId?: string | null;
  onSelectService?: (serviceId: string) => void;
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
  onSelect?: () => void;
}) {
  const displayCurrency = service.currency
    ? service.currency.toUpperCase()
    : currency;

  const content = (
    <div className="flex items-start gap-3">
      {onSelect ? (
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
      ) : null}

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
  );

  if (onSelect) {
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
        {content}
      </button>
    );
  }

  return <div className="rounded-xl px-3 py-3">{content}</div>;
}

export default function VendorServicesTab({
  services,
  categories,
  currency,
  selectedServiceId,
  onSelectService,
}: VendorServicesTabProps) {
  const grouped = categories
    .map((category) => ({
      category,
      services: services.filter(
        (service) => service.categoryId === category.id,
      ),
    }))
    .filter((group) => group.services.length > 0);

  const uncategorized = services.filter(
    (service) =>
      !categories.some((category) => category.id === service.categoryId),
  );

  if (grouped.length === 0 && uncategorized.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-black/50">
        Aucun service disponible
      </p>
    );
  }

  const effectiveSelectedId =
    selectedServiceId ??
    (services.length > 0 ? services[0].id : null);

  const renderServices = (items: Service[]) => (
    <div className="flex flex-col gap-0.5">
      {items.map((service) => (
        <ServiceOption
          key={service.id}
          service={service}
          currency={currency}
          selected={service.id === effectiveSelectedId}
          onSelect={
            onSelectService
              ? () => onSelectService(service.id)
              : undefined
          }
        />
      ))}
    </div>
  );

  return (
    <div id="vendor-services" className="scroll-mt-24 flex flex-col gap-5">
      {grouped.map(({ category, services: categoryServices }) => (
        <section key={category.id}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
            {category.displayName}
          </h3>
          {renderServices(categoryServices)}
        </section>
      ))}

      {uncategorized.length > 0 ? (
        <section>
          {grouped.length > 0 ? (
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">
              Autres
            </h3>
          ) : null}
          {renderServices(uncategorized)}
        </section>
      ) : null}
    </div>
  );
}
