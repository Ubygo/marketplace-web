import {
  buildFallbackFaviconSvg,
  buildTenantFaviconSvg,
  FAVICON_CACHE_CONTROL,
} from "@/lib/seo/favicon";
import { getTenantConfigForFavicon } from "@/lib/seo/tenant-config";

export async function GET() {
  const config = await getTenantConfigForFavicon();
  const svg = config ? buildTenantFaviconSvg(config) : buildFallbackFaviconSvg();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": FAVICON_CACHE_CONTROL,
    },
  });
}
