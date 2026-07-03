import { inferWebsiteStatus } from "../website-checker";
import { isJunkPlaceName } from "./filters";
import type { Bbox, PlaceResult } from "./types";

const GEOAPIFY_URL = "https://api.geoapify.com/v2/places";

/** Must match Geoapify supported category slugs exactly */
const CATEGORY_MAP: Record<string, string> = {
  cafe: [
    "catering.cafe",
    "catering.cafe.coffee_shop",
    "catering.cafe.tea",
    "catering.cafe.coffee",
    "catering.ice_cream",
    "commercial.food_and_drink.bakery",
    "commercial.food_and_drink.coffee_and_tea",
  ].join(","),
  restaurant: "catering.restaurant,catering.fast_food,catering.food_court",
  clinic:
    "healthcare.clinic_or_praxis,healthcare.dentist,healthcare.pharmacy,healthcare.hospital",
  school:
    "education.school,education.kindergarten,education.college,education.university",
  coaching:
    "education.college,education.school,education.university,office.educational_institution",
  salon:
    "service.beauty.hairdresser,service.beauty.spa,commercial.health_and_beauty.cosmetics,leisure.spa",
  gym: "sport.fitness.gym,sport.fitness.fitness_centre,sport.sports_centre",
  hotel:
    "accommodation.hotel,accommodation.guest_house,accommodation.hostel,accommodation.motel",
  media_studio:
    "commercial.hobby.photo,commercial.video_and_music,commercial.art,service.advertising.advertising_agency",
};

type GeoapifyFeature = {
  properties?: {
    place_id?: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    phone?: string;
    website?: string;
    city?: string;
    street?: string;
    housenumber?: string;
  };
};

type GeoapifyResponse = {
  features?: GeoapifyFeature[];
};

function bboxToGeoapifyRect(bbox: Bbox): string {
  const [south, north, west, east] = bbox;
  return `rect:${west},${south},${east},${north}`;
}

export async function searchGeoapifyPlacesInBbox(
  bbox: Bbox,
  category: string,
  apiKey: string,
): Promise<PlaceResult[]> {
  const categories = CATEGORY_MAP[category];
  if (!categories) return [];

  const filter = bboxToGeoapifyRect(bbox);

  const params = new URLSearchParams({
    categories,
    filter,
    limit: "80",
    lang: "en",
    apiKey,
  });

  const response = await fetch(`${GEOAPIFY_URL}?${params}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Geoapify returned ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as GeoapifyResponse & { message?: string };
  if (data.message && !data.features?.length) {
    throw new Error(`Geoapify: ${data.message.slice(0, 200)}`);
  }

  return (data.features ?? [])
    .flatMap((feature) => {
      const props = feature.properties;
      if (!props?.name || isJunkPlaceName(props.name)) return [];

      const address =
        props.formatted ??
        [props.address_line1, props.address_line2].filter(Boolean).join(", ") ??
        null;

      const websiteCheck = inferWebsiteStatus(props.website);

      return [
        {
          placeId: `geoapify:${props.place_id ?? props.name}`,
          name: props.name,
          address: address || null,
          phone: props.phone ?? null,
          websiteUrl: websiteCheck.url,
          websiteStatus: websiteCheck.status,
          rating: null,
          category,
          source: "geoapify" as const,
        },
      ];
    });
}
