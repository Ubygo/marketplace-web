export function resolveMapboxPublicToken(
  fromConfig?: string | null,
): string | null {
  return (
    fromConfig ??
    process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN ??
    process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ??
    null
  );
}
