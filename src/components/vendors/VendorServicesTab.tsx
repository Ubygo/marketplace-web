import { formatPrice } from "@/lib/format-price";
import { SECONDARY_TEXT_COLOR, TEXT_COLOR } from "@/constants/theme";
import type { Category } from "@/types/category";
import type { Service } from "@/types/service";
import Image from "next/image";

interface VendorServicesTabProps {
  services: Service[];
  categories: Category[];
  currency: string;
  selectedServiceId?: string | null;
}

function getServiceImage(service: Service): string | undefined {
  const images = service.serviceImages?.length
    ? service.serviceImages
    : service.images;

  return [...(images ?? [])].sort((a, b) => a.order - b.order)[0]?.url;
}

export default function VendorServicesTab({
  services,
  categories,
  currency,
  selectedServiceId,
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
      <p
        className="py-8 text-center text-sm"
        style={{ color: SECONDARY_TEXT_COLOR }}
      >
        Aucun service disponible
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-5">
      {grouped.map(({ category, services: categoryServices }) => (
        <section key={category.id}>
          <h3
            className="mb-3 text-base font-semibold"
            style={{ color: TEXT_COLOR }}
          >
            {category.displayName}
          </h3>
          <div className="flex flex-col gap-3">
            {categoryServices.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                currency={currency}
                selected={selectedServiceId === service.id}
              />
            ))}
          </div>
        </section>
      ))}

      {uncategorized.length > 0 ? (
        <section>
          <h3
            className="mb-3 text-base font-semibold"
            style={{ color: TEXT_COLOR }}
          >
            Autres
          </h3>
          <div className="flex flex-col gap-3">
            {uncategorized.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                currency={currency}
                selected={selectedServiceId === service.id}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ServiceRow({
  service,
  currency,
  selected,
}: {
  service: Service;
  currency: string;
  selected: boolean;
}) {
  const imageUrl = getServiceImage(service);
  const displayCurrency = service.currency
    ? service.currency.toUpperCase()
    : currency;

  return (
    <article
      className="flex items-center gap-3 rounded-xl border bg-white p-3"
      style={{
        borderColor: selected ? TEXT_COLOR : "rgba(0,0,0,0.05)",
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={service.name}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className="h-16 w-16 shrink-0 rounded-xl"
          style={{ backgroundColor: "#F0F0EE" }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold"
          style={{ color: TEXT_COLOR }}
        >
          {service.name}
        </p>
        {service.description ? (
          <p
            className="mt-1 line-clamp-2 text-xs"
            style={{ color: SECONDARY_TEXT_COLOR }}
          >
            {service.description}
          </p>
        ) : null}
      </div>
      {service.price > 0 ? (
        <span
          className="shrink-0 text-sm font-bold"
          style={{ color: TEXT_COLOR }}
        >
          {formatPrice(service.price, displayCurrency)}
        </span>
      ) : null}
    </article>
  );
}
