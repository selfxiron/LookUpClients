import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places/search";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      location?: string;
      category?: string;
    };

    const location = body.location?.trim();
    const category = body.category?.trim() ?? "cafe";

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 },
      );
    }

    const { results, sources } = await searchPlaces(location, category);

    return NextResponse.json({ results, sources });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
