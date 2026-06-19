import type { Service, ServiceImage } from "@/types/service";

type ServiceWithPhotos = Service & { photos?: string[] };

function resolveServiceImages(service: ServiceWithPhotos): ServiceImage[] {
  if (service.serviceImages?.length) {
    return service.serviceImages;
  }

  if (service.images?.length) {
    return service.images;
  }

  if (service.photos?.length) {
    return service.photos.map((url, order) => ({
      id: `${service.id}-photo-${order}`,
      url,
      order,
    }));
  }

  return [];
}

export function normalizeService(service: ServiceWithPhotos): Service {
  const serviceImages = resolveServiceImages(service);
  const { photos: _photos, ...rest } = service;

  return {
    ...rest,
    serviceImages: serviceImages.length > 0 ? serviceImages : rest.serviceImages,
    images: serviceImages.length > 0 ? serviceImages : rest.images,
  };
}

export function getServiceImageUrls(service: Service): string[] {
  return resolveServiceImages(service)
    .sort((a, b) => a.order - b.order)
    .map((image) => image.url)
    .filter(Boolean);
}

export function getPrimaryServiceImageUrl(service: Service): string | undefined {
  return getServiceImageUrls(service)[0];
}
