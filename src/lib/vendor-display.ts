import type { Service } from "@/types/service";
import type { Vendor, VendorCardData } from "@/types/vendor";
import { getServiceImageUrls } from "@/lib/service-display";

export function getVendorImageUrl(vendor: Vendor): string | undefined {
  return (
    vendor.vendorImages?.[0]?.url ??
    vendor.images?.[0]?.url ??
    vendor.photo ??
    undefined
  );
}

export function getVendorGalleryImages(vendor: Vendor): string[] {
  const images = vendor.vendorImages?.length
    ? vendor.vendorImages
    : vendor.images;

  return [...(images ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((image) => image.url)
    .filter(Boolean);
}

/** Index de l'image à mettre en avant (2e photo si disponible, sinon la 1re). */
export function getVendorCoverImageIndex(imageCount: number): number {
  return imageCount >= 2 ? 1 : 0;
}

export function getVendorCoverImageUrl(images: string[]): string | undefined {
  if (images.length === 0) {
    return undefined;
  }

  return images[getVendorCoverImageIndex(images.length)];
}

export function getVendorPageGalleryImages(
  vendor: Vendor,
  services: Service[],
  selectedServiceId?: string | null,
): string[] {
  const vendorImages = getVendorGalleryImages(vendor);
  if (vendorImages.length > 0) {
    return vendorImages;
  }

  const selectedService = selectedServiceId
    ? services.find((service) => service.id === selectedServiceId)
    : undefined;

  if (selectedService) {
    const selectedImages = getServiceImageUrls(selectedService);
    if (selectedImages.length > 0) {
      return selectedImages;
    }
  }

  for (const service of services) {
    const serviceImages = getServiceImageUrls(service);
    if (serviceImages.length > 0) {
      return serviceImages;
    }
  }

  return [];
}

export function getVendorRating(vendor: Vendor): number {
  return vendor.averageRating ?? vendor.rating ?? 0;
}

export function getVendorReviewCount(vendor: Vendor): number {
  return vendor.reviewCount ?? vendor.ratingCount ?? 0;
}

function getPrimaryService(services: Service[]): Service | undefined {
  return services.find((service) => service.visible !== false) ?? services[0];
}

function getLowestPrice(services: Service[]): number {
  const prices = services
    .map((service) => service.price)
    .filter((price) => typeof price === "number" && price > 0);

  if (prices.length === 0) {
    return 0;
  }

  return Math.min(...prices);
}

function normalizeCurrency(currency: string): string {
  return currency.toUpperCase();
}

export function mapVendorToCardData(
  vendor: Vendor,
  services: Service[],
  currency = "EUR",
): VendorCardData {
  const galleryImages = getVendorGalleryImages(vendor);
  const primaryService = getPrimaryService(services);
  const imageUrl = getVendorImageUrl(vendor);
  const avatarUrl = vendor.photo ?? imageUrl ?? "";
  const priceFrom = getLowestPrice(services);
  const serviceCurrency = primaryService?.currency
    ? normalizeCurrency(primaryService.currency)
    : normalizeCurrency(currency);

  return {
    id: vendor.id,
    vendorName: vendor.name,
    avatarUrl,
    galleryImages:
      galleryImages.length > 0
        ? galleryImages
        : imageUrl
          ? [imageUrl]
          : [],
    serviceTitle:
      primaryService?.name ??
      primaryService?.description ??
      vendor.description ??
      vendor.name,
    rating: getVendorRating(vendor),
    reviewCount: getVendorReviewCount(vendor),
    priceFrom,
    currency: serviceCurrency,
    categoryId: primaryService?.categoryId,
  };
}
