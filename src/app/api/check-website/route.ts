import { NextRequest, NextResponse } from "next/server";
import { checkWebsiteStatus } from "@/lib/website-checker";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };
    const result = await checkWebsiteStatus(body.url);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Website check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
