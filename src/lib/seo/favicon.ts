import type { AppConfig } from "@/lib/app-config";
import { getSiteName } from "@/lib/seo/tenant-config";

const DEFAULT_BACKGROUND = "#000000";
const DEFAULT_INITIAL = "?";

export const FAVICON_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=604800";

export function sanitizeHexColor(color: string | undefined): string {
  if (!color) {
    return DEFAULT_BACKGROUND;
  }

  const trimmed = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed) || /^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return trimmed;
  }

  return DEFAULT_BACKGROUND;
}

export function getFaviconInitial(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return DEFAULT_INITIAL;
  }

  const initial = trimmed.charAt(0).toUpperCase();
  return /[A-Z0-9]/i.test(initial) ? initial : DEFAULT_INITIAL;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function getContrastingTextColor(
  backgroundColor: string,
): "#FFFFFF" | "#000000" {
  const { r, g, b } = hexToRgb(sanitizeHexColor(backgroundColor));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

export function buildMonogramFaviconSvg(options: {
  backgroundColor: string;
  label: string;
  textColor?: string;
}): string {
  const backgroundColor = sanitizeHexColor(options.backgroundColor);
  const initial = getFaviconInitial(options.label);
  const textColor =
    options.textColor ?? getContrastingTextColor(backgroundColor);

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Favicon">',
    `<rect width="32" height="32" rx="8" fill="${backgroundColor}"/>`,
    `<text x="16" y="16" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="central">${initial}</text>`,
    "</svg>",
  ].join("");
}

export function buildTenantFaviconSvg(config: AppConfig): string {
  return buildMonogramFaviconSvg({
    backgroundColor: config.branding.primaryColor,
    label: getSiteName(config),
  });
}

export function buildFallbackFaviconSvg(): string {
  return buildMonogramFaviconSvg({
    backgroundColor: DEFAULT_BACKGROUND,
    label: DEFAULT_INITIAL,
    textColor: "#FFFFFF",
  });
}

export function getTenantFaviconIcons() {
  return {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  };
}
