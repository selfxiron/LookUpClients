"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BUSINESS_CATEGORIES, TEAM_MEMBERS } from "@/lib/constants";
import { WebsiteStatusBadge } from "@/components/website-status-badge";
import type { WebsiteStatus } from "@/generated/prisma/client";

export function AddLeadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("cafe");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("ANAMIKA");
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus | null>(null);
  const [checkingWebsite, setCheckingWebsite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkWebsite() {
    setCheckingWebsite(true);
    setError(null);

    try {
      const response = await fetch("/api/check-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl.trim() || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Website check failed");
      }

      setWebsiteStatus(data.status);
      if (data.url) setWebsiteUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Website check failed");
    } finally {
      setCheckingWebsite(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let status: WebsiteStatus = websiteStatus ?? "UNKNOWN";
      let url: string | null = websiteUrl.trim() || null;

      if (url) {
        const checkResponse = await fetch("/api/check-website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const checkData = await checkResponse.json();
        if (checkResponse.ok) {
          status = checkData.status;
          url = checkData.url;
        }
      } else {
        status = "NO_WEBSITE";
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          address: address.trim() || null,
          phone: phone.trim() || null,
          websiteUrl: url,
          websiteStatus: status,
          notes: notes.trim() || null,
          assignedTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save lead");
      }

      router.push(`/leads/${data.lead.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lead");
      setSaving(false);
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

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Add Lead</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Found a business on Google Maps? Paste the details here.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Business name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sharma Clinic"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Business type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              {BUSINESS_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Assigned to
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              {TEAM_MEMBERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, area, city"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Website or social link
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value);
                setWebsiteStatus(null);
              }}
              placeholder="Leave empty if no website"
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            />
            <button
              type="button"
              onClick={checkWebsite}
              disabled={checkingWebsite || !websiteUrl.trim()}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {checkingWebsite ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Check"
              )}
            </button>
          </div>
          {websiteStatus ? (
            <div className="mt-2">
              <WebsiteStatusBadge status={websiteStatus} />
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-400">
              No URL = marked as &quot;No Website&quot; — your hot lead
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How you found them, owner name, anything useful..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Lead"
          )}
        </button>
      </form>
    </div>
  );
}
