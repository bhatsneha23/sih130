"use client";

import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel, Button, StatusBadge, EmptyState } from "@/components/ui";
import { getRegulatoryUpdates } from "@/lib/api";
import type { RegulatoryUpdate } from "@/contracts/workflows";

function mapStatus(status: string) {
  if (status === "pending") return "warning";
  if (status === "reviewed") return "positive";
  if (status === "flagged") return "info";
  return "neutral";
}

export default function RegulatoryUpdatesPage() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getRegulatoryUpdates()
      .then((data) => {
        setUpdates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      // Handle mock data incompatibilities
      const anyU = u as unknown as Record<string, string>;
      const titleMatch = u.title.toLowerCase().includes(search.toLowerCase());
      const summaryMatch = u.summary.toLowerCase().includes(search.toLowerCase());
      if (search && !titleMatch && !summaryMatch) return false;

      if (statusFilter !== "All" && u.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      
      const areas: string[] = u.affectedAreas || (anyU.impact ? [anyU.impact] : []);
      if (categoryFilter !== "All") {
         const matches = areas.some(a => a.toLowerCase() === categoryFilter.toLowerCase());
         const titleHasCategory = u.title.toLowerCase().includes(categoryFilter.toLowerCase());
         const summaryHasCategory = u.summary.toLowerCase().includes(categoryFilter.toLowerCase());
         if (!matches && !titleHasCategory && !summaryHasCategory) return false;
      }

      return true;
    });
  }, [updates, search, categoryFilter, statusFilter]);

  return (
    <AppShell>
      <div className="mb-6 rounded-xl bg-[#edf5fa] p-4 text-sm text-[#27628a] ring-1 ring-[#dfeaf3]">
        These updates are illustrative demo content and do not represent official regulatory announcements.
      </div>

      <PageHeader 
        title="Regulatory Updates" 
        description="Review policy changes, guidance updates, and source references relevant to your projects." 
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <input 
          type="text"
          placeholder="Search updates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-1 focus:ring-[#27628a]"
        />
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-1 focus:ring-[#27628a]"
        >
          <option value="All">All Categories</option>
          <option value="Environment">Environment</option>
          <option value="Safety">Safety</option>
          <option value="Licensing">Licensing</option>
          <option value="Trade">Trade</option>
          <option value="Standards">Standards</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-1 focus:ring-[#27628a]"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Flagged">Flagged</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
        </div>
      ) : filteredUpdates.length === 0 ? (
        <EmptyState 
          title="No updates found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((u) => {
            const anyU = u as unknown as Record<string, string>;
            const source = u.source || anyU.authority || "Unknown Source";
            const publishedAt = u.publishedAt || anyU.date || "Unknown Date";
            const areas: string[] = u.affectedAreas || (anyU.impact ? [anyU.impact] : []);
            const isExpanded = expandedIds.has(u.id);

            return (
              <Panel key={u.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#172b3a]">{u.title}</h3>
                      <StatusBadge tone={mapStatus(u.status) as "positive" | "warning" | "neutral" | "info"}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</StatusBadge>
                    </div>
                    <p className="text-sm text-slate-500">{source} • {publishedAt}</p>
                    {areas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {areas.map((area, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-slate-700">
                      {isExpanded ? u.summary : (u.summary.length > 100 ? u.summary.slice(0, 100) + "..." : u.summary)}
                    </p>
                    {isExpanded && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-semibold">Source Verification:</span>
                          <StatusBadge tone={u.sourceVerificationStatus === 'verified' ? 'positive' : 'warning' as "positive" | "warning" | "neutral" | "info"}>
                            {u.sourceVerificationStatus || "illustrative"}
                          </StatusBadge>
                        </div>
                        {u.note && (
                          <div className="mt-2">
                            <span className="font-semibold">Note:</span> {u.note}
                          </div>
                        )}
                        <div className="mt-2">
                          <span className="font-semibold">Affected Areas:</span> {areas.length > 0 ? areas.join(", ") : "None specified"}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" onClick={() => toggleExpand(u.id)}>
                    {isExpanded ? "Show Less" : "Show More"}
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
