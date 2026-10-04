"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type { ApplicationRecord, ApplicationStatus } from "@/contracts/workflows";
import { createApplication, getApplications, getProjects, updateApplicationStatus } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

const statusMeta: Record<ApplicationStatus, { label: string; tone: "positive" | "warning" | "neutral" | "info" }> = {
  draft: { label: "Draft", tone: "neutral" },
  ready: { label: "Ready", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "warning" },
  changes_requested: { label: "Changes requested", tone: "warning" },
  approved: { label: "Approved", tone: "positive" },
  rejected: { label: "Rejected", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" }
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function ApplicationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("projectId") ?? "all";
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [draftName, setDraftName] = useState("");
  const activeProjectId = projectFilter === "all" ? projects[0]?.id ?? "" : projectFilter;
  const selectedProject = projects.find((project) => project.id === projectFilter);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [result, projectData] = await Promise.all([
          getApplications(projectFilter === "all" ? undefined : projectFilter),
          getProjects()
        ]);
        if (active) {
          setApplications(result);
          setProjects(projectData);
          setSelectedId((current) => current ?? result[0]?.id ?? null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "The application workspace could not be loaded.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [projectFilter]);

  const filtered = useMemo(
    () =>
      applications.filter((application) => {
        const matchesSearch = `${application.name} ${application.authority}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || application.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [applications, search, statusFilter]
  );

  useEffect(() => {
    if (!filtered.some((application) => application.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selectedApplication = filtered.find((application) => application.id === selectedId) ?? applications.find((application) => application.id === selectedId) ?? null;

  async function handleCreateDraft() {
    const name = draftName.trim() || `Draft application ${applications.length + 1}`;
    try {
      if (!activeProjectId) {
        setError("Select a project before creating an application draft.");
        return;
      }
      const next = await createApplication(activeProjectId, name);
      setApplications(next);
      setSelectedId(next[0]?.id ?? null);
      setDraftName("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "The draft application could not be created.");
    }
  }

  async function handleStatusUpdate(applicationId: string, status: ApplicationStatus, messageOverride?: string) {
    try {
      const next = await updateApplicationStatus(PROJECT_ID, applicationId, status, messageOverride ?? `Mock status update to ${status}.`);
      setApplications(next);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "The status update could not be applied.");
    }
  }

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map((index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div>;
  }

  if (error) {
    return <EmptyState title="Application tracker unavailable" description={error} action={<Button onClick={() => window.location.reload()}>Retry</Button>} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selectedProject ? `Project · ${selectedProject.name}` : "All projects"}
        title="Application tracker"
        description={selectedProject ? `Applications associated with ${selectedProject.name}.` : "Track applications across all projects and filter by project, status, or search text."}
        actions={<StatusBadge tone="info">Illustrative</StatusBadge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Panel title="Applications">
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by application or authority"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              />
              <select
                aria-label="Filter by project"
                value={projectFilter}
                onChange={(event) => router.push(event.target.value === "all" ? "/applications" : `/applications?projectId=${encodeURIComponent(event.target.value)}`)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              >
                <option value="all">All projects</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under review</option>
                <option value="changes_requested">Changes requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">{filtered.length} records</p>
              <div className="flex gap-2">
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Draft name"
                  className="max-w-[140px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                />
                <Button type="button" onClick={handleCreateDraft}>New draft</Button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="No applications found" description="Create a draft application or adjust the filters to view other cases." />
            ) : (
              <div className="space-y-3">
                {filtered.map((application) => (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelectedId(application.id)}
                    className={[
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      selectedApplication?.id === application.id ? "border-[#27628a] bg-[#edf5fa]" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#172b3a]">{application.name}</p>
                        <p className="text-xs text-slate-500">{application.authority}</p>
                      </div>
                      <StatusBadge tone={statusMeta[application.status].tone}>{statusMeta[application.status].label}</StatusBadge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-2 py-1">Ref: {application.referenceNumber ?? "Not assigned"}</span>
                      <span className="rounded-full bg-white px-2 py-1">Updated {formatDate(application.lastUpdatedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          {selectedApplication ? (
            <Panel title={selectedApplication.name}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[#172b3a]">{selectedApplication.projectName}</p>
                    <p className="text-sm text-slate-500">{selectedApplication.authority}</p>
                  </div>
                  <StatusBadge tone={statusMeta[selectedApplication.status].tone}>{statusMeta[selectedApplication.status].label}</StatusBadge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Reference</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{selectedApplication.referenceNumber ?? "Not assigned"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Submitted</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{formatDate(selectedApplication.submittedAt)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Pending action</p>
                  <p className="mt-1 text-sm text-[#172b3a]">{selectedApplication.pendingAction ?? "No pending action"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => handleStatusUpdate(selectedApplication.id, "submitted", "Mock submission created for this application.")}>Mark submitted</Button>
                  <Button type="button" variant="secondary" onClick={() => handleStatusUpdate(selectedApplication.id, "under_review", "Mock officer review started.")}>Under review</Button>
                  <Button type="button" variant="secondary" onClick={() => handleStatusUpdate(selectedApplication.id, "approved", "Approved in the illustrative demo flow.")}>Approve</Button>
                  <Button type="button" variant="secondary" onClick={() => handleStatusUpdate(selectedApplication.id, "changes_requested", "Mock status updated to request applicant revisions.")}>Request changes</Button>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Related documents</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedApplication.documents.length === 0 ? <span className="text-sm text-slate-500">No files attached</span> : selectedApplication.documents.map((documentId) => (
                      <span key={documentId} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">{documentId}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Status history</p>
                  <ul className="mt-3 space-y-3">
                    {selectedApplication.history.map((entry) => (
                      <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[#172b3a]">{entry.message}</p>
                          {entry.status ? <StatusBadge tone={statusMeta[entry.status].tone}>{statusMeta[entry.status].label}</StatusBadge> : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(entry.timestamp)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
