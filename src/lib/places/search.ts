import { searchGeoapifyPlaces } from "./geoapify-places";
import { searchOsmPlaces } from "./osm-places";
import type { PlaceResult } from "./types";

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
  const osmResults = await searchOsmPlaces(location, category);
  const sources = ["openstreetmap"];

  const geoapifyKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!geoapifyKey) {
    return { results: osmResults, sources };
  }

  try {
    const geoResults = await searchGeoapifyPlaces(
      location,
      category,
      geoapifyKey,
    );
    if (geoResults.length > 0) {
      sources.push("geoapify");
    }
    return {
      results: mergePlaceResults(osmResults, geoResults),
      sources,
    };
  } catch (error) {
    console.error("Geoapify search failed:", error);
    return { results: osmResults, sources };
  }
}
