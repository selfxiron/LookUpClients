import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PipelineStatus, TeamMember, WebsiteStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pipelineStatus = searchParams.get("pipelineStatus") as PipelineStatus | null;
  const websiteStatus = searchParams.get("websiteStatus") as WebsiteStatus | null;
  const assignedTo = searchParams.get("assignedTo") as TeamMember | null;

  const leads = await prisma.lead.findMany({
    where: {
      ...(pipelineStatus ? { pipelineStatus } : {}),
      ...(websiteStatus ? { websiteStatus } : {}),
      ...(assignedTo ? { assignedTo } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const existing = body.googlePlaceId
      ? await prisma.lead.findUnique({
          where: { googlePlaceId: body.googlePlaceId },
        })
      : null;

    if (existing) {
      return NextResponse.json(
        { error: "This business is already saved as a lead", lead: existing },
        { status: 409 },
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        category: body.category,
        address: body.address ?? null,
        phone: body.phone ?? null,
        googlePlaceId: body.googlePlaceId ?? null,
        websiteUrl: body.websiteUrl ?? null,
        websiteStatus: body.websiteStatus ?? "UNKNOWN",
        rating: body.rating ?? null,
        assignedTo: body.assignedTo ?? "ANAMIKA",
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
