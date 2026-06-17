"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { SECONDARY_TEXT_COLOR, TEXT_COLOR } from "@/constants/theme";
import Image from "next/image";
import Link from "next/link";

interface SearchResultRowProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href?: string;
}

export default function SearchResultRow({
  title,
  subtitle,
  imageUrl,
  href,
}: SearchResultRowProps) {
  const content = (
    <>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className="h-14 w-14 shrink-0 rounded-xl"
          style={{ backgroundColor: "#F0F0EE" }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-base font-semibold"
          style={{ color: TEXT_COLOR }}
        >
          {title}
        </p>
        {subtitle ? (
          <p
            className="mt-0.5 line-clamp-2 text-sm"
            style={{ color: SECONDARY_TEXT_COLOR }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      <CategoryIcon
        icon="Ionicons/chevron-forward"
        size={20}
        color={SECONDARY_TEXT_COLOR}
      />
    </>
  );

  const className =
    "flex w-full items-center gap-3 rounded-xl border border-black/5 bg-white p-2.5 text-left transition-opacity hover:opacity-80";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
