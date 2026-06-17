import type { Vendor, VendorAvailabilitySlot } from "@/types/vendor";

interface VendorAboutTabProps {
  vendor: Vendor;
  showSectionTitle?: boolean;
  inCard?: boolean;
}

const WEEKDAY_LABELS = [
  "",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function formatSlotLabel(slot: VendorAvailabilitySlot): string {
  const day = WEEKDAY_LABELS[slot.weekDay] ?? `Jour ${slot.weekDay}`;
  return `${day} : ${slot.startTime} - ${slot.endTime}`;
}

function formatAddress(vendor: Vendor): string | null {
  const { location } = vendor;
  if (!location) {
    return null;
  }

  const parts = [
    location.street,
    [location.zipcode, location.city].filter(Boolean).join(" "),
    location.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export default function VendorAboutTab({
  vendor,
  showSectionTitle = false,
  inCard = false,
}: VendorAboutTabProps) {
  const address = formatAddress(vendor);
  const activeSlots =
    vendor.availability?.slots?.filter((slot) => slot.active) ?? [];

  const content = (
    <div className="flex flex-col gap-6">
      {showSectionTitle ? (
        <h2 className="text-xl font-bold text-black">À propos</h2>
      ) : null}

      {vendor.description ? (
        <p className="text-sm leading-relaxed text-black/80">
          {vendor.description}
        </p>
      ) : null}

      {activeSlots.length > 0 ? (
        <section>
          <h3 className="mb-3 text-base font-semibold text-black">Horaires</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {activeSlots.map((slot) => (
              <p
                key={`${slot.weekDay}-${slot.startTime}-${slot.endTime}`}
                className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-black/80"
              >
                {formatSlotLabel(slot)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {vendor.phoneNumber ? (
        <section>
          <h3 className="mb-2 text-base font-semibold text-black">Contact</h3>
          <a
            href={`tel:${vendor.phoneNumber}`}
            className="text-sm font-semibold text-black underline"
          >
            {vendor.phoneNumber}
          </a>
        </section>
      ) : null}

      {address && !showSectionTitle ? (
        <section className="rounded-xl bg-neutral-50 p-4">
          <h3 className="mb-2 text-base font-semibold text-black">Adresse</h3>
          <p className="text-sm text-black/80">{address}</p>
        </section>
      ) : null}

      {address && showSectionTitle ? (
        <section>
          <h3 className="mb-2 text-base font-semibold text-black">Adresse</h3>
          <p className="text-sm text-black/80">{address}</p>
        </section>
      ) : null}
    </div>
  );

  if (inCard) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        {content}
      </section>
    );
  }

  return <div className="py-5">{content}</div>;
}
