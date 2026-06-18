import { authenticatedFetch } from "@/lib/authenticated-fetch";

interface CloudinarySignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
}

export async function getCloudinaryUploadSignature(
  slug: string,
  tenantId: string,
): Promise<CloudinarySignature> {
  const res = await authenticatedFetch(slug, tenantId, "/api/cloudinary/sign", {
    method: "POST",
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error("Impossible de préparer l'envoi de l'image.");
  }

  return res.json();
}

export async function uploadImageToCloudinary(
  slug: string,
  tenantId: string,
  file: File,
  entityId: string,
  type: string,
): Promise<string> {
  const { cloudName, apiKey, timestamp, signature } =
    await getCloudinaryUploadSignature(slug, tenantId);

  const formData = new FormData();
  formData.append("file", file, `${type}-${entityId}-${Date.now()}`);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Impossible d'envoyer l'image.");
  }

  const payload = (await res.json()) as { secure_url?: string };

  if (!payload.secure_url) {
    throw new Error("Réponse Cloudinary invalide.");
  }

  return payload.secure_url;
}
