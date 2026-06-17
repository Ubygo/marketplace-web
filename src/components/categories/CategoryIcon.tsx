"use client";

import {
  getExpoIconCharacter,
  getExpoIconFontFamily,
} from "@/lib/parseExpoIcon";

const DEFAULT_ICON = "Ionicons/apps-outline";

interface CategoryIconProps {
  icon?: string;
  size?: number;
  color?: string;
}

export default function CategoryIcon({
  icon = DEFAULT_ICON,
  size = 16,
  color = "#000000",
}: CategoryIconProps) {
  const character = getExpoIconCharacter(icon) ?? getExpoIconCharacter(DEFAULT_ICON);
  const fontFamily = getExpoIconFontFamily(icon);

  if (!character) {
    return null;
  }

  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center leading-none"
      style={{
        color,
        fontFamily,
        fontSize: size,
        width: size,
        height: size,
      }}
    >
      {character}
    </span>
  );
}
