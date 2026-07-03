import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.pipelineStatus !== undefined) data.pipelineStatus = body.pipelineStatus;
    if (body.websiteStatus !== undefined) data.websiteStatus = body.websiteStatus;
    if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.lastContactedAt !== undefined) {
      data.lastContactedAt = body.lastContactedAt
        ? new Date(body.lastContactedAt)
        : null;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
