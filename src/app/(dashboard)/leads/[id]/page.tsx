import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "@/components/lead-detail-client";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    notFound();
  }

  return <LeadDetailClient lead={lead} />;
}
