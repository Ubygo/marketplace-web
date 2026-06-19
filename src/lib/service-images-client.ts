import { authenticatedFetch } from "@/lib/authenticated-fetch";

export interface AddServiceImageRequest {
  url: string;
  order: number;
}

export async function addServiceImage(
  slug: string,
  tenantId: string,
  serviceId: string,
  imageData: AddServiceImageRequest,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/images/services/${serviceId}`,
    {
      method: "POST",
      body: JSON.stringify(imageData),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible d'ajouter l'image.");
  }
}

export async function deleteServiceImage(
  slug: string,
  tenantId: string,
  imageId: string,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/images/services/${imageId}`,
    { method: "DELETE" },
  );

  if (!res.ok) {
    throw new Error("Impossible de supprimer l'image.");
  }
}

export async function updateServiceImageOrder(
  slug: string,
  tenantId: string,
  imageId: string,
  order: number,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/images/services/${imageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ order }),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de mettre à jour l'ordre des images.");
  }
}
