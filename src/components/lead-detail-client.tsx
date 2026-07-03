"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { WebsiteStatusBadge } from "@/components/website-status-badge";
import { PipelineStatusBadge } from "@/components/pipeline-status-badge";
import { PIPELINE_STATUSES, TEAM_MEMBERS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Lead } from "@/generated/prisma/client";

type LeadDetailClientProps = {
  lead: Lead;
};

export function LeadDetailClient({ lead: initialLead }: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [notes, setNotes] = useState(initialLead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function updateLead(data: Record<string, unknown>) {
    setSaving(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Update failed");
      }

      setLead(result.lead);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    await updateLead({ notes });
  }

  async function markContactedToday() {
    await updateLead({
      pipelineStatus: "CONTACTED",
      lastContactedAt: new Date().toISOString(),
    });
  }

  async function deleteLead() {
    if (!confirm("Delete this lead permanently?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      router.push("/leads");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="p-8">
      <Link
        href="/leads"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{lead.name}</h1>
          <p className="mt-1 text-sm capitalize text-zinc-500">{lead.category}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <WebsiteStatusBadge status={lead.websiteStatus} />
            <PipelineStatusBadge status={lead.pipelineStatus} />
          </div>
        </div>

        <button
          type="button"
          onClick={deleteLead}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Business Info
            </h2>
            <dl className="space-y-3 text-sm">
              {lead.address ? (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <dd className="text-zinc-700">{lead.address}</dd>
                </div>
              ) : null}
              {lead.phone ? (
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <dd>
                    <a href={`tel:${lead.phone}`} className="text-zinc-700 hover:underline">
                      {lead.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {lead.websiteUrl ? (
                <div className="flex gap-3">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <dd>
                    <a
                      href={lead.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-zinc-700 hover:underline"
                    >
                      {lead.websiteUrl}
                    </a>
                  </dd>
                </div>
              ) : (
                <p className="text-zinc-500">No website on record</p>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Call notes, owner name, follow-up details..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            />
            <button
              type="button"
              onClick={saveNotes}
              disabled={saving}
              className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              Save Notes
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Pipeline
            </h2>
            <select
              value={lead.pipelineStatus}
              onChange={(e) => updateLead({ pipelineStatus: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none"
            >
              {PIPELINE_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={markContactedToday}
              disabled={saving}
              className="mt-3 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              Mark Contacted Today
            </button>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Assigned To
            </h2>
            <select
              value={lead.assignedTo}
              onChange={(e) => updateLead({ assignedTo: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none"
            >
              {TEAM_MEMBERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            <p>Added: {formatDate(lead.createdAt)}</p>
            <p className="mt-2">
              Last contacted: {formatDate(lead.lastContactedAt)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
