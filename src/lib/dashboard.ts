import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    totalLeads,
    noWebsite,
    socialOnly,
    contacted,
    interested,
    won,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { websiteStatus: "NO_WEBSITE" } }),
    prisma.lead.count({ where: { websiteStatus: "SOCIAL_ONLY" } }),
    prisma.lead.count({ where: { pipelineStatus: "CONTACTED" } }),
    prisma.lead.count({ where: { pipelineStatus: "INTERESTED" } }),
    prisma.lead.count({ where: { pipelineStatus: "WON" } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalLeads,
    noWebsite,
    socialOnly,
    hotLeads: noWebsite + socialOnly,
    contacted,
    interested,
    won,
    recentLeads,
  };
}
