import type { Bbox } from "./types";

type NominatimResult = {
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  display_name: string;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ??
  "LookUpClients/1.0 (client discovery tool)";

export async function geocodeLocation(location: string): Promise<{
  bbox: Bbox;
  displayName: string;
}> {
  const params = new URLSearchParams({
    q: location,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to geocode location. Please try again.");
  }

  const results = (await response.json()) as NominatimResult[];

  if (!results.length) {
    throw new Error(
      `Could not find "${location}". Try adding a state or country, e.g. "Pune, Maharashtra" or "Mumbai, India".`,
    );
  }

  const result = results[0];
  return {
    bbox: result.boundingbox.map(Number) as Bbox,
    displayName: result.display_name,
  };
}
