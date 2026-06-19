"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import type { Service } from "@/types/service";
import Image from "next/image";
import Link from "next/link";

interface VendorServiceCardProps {
  service: Service;
  onDelete: (serviceId: string) => void;
}

function getServiceImage(service: Service): string | null {
  const images = service.serviceImages ?? service.images ?? [];
  return images[0]?.url ?? null;
}

export default function VendorServiceCard({
  service,
  onDelete,
}: VendorServiceCardProps) {
  const imageUrl = getServiceImage(service);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
      <Link
        href={`/pro/prestations/${service.id}/modifier`}
        className="flex flex-1 flex-col transition-opacity hover:opacity-90"
      >
        {imageUrl ? (
          <div className="relative aspect-[4/3] w-full bg-neutral-100">
            <Image
              src={imageUrl}
              alt={service.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-100">
            <CategoryIcon icon="Ionicons/briefcase-outline" size={32} color={TEXT_COLOR} />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="line-clamp-2 font-semibold text-black">{service.name}</p>
          <div className="mt-auto flex flex-wrap items-center gap-1.5 text-sm text-black/60">
            {service.serviceType === "BOOKING" && service.duration ? (
              <>
                <span>{service.duration} min</span>
                <span className="text-black/30">·</span>
              </>
            ) : null}
            <span className="font-medium text-[var(--tenant-primary)]">
              {service.price} {service.currency === "EUR" ? "€" : service.currency}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-black/5 px-4 py-2.5">
        <Link
          href={`/pro/prestations/${service.id}/modifier`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/70 transition-colors hover:text-black"
        >
          <CategoryIcon icon="Ionicons/create-outline" size={16} color={TEXT_COLOR} />
          Modifier
        </Link>
        <button
          type="button"
          aria-label="Supprimer la prestation"
          onClick={() => onDelete(service.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-600"
        >
          <CategoryIcon icon="Ionicons/trash-outline" size={16} color="#ef4444" />
          Supprimer
        </button>
      </div>
    </div>
  );
}
