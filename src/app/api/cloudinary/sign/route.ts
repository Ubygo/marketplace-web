import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getCloudinaryConfig() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY ??
    process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ??
    process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const config = getCloudinaryConfig();

  if (!config) {
    return NextResponse.json(
      { message: "Configuration Cloudinary manquante." },
      { status: 500 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`timestamp=${timestamp}${config.apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
  });
}
