import ioniconsGlyphMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json";
import materialCommunityGlyphMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";

export type ExpoIconFamily = "Ionicons" | "MaterialCommunityIcons";

export interface ParsedExpoIcon {
  family: ExpoIconFamily;
  name: string;
}

const GLYPH_MAPS = {
  Ionicons: ioniconsGlyphMap as Record<string, number>,
  MaterialCommunityIcons: materialCommunityGlyphMap as Record<string, number>,
};

export function parseExpoIcon(icon: string): ParsedExpoIcon | null {
  const separatorIndex = icon.indexOf("/");
  if (separatorIndex <= 0 || separatorIndex === icon.length - 1) {
    return null;
  }

  const family = icon.slice(0, separatorIndex);
  const name = icon.slice(separatorIndex + 1);

  if (family !== "Ionicons" && family !== "MaterialCommunityIcons") {
    return null;
  }

  return { family, name };
}

export function getExpoIconGlyph(icon: string): ParsedExpoIcon | null {
  const parsed = parseExpoIcon(icon);
  if (!parsed) return null;

  const glyph = GLYPH_MAPS[parsed.family][parsed.name];
  if (!glyph) return null;

  return parsed;
}

export function getExpoIconCharacter(icon: string): string | null {
  const parsed = parseExpoIcon(icon);
  if (!parsed) return null;

  const glyph = GLYPH_MAPS[parsed.family][parsed.name];
  if (!glyph) return null;

  return String.fromCharCode(glyph);
}

export function getExpoIconFontFamily(icon: string): ExpoIconFamily {
  const parsed = parseExpoIcon(icon);
  return parsed?.family ?? "Ionicons";
}
