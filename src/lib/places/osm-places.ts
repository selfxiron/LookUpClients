import { inferWebsiteStatus } from "../website-checker";
import { isJunkPlaceName } from "./filters";
import type { Bbox, PlaceResult } from "./types";

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OsmElement[];
  remark?: string;
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/cgi/interpreter",
];

const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ??
  "LookUpClients/1.0 (client discovery tool)";

/** Broader OSM tags — catches more Indian businesses than amenity=cafe alone */
const CATEGORY_FILTERS: Record<string, string[]> = {
  cafe: [
    '["amenity"="cafe"]',
    '["amenity"="coffee_shop"]',
    '["shop"="bakery"]',
    '["shop"="tea"]',
    '["shop"="confectionery"]',
  ],
  restaurant: [
    '["amenity"="restaurant"]',
    '["amenity"="fast_food"]',
    '["amenity"="food_court"]',
    '["amenity"="snack_bar"]',
    '["amenity"="ice_cream"]',
  ],
  clinic: [
    '["amenity"="clinic"]',
    '["healthcare"="clinic"]',
    '["amenity"="doctors"]',
    '["amenity"="dentist"]',
    '["healthcare"="centre"]',
  ],
  school: [
    '["amenity"="school"]',
    '["amenity"="kindergarten"]',
    '["amenity"="college"]',
  ],
  coaching: [
    '["amenity"="school"]["name"~"coaching|tuition|classes|academy|institute",i]',
    '["office"="educational_institution"]',
    '["amenity"="college"]["name"~"coaching|tuition|classes|academy",i]',
    '["amenity"="training"]',
  ],
  salon: [
    '["shop"="beauty"]',
    '["amenity"="hairdresser"]',
    '["amenity"="spa"]',
    '["shop"="cosmetics"]',
  ],
  gym: [
    '["leisure"="fitness_centre"]',
    '["leisure"="sports_centre"]',
    '["sport"="fitness"]',
  ],
  hotel: [
    '["tourism"="hotel"]',
    '["tourism"="guest_house"]',
    '["tourism"="hostel"]',
    '["tourism"="motel"]',
  ],
  media_studio: [
    '["shop"="photo"]',
    '["craft"="photographer"]',
    '["shop"="camera"]',
    '["office"="media"]',
    '["amenity"="studio"]["name"~"photo|video|film|media|production|studio",i]',
    '["craft"="photographer"]["name"~"video|film|media|studio",i]',
  ],
};

function buildOverpassQueryForBbox(
  bbox: Bbox,
  filters: string[],
): string {
  const [south, north, west, east] = bbox;
  const queries = filters
    .flatMap(
      (filter) =>
        `  node${filter}(${south},${west},${north},${east});\n  way${filter}(${south},${west},${north},${east});`,
    )
    .join("\n");

  return `[out:json][timeout:25];
(
${queries}
);
out center 80 tags;`;
}

async function queryOverpass(query: string): Promise<OsmElement[]> {
  let lastError = "All OpenStreetMap servers failed";

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(query)}`,
        cache: "no-store",
      });

      const text = await response.text();

      if (!response.ok) {
        lastError = `Overpass returned ${response.status}`;
        continue;
      }

      let data: OverpassResponse;
      try {
        data = JSON.parse(text) as OverpassResponse;
      } catch {
        lastError = "Invalid response from OpenStreetMap";
        continue;
      }

      if (data.remark?.includes("error")) {
        lastError = data.remark;
        continue;
      }

      return data.elements ?? [];
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "OpenStreetMap request failed";
    }
  }

  throw new Error(
    `${lastError}. Please try again in a moment or use a more specific location.`,
  );
}

function buildAddress(tags: Record<string, string>): string | null {
  if (tags["addr:full"]) return tags["addr:full"];

  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : null;
}

function extractWebsite(tags: Record<string, string>): string | null {
  return tags.website ?? tags["contact:website"] ?? tags.url ?? null;
}

function extractPhone(tags: Record<string, string>): string | null {
  return (
    tags.phone ?? tags["contact:phone"] ?? tags["contact:mobile"] ?? null
  );
}

function extractSocialUrl(tags: Record<string, string>): string | null {
  return (
    tags["contact:facebook"] ??
    tags["contact:instagram"] ??
    tags.facebook ??
    tags.instagram ??
    null
  );
}

function getElementName(tags: Record<string, string>): string {
  return tags.name ?? tags.brand ?? tags.operator ?? "Unknown";
}

function osmQualityScore(tags: Record<string, string>): number {
  let score = 0;
  if (tags.name && !isJunkPlaceName(tags.name)) score += 2;
  if (tags.brand) score += 1;
  if (buildAddress(tags)) score += 2;
  if (extractPhone(tags)) score += 2;
  if (extractWebsite(tags) || extractSocialUrl(tags)) score += 1;
  return score;
}

function resolveWebsiteStatus(tags: Record<string, string>): {
  url: string | null;
  status: PlaceResult["websiteStatus"];
} {
  const website = extractWebsite(tags);
  const social = extractSocialUrl(tags);
  return inferWebsiteStatus(website ?? social);
}

export async function searchOsmPlacesInBbox(
  bbox: Bbox,
  category: string,
): Promise<PlaceResult[]> {
  const filters = CATEGORY_FILTERS[category];

  if (!filters) {
    throw new Error(`Unknown category: ${category}`);
  }

  const elements = await queryOverpass(buildOverpassQueryForBbox(bbox, filters));

  const seen = new Set<string>();
  const uniqueElements = elements.filter((el) => {
    const key = `${el.type}/${el.id}`;
    if (seen.has(key)) return false;
    const tags = el.tags ?? {};
    const name = getElementName(tags);
    if (name === "Unknown") return false;
    if (isJunkPlaceName(name)) return false;
    if (!tags.name && !tags.brand && !tags.operator) return false;
    seen.add(key);
    return true;
  });

  uniqueElements.sort((a, b) => {
    const scoreA = osmQualityScore(a.tags ?? {});
    const scoreB = osmQualityScore(b.tags ?? {});
    if (scoreB !== scoreA) return scoreB - scoreA;
    return getElementName(a.tags ?? {}).localeCompare(getElementName(b.tags ?? {}));
  });

  return uniqueElements.map((element): PlaceResult => {
    const tags = element.tags ?? {};
    const websiteCheck = resolveWebsiteStatus(tags);

    return {
      placeId: `osm:${element.type}:${element.id}`,
      name: getElementName(tags),
      address: buildAddress(tags),
      phone: extractPhone(tags),
      websiteUrl: websiteCheck.url,
      websiteStatus: websiteCheck.status,
      rating: null,
      category,
      source: "openstreetmap",
    };
  });
}
