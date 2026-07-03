"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  Phone,
  Star,
  BookmarkPlus,
  ExternalLink,
  Filter,
  Plus,
} from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { WebsiteStatusBadge } from "@/components/website-status-badge";
import type { PlaceResult } from "@/lib/places/types";

type WebsiteFilter = "ALL" | "NO_WEBSITE" | "SOCIAL_ONLY" | "HAS_WEBSITE";

export default function SearchPage() {
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("cafe");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [sources, setSources] = useState<string[]>([]);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      setResults(data.results);
      setSources(data.sources ?? ["openstreetmap"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveLead(place: PlaceResult) {
    setSavingId(place.placeId);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          category: place.category,
          address: place.address,
          phone: place.phone,
          googlePlaceId: place.placeId,
          websiteUrl: place.websiteUrl,
          websiteStatus: place.websiteStatus,
          rating: place.rating,
          assignedTo: "ANAMIKA",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save lead");
      }

      setSavedIds((prev) => new Set(prev).add(place.placeId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save lead");
    } finally {
      setSavingId(null);
    }
  }

  const filteredResults = results.filter((place) => {
    if (websiteFilter === "ALL") return true;
    return place.websiteStatus === websiteFilter;
  });

  const hotLeadCount = results.filter(
    (place) =>
      place.websiteStatus === "NO_WEBSITE" ||
      place.websiteStatus === "SOCIAL_ONLY",
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Find Clients</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Search local businesses and find those without a proper website
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Combines OpenStreetMap + Geoapify. Not enough results?{" "}
            <Link href="/leads/new" className="underline">
              Add from Google Maps
            </Link>
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pune, Mumbai, Delhi"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Business Type
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

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Businesses"
              )}
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-zinc-600">
              Found <strong>{results.length}</strong> businesses ·{" "}
              <strong className="text-emerald-700">{hotLeadCount}</strong> hot leads
              {sources.length > 0 ? (
                <span className="text-zinc-400">
                  {" "}
                  · via {sources.join(" + ")}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select
                value={websiteFilter}
                onChange={(e) =>
                  setWebsiteFilter(e.target.value as WebsiteFilter)
                }
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none"
              >
                <option value="ALL">All results</option>
                <option value="NO_WEBSITE">No website only</option>
                <option value="SOCIAL_ONLY">Social only</option>
                <option value="HAS_WEBSITE">Has website</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredResults.map((place) => (
              <article
                key={place.placeId}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {place.name}
                      </h3>
                      <WebsiteStatusBadge status={place.websiteStatus} />
                    </div>

                    {place.address ? (
                      <p className="mt-2 flex items-start gap-2 text-sm text-zinc-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {place.address}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                      {place.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-4 w-4" />
                          {place.phone}
                        </span>
                      ) : null}
                      {place.rating ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {place.rating.toFixed(1)}
                        </span>
                      ) : null}
                      {place.websiteUrl ? (
                        <a
                          href={place.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-zinc-700 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {place.websiteUrl}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveLead(place)}
                    disabled={
                      savingId === place.placeId || savedIds.has(place.placeId)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
                  >
                    {savedIds.has(place.placeId) ? (
                      "Saved"
                    ) : savingId === place.placeId ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4" />
                        Save Lead
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
