import type { MapboxFeature } from "@/types/mapbox";
import type { Location } from "@/types/location";

export interface ParsedMapboxAddress {
  street: string;
  city: string;
  country: string;
  zipcode: string;
  lat: number;
  lng: number;
}

export function parseMapboxFeature(
  feature: MapboxFeature,
): ParsedMapboxAddress | null {
  const context = feature.context ?? [];
  const streetNumber = feature.address ?? "";
  let streetName = "";
  let city = "";
  let country = "";
  let zipcode = "";

  context.forEach((ctx) => {
    if (ctx.id.startsWith("street")) {
      streetName = ctx.text;
    } else if (ctx.id.startsWith("place")) {
      city = ctx.text;
    } else if (ctx.id.startsWith("country")) {
      country = ctx.text;
    } else if (ctx.id.startsWith("postcode")) {
      zipcode = ctx.text;
    }
  });

  if (!city && feature.place_name) {
    const parts = feature.place_name.split(",");
    if (parts.length > 1) {
      city = parts[parts.length - 2]?.trim() || "";
    }
    if (parts.length > 0) {
      country = parts[parts.length - 1]?.trim() || "";
    }
  }

  let street = feature.text || "";

  if (streetNumber) {
    if (!street.startsWith(streetNumber)) {
      if (streetName) {
        street = `${streetNumber} ${streetName}`;
      } else {
        street = `${streetNumber} ${street}`.trim();
      }
    }
  } else if (streetName && !street.includes(streetName)) {
    street = streetName;
  }

  if (!street) {
    street = feature.place_name || "";
  }

  const lat = feature.center[1];
  const lng = feature.center[0];

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    street: street.trim(),
    city,
    country,
    zipcode,
    lat,
    lng,
  };
}

export function locationToMapboxFeature(location: Location): MapboxFeature {
  const addressString = `${location.street}, ${location.city}, ${location.country}`;
  const context: MapboxFeature["context"] = [
    { id: `place.${location.city}`, text: location.city },
    { id: `country.${location.country}`, text: location.country },
  ];

  if (location.zipcode) {
    context.push({
      id: `postcode.${location.zipcode}`,
      text: location.zipcode,
    });
  }

  return {
    id: location.id,
    text: location.street,
    place_name: addressString,
    center: [location.lng, location.lat],
    context,
  };
}
