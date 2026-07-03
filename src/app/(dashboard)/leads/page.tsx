import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { WebsiteStatusBadge } from "@/components/website-status-badge";
import { PipelineStatusBadge } from "@/components/pipeline-status-badge";
import { formatRelativeDate } from "@/lib/format";
import { FilterSelect } from "@/components/filter-select";
import { PIPELINE_STATUSES, WEBSITE_STATUSES, TEAM_MEMBERS } from "@/lib/constants";
import type { PipelineStatus, TeamMember, WebsiteStatus } from "@/generated/prisma/client";

type LeadsPageProps = {
  searchParams: Promise<{
    pipelineStatus?: PipelineStatus;
    websiteStatus?: WebsiteStatus;
    assignedTo?: TeamMember;
  }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;

  const leads = await prisma.lead.findMany({
    where: {
      ...(params.pipelineStatus ? { pipelineStatus: params.pipelineStatus } : {}),
      ...(params.websiteStatus ? { websiteStatus: params.websiteStatus } : {}),
      ...(params.assignedTo ? { assignedTo: params.assignedTo } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  function buildFilterUrl(key: string, value: string | undefined) {
    const next = new URLSearchParams();
    const merged = {
      pipelineStatus: params.pipelineStatus,
      websiteStatus: params.websiteStatus,
      assignedTo: params.assignedTo,
      [key]: value,
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v) next.set(k, v);
    });

    const query = next.toString();
    return query ? `/leads?${query}` : "/leads";
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Leads</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track businesses Anamika has found and contacted
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <FilterSelect
          label="Pipeline"
          value={params.pipelineStatus ?? ""}
          allHref={buildFilterUrl("pipelineStatus", undefined)}
          options={PIPELINE_STATUSES.map((item) => ({
            value: item.value,
            label: item.label,
            href: buildFilterUrl("pipelineStatus", item.value),
          }))}
        />
        <FilterSelect
          label="Website"
          value={params.websiteStatus ?? ""}
          allHref={buildFilterUrl("websiteStatus", undefined)}
          options={WEBSITE_STATUSES.map((item) => ({
            value: item.value,
            label: item.label,
            href: buildFilterUrl("websiteStatus", item.value),
          }))}
        />
        <FilterSelect
          label="Assigned"
          value={params.assignedTo ?? ""}
          allHref={buildFilterUrl("assignedTo", undefined)}
          options={TEAM_MEMBERS.map((item) => ({
            value: item.value,
            label: item.label,
            href: buildFilterUrl("assignedTo", item.value),
          }))}
        />
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm text-zinc-500">No leads match your filters.</p>
          <Link
            href="/search"
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Find clients to get started
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Business
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Website
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Pipeline
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <p className="text-xs text-zinc-500">{lead.category}</p>
                  </td>
                  <td className="px-4 py-4">
                    <WebsiteStatusBadge status={lead.websiteStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <PipelineStatusBadge status={lead.pipelineStatus} />
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-600">
                    {lead.assignedTo === "ANAMIKA" ? "Anamika" : "Jeet"}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-500">
                    {formatRelativeDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
