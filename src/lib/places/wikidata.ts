import { inferWebsiteStatus } from "../website-checker";
import type { PlaceResult } from "./types";

type WikidataEntity = {
  claims?: {
    P856?: Array<{
      mainsnak?: {
        datavalue?: {
          value?: string;
        };
      };
    }>;
  };
};

type WikidataResponse = {
  entities?: Record<string, WikidataEntity>;
};

const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const BATCH_SIZE = 40;

function normalizeWikidataId(id: string): string | null {
  const match = id.trim().toUpperCase().match(/^Q\d+$/);
  return match ? match[0] : null;
}

async function fetchOfficialWebsites(
  ids: string[],
): Promise<Map<string, string>> {
  const websites = new Map<string, string>();
  if (ids.length === 0) return websites;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({
      action: "wbgetentities",
      ids: batch.join("|"),
      props: "claims",
      format: "json",
      origin: "*",
    });

    try {
      const response = await fetch(`${WIKIDATA_API}?${params}`, {
        headers: {
          "User-Agent":
            process.env.NOMINATIM_USER_AGENT ??
            "LookUpClients/1.0 (client discovery tool)",
        },
        cache: "no-store",
      });

      if (!response.ok) continue;

      const text = await response.text();
      if (text.startsWith("You are making too many requests")) continue;

      const data = JSON.parse(text) as WikidataResponse;
      for (const [id, entity] of Object.entries(data.entities ?? {})) {
        const value = entity.claims?.P856?.[0]?.mainsnak?.datavalue?.value;
        if (typeof value === "string" && value.trim()) {
          websites.set(id.toUpperCase(), value.trim());
        }
      }
    } catch (error) {
      console.error("Wikidata entity fetch failed:", error);
    }
  }

  return websites;
}

/**
 * Fill missing websites from Wikidata P856 when OSM includes a wikidata tag.
 * Name search is intentionally avoided — Wikidata rate-limits it.
 */
export async function enrichPlacesFromWikidata(
  places: PlaceResult[],
  wikidataByPlaceId: Map<string, string>,
): Promise<PlaceResult[]> {
  const ids = [
    ...new Set(
      [...wikidataByPlaceId.values()]
        .map(normalizeWikidataId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (ids.length === 0) return places;

  const websites = await fetchOfficialWebsites(ids);
  if (websites.size === 0) return places;

  return places.map((place) => {
    if (place.websiteUrl || place.websiteStatus !== "UNKNOWN") {
      return place;
    }

    const wikiId = normalizeWikidataId(
      wikidataByPlaceId.get(place.placeId) ?? "",
    );
    if (!wikiId) return place;

    const website = websites.get(wikiId);
    if (!website) return place;

    const inferred = inferWebsiteStatus(website);
    return {
      ...place,
      websiteUrl: inferred.url,
      websiteStatus: inferred.status,
    };
  });
}
