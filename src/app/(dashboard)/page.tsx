import Link from "next/link";
import {
  Users,
  Globe,
  Phone,
  HeartHandshake,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { WebsiteStatusBadge } from "@/components/website-status-badge";
import { PipelineStatusBadge } from "@/components/pipeline-status-badge";
import { getDashboardStats } from "@/lib/dashboard";
import { formatRelativeDate } from "@/lib/format";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of your client discovery pipeline
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          label="Total Leads"
          value={stats.totalLeads}
          icon={Users}
        />
        <StatsCard
          label="Hot Leads"
          value={stats.hotLeads}
          hint="No website or social only"
          icon={Globe}
          accent="green"
        />
        <StatsCard
          label="No Website"
          value={stats.noWebsite}
          icon={Globe}
          accent="green"
        />
        <StatsCard
          label="Social Only"
          value={stats.socialOnly}
          icon={Globe}
          accent="amber"
        />
        <StatsCard
          label="Contacted"
          value={stats.contacted}
          icon={Phone}
          accent="blue"
        />
        <StatsCard
          label="Interested"
          value={stats.interested}
          icon={HeartHandshake}
          accent="amber"
        />
        <StatsCard
          label="Won"
          value={stats.won}
          icon={Trophy}
          accent="green"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Recent Leads</h2>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {stats.recentLeads.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center">
              <p className="text-sm text-zinc-500">No leads saved yet.</p>
              <Link
                href="/search"
                className="mt-2 inline-block text-sm font-medium text-zinc-900 underline"
              >
                Start finding clients
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{lead.name}</p>
                    <p className="text-xs text-zinc-500">
                      {lead.category} · {formatRelativeDate(lead.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <WebsiteStatusBadge status={lead.websiteStatus} />
                    <PipelineStatusBadge status={lead.pipelineStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Quick Start for Anamika
          </h2>
          <ol className="space-y-4 text-sm text-zinc-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                1
              </span>
              <span>
                Go to <strong>Find Clients</strong> and search by city + business type
                (cafes, clinics, schools, etc.)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                2
              </span>
              <span>
                Filter for businesses with <strong>No Website</strong> or{" "}
                <strong>Social Only</strong> — your best opportunities
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                3
              </span>
              <span>
                Save promising leads, add notes after calling, and track follow-ups in
                the pipeline
              </span>
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
