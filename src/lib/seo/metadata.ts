import type { AppConfig } from "@/lib/app-config";
import { getTenantFaviconIcons } from "@/lib/seo/favicon";
import { getSiteName } from "@/lib/seo/tenant-config";
import {
  getVendorCoverImageUrl,
  getVendorGalleryImages,
} from "@/lib/vendor-display";
import type { Vendor } from "@/types/vendor";
import type { Metadata } from "next";
import { headers } from "next/headers";

const DEFAULT_DESCRIPTION_MAX = 160;

export function truncateDescription(
  text: string,
  max = DEFAULT_DESCRIPTION_MAX,
): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

export { getSiteName };

export async function getSiteOrigin(): Promise<string> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

export function buildPageTitle(pageTitle: string, siteName: string): string {
  return `${pageTitle} | ${siteName}`;
}

function getDefaultSiteDescription(config: AppConfig): string {
  const siteName = getSiteName(config);
  const headline = config.branding.welcomeScreen?.headline?.trim();

  if (headline) {
    return truncateDescription(headline);
  }

  return truncateDescription(
    `Découvrez et réservez les meilleurs prestataires sur ${siteName}.`,
  );
}

function buildOpenGraphImages(imageUrl?: string, alt?: string) {
  if (!imageUrl) {
    return undefined;
  }

  return [{ url: imageUrl, alt: alt ?? "" }];
}

export function buildSiteMetadata(
  config: AppConfig,
  origin: string,
): Metadata {
  const siteName = getSiteName(config);
  const description = getDefaultSiteDescription(config);
  const logoUrl = config.branding.logoUrl ?? undefined;

  return {
    metadataBase: new URL(origin),
    title: {
      default: `${siteName} — Trouvez votre prestataire`,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: config.locale?.replace("-", "_") ?? "fr_FR",
      siteName,
      title: siteName,
      description,
      url: origin,
      images: buildOpenGraphImages(logoUrl, siteName),
    },
    twitter: {
      card: logoUrl ? "summary_large_image" : "summary",
      title: siteName,
      description,
      images: logoUrl ? [logoUrl] : undefined,
    },
    icons: getTenantFaviconIcons(),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildFallbackSiteMetadata(origin: string): Metadata {
  return {
    metadataBase: new URL(origin),
    title: {
      default: "Marketplace",
      template: "%s | Marketplace",
    },
    description: "Marketplace de services.",
    icons: getTenantFaviconIcons(),
  };
}

export function buildHomeMetadata(config: AppConfig, origin: string): Metadata {
  const siteName = getSiteName(config);
  const title = `${siteName} — Trouvez votre prestataire`;
  const description = getDefaultSiteDescription(config);

  return {
    title,
    description,
    alternates: {
      canonical: origin,
    },
    openGraph: {
      title,
      description,
      url: origin,
      siteName,
      type: "website",
      images: buildOpenGraphImages(
        config.branding.logoUrl ?? undefined,
        siteName,
      ),
    },
  };
}

export function buildVendorDescription(
  vendor: Vendor,
  categoryName?: string,
): string {
  const parts: string[] = [];

  if (vendor.description?.trim()) {
    parts.push(vendor.description.trim());
  } else {
    parts.push(`Réservez ${vendor.name} en ligne.`);
  }

  if (categoryName) {
    parts.push(`Catégorie : ${categoryName}.`);
  }

  if (vendor.location?.city) {
    parts.push(vendor.location.city);
  }

  return truncateDescription(parts.join(" "));
}

export function buildVendorMetadata(
  vendor: Vendor,
  config: AppConfig,
  origin: string,
  categoryName?: string,
): Metadata {
  const siteName = getSiteName(config);
  const pageTitle = categoryName
    ? `${vendor.name} — ${categoryName}`
    : `${vendor.name} — Réserver en ligne`;
  const title = buildPageTitle(pageTitle, siteName);
  const description = buildVendorDescription(vendor, categoryName);
  const canonicalUrl = `${origin}/vendor/${vendor.id}`;
  const coverImage = getVendorCoverImageUrl(getVendorGalleryImages(vendor));

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: "website",
      images: buildOpenGraphImages(coverImage, vendor.name),
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

export function buildVendorJsonLd(
  vendor: Vendor,
  origin: string,
  categoryName?: string,
) {
  const coverImage = getVendorCoverImageUrl(getVendorGalleryImages(vendor));
  const rating = vendor.averageRating ?? vendor.rating;
  const reviewCount = vendor.reviewCount ?? vendor.ratingCount;

  const address =
    vendor.location?.city || vendor.location?.street
      ? {
          "@type": "PostalAddress",
          streetAddress: vendor.location.street,
          addressLocality: vendor.location.city,
          postalCode: vendor.location.zipcode,
          addressCountry: vendor.location.country,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: vendor.name,
    description: vendor.description ?? undefined,
    url: `${origin}/vendor/${vendor.id}`,
    image: coverImage,
    serviceType: categoryName,
    address,
    aggregateRating:
      rating != null && reviewCount != null && reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
          }
        : undefined,
  };
}

export function buildStaticPageMetadata(
  pageTitle: string,
  description: string,
  config: AppConfig,
  path: string,
  origin: string,
): Metadata {
  const siteName = getSiteName(config);
  const canonicalUrl = `${origin}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    title: pageTitle,
    description: truncateDescription(description),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: buildPageTitle(pageTitle, siteName),
      description: truncateDescription(description),
      url: canonicalUrl,
      siteName,
      type: "website",
    },
  };
}

export function privatePageMetadata(
  pageTitle: string,
  config: AppConfig | null,
): Metadata {
  const siteName = config ? getSiteName(config) : "Marketplace";

  return {
    title: pageTitle,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: buildPageTitle(pageTitle, siteName),
    },
  };
}
