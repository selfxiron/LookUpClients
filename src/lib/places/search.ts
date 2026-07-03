import { geocodeLocation } from "./geocode";
import { searchGeoapifyPlacesInBbox } from "./geoapify-places";
import { searchOsmPlacesInBbox } from "./osm-places";
import type { PlaceResult } from "./types";
import { enrichPlacesFromWikidata } from "./wikidata";

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function mergePlaceResults(
  primary: PlaceResult[],
  secondary: PlaceResult[],
): PlaceResult[] {
  const seen = new Set(primary.map((r) => normalizeName(r.name)));

  for (const place of secondary) {
    const key = normalizeName(place.name);
    if (!seen.has(key)) {
      seen.add(key);
      primary.push(place);
    }
  }

  return primary.sort((a, b) => a.name.localeCompare(b.name));
}

export async function searchPlaces(
  location: string,
  category: string,
): Promise<{ results: PlaceResult[]; sources: string[] }> {
  const { bbox } = await geocodeLocation(location);
  const geoapifyKey = process.env.GEOAPIFY_API_KEY?.trim();
  const sources = ["openstreetmap"];

  const osmPromise = searchOsmPlacesInBbox(bbox, category);
  const geoPromise = geoapifyKey
    ? searchGeoapifyPlacesInBbox(bbox, category, geoapifyKey).catch((error) => {
        console.error("Geoapify search failed:", error);
        return [];
      })
    : Promise.resolve([]);

  const [osmResults, geoResults] = await Promise.all([osmPromise, geoPromise]);

  if (geoResults.length > 0) {
    sources.push("geoapify");
  }

  const merged = mergePlaceResults(osmResults, geoResults);
  const wikidataByPlaceId = new Map<string, string>();
  for (const place of merged) {
    if (place.wikidataId) {
      wikidataByPlaceId.set(place.placeId, place.wikidataId);
    }
  }

  const enriched = await enrichPlacesFromWikidata(merged, wikidataByPlaceId);

  return {
    results: enriched.map(({ wikidataId: _wikidataId, ...place }) => place),
    sources,
  };
}
