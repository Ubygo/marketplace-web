import { authenticatedFetch } from "@/lib/authenticated-fetch";

export interface AddVendorImageRequest {
  url: string;
  order: number;
}

export async function addVendorImage(
  slug: string,
  tenantId: string,
  vendorId: string,
  imageData: AddVendorImageRequest,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/images/merchants/${vendorId}`,
    {
      method: "POST",
      body: JSON.stringify(imageData),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible d'ajouter l'image.");
  }
}

export async function deleteVendorImage(
  slug: string,
  tenantId: string,
  imageId: string,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/images/merchants/${imageId}`,
    { method: "DELETE" },
  );

  if (!res.ok) {
    throw new Error("Impossible de supprimer l'image.");
  }
}

export async function updateVendorImageOrder(
  slug: string,
  tenantId: string,
  imageId: string,
  order: number,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/images/merchants/${imageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ order }),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de mettre à jour l'ordre des images.");
  }
}
