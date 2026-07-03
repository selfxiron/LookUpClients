import type { WebsiteStatus } from "@/generated/prisma/client";

export type PlaceResult = {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  websiteStatus: WebsiteStatus;
  rating: number | null;
  category: string;
  source: "openstreetmap" | "geoapify";
  /** OSM/Wikidata id used only during search enrichment; not sent to the client. */
  wikidataId?: string | null;
};

export type Bbox = [number, number, number, number]; // south, north, west, east
