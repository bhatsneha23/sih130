"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type { ProjectDocument } from "@/contracts/workflows";
import { getDocuments, getProjects, uploadDocument } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

const documentStatusMeta: Record<ProjectDocument["verificationStatus"], string> = {
  verified: "Verified",
  pending: "Pending",
  needs_review: "Needs review",
  expired: "Expired"
};

const requirementStatusMeta: Record<ProjectDocument["requirementStatus"], string> = {
  satisfied: "Satisfied",
  missing: "Missing",
  needs_review: "Needs review"
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

export function DocumentsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("projectId") ?? "all";
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectDocument["verificationStatus"]>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "Compliance record",
    category: "Engineering",
    sizeLabel: "1.0 MB",
    expiryAt: "",
    relatedTaskIds: "site-layout-plan"
  });

  const uploadProjectId = projectFilter === "all" ? projects[0]?.id ?? "" : projectFilter;
  const selectedProject = projects.find((project) => project.id === projectFilter);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [data, projectData] = await Promise.all([
          getDocuments(projectFilter === "all" ? undefined : projectFilter),
          getProjects()
        ]);
        if (active) {
          setDocuments(data);
          setProjects(projectData);
          setSelectedId((current) => current ?? data[0]?.id ?? null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "The document library could not be loaded.");
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

  const categories = useMemo(
    () => ["all", ...new Set(documents.map((doc) => doc.category))],
    [documents]
  );

  const filtered = documents.filter((document) => {
    const matchesText = `${document.name} ${document.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || document.verificationStatus === statusFilter;
    const matchesCategory = categoryFilter === "all" || document.category === categoryFilter;
    return matchesText && matchesStatus && matchesCategory;
  });

  useEffect(() => {
    if (!filtered.some((doc) => doc.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selectedDocument = filtered.find((doc) => doc.id === selectedId) ?? documents.find((doc) => doc.id === selectedId) ?? null;

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setUploadError("Document name is required.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const project = projects.find((entry) => entry.id === uploadProjectId);
      if (!project) {
        setUploadError("Select a project before uploading a document.");
        return;
      }
      const nextDocuments = await uploadDocument({
        projectId: project.id,
        projectName: project.name,
        name: form.name,
        category: form.category,
        type: form.type,
        sizeLabel: form.sizeLabel,
        relatedTaskIds: form.relatedTaskIds ? [form.relatedTaskIds] : [],
        expiryAt: form.expiryAt ? new Date(form.expiryAt).toISOString() : null,
        description: "Simulated upload captured through the browser-side demo workflow."
      });
      setDocuments((current) => projectFilter === project.id ? nextDocuments : [nextDocuments[0], ...current]);
      setSelectedId(nextDocuments[0]?.id ?? null);
      setForm({
        name: "",
        type: "Compliance record",
        category: "Engineering",
        sizeLabel: "1.0 MB",
        expiryAt: "",
        relatedTaskIds: "site-layout-plan"
      });
    } catch (uploadErrorObject) {
      setUploadError(uploadErrorObject instanceof Error ? uploadErrorObject.message : "The simulated upload failed.");
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map((index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div>;
  }

  if (error) {
    return <EmptyState title="Document library unavailable" description={error} action={<Button onClick={() => window.location.reload()}>Retry</Button>} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selectedProject ? `Project · ${selectedProject.name}` : "All projects"}
        title="Document library"
        description={selectedProject ? `Documents associated with ${selectedProject.name}.` : "Browse uploaded project artifacts across all projects and filter by project when needed."}
        actions={<StatusBadge tone="info">Illustrative data</StatusBadge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Panel title="Evidence and records">
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or category"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              />
              <select
                aria-label="Filter by project"
                value={projectFilter}
                onChange={(event) => router.push(event.target.value === "all" ? "/documents" : `/documents?projectId=${encodeURIComponent(event.target.value)}`)}
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
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="needs_review">Needs review</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              >
                <option value="all">All categories</option>
                {categories.filter((value) => value !== "all").map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="No documents match your filters" description="Try clearing filters or upload a new evidence file to the project." />
            ) : (
              <div className="space-y-3">
                {filtered.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => setSelectedId(document.id)}
                    className={[
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      selectedDocument?.id === document.id
                        ? "border-[#27628a] bg-[#edf5fa]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#172b3a]">{document.name}</p>
                        <p className="text-xs text-slate-500">{document.type} · {document.category}</p>
                      </div>
                      <StatusBadge tone={document.verificationStatus === "verified" ? "positive" : document.verificationStatus === "needs_review" ? "warning" : "neutral"}>{documentStatusMeta[document.verificationStatus]}</StatusBadge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-2 py-1">{document.sizeLabel}</span>
                      <span className="rounded-full bg-white px-2 py-1">Uploaded {formatDate(document.uploadedAt)}</span>
                      <span className="rounded-full bg-white px-2 py-1">{document.requirementStatus ? requirementStatusMeta[document.requirementStatus] : "Unassigned"}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Upload evidence">
            <form className="space-y-4" onSubmit={handleUpload}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#172b3a]">Project</label>
                <select
                  value={uploadProjectId}
                  disabled={projectFilter !== "all"}
                  onChange={(event) => router.push(`/documents?projectId=${encodeURIComponent(event.target.value)}`)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a] disabled:opacity-70"
                >
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#172b3a]">Document title</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  placeholder="e.g. Final fire safety layout"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#172b3a]">Type</label>
                  <input
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#172b3a]">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  >
                    <option>Engineering</option>
                    <option>Environmental</option>
                    <option>Safety</option>
                    <option>Utilities</option>
                    <option>Operations</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#172b3a]">File size</label>
                  <input
                    value={form.sizeLabel}
                    onChange={(event) => setForm((current) => ({ ...current, sizeLabel: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#172b3a]">Expiry date</label>
                  <input
                    type="date"
                    value={form.expiryAt}
                    onChange={(event) => setForm((current) => ({ ...current, expiryAt: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#172b3a]">Link to requirement</label>
                <select
                  value={form.relatedTaskIds}
                  onChange={(event) => setForm((current) => ({ ...current, relatedTaskIds: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                >
                  <option value="site-layout-plan">Site layout plan</option>
                  <option value="water-connection">Water connection approval</option>
                  <option value="effluent-treatment-review">Effluent treatment review</option>
                  <option value="fire-safety-clearance">Fire safety clearance</option>
                  <option value="inspection-site">Site inspection scheduling</option>
                </select>
              </div>
              {uploadError ? <p className="text-sm text-rose-600">{uploadError}</p> : null}
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Uploading…" : "Simulate upload"}
              </Button>
            </form>
          </Panel>

          {selectedDocument ? (
            <Panel title="Document details">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#172b3a]">{selectedDocument.name}</p>
                    <p className="text-sm text-slate-500">{selectedDocument.type} · {selectedDocument.category}</p>
                  </div>
                  <StatusBadge tone={selectedDocument.verificationStatus === "verified" ? "positive" : selectedDocument.verificationStatus === "needs_review" ? "warning" : "neutral"}>
                    {documentStatusMeta[selectedDocument.verificationStatus]}
                  </StatusBadge>
                </div>

                <p className="text-sm text-slate-600">{selectedDocument.description}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Uploaded</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{formatDate(selectedDocument.uploadedAt)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Expiry</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{formatDate(selectedDocument.expiryAt)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Requirement status</p>
                  <p className="mt-1 text-sm font-medium text-[#172b3a]">{requirementStatusMeta[selectedDocument.requirementStatus]}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Related approval tasks</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDocument.relatedTaskIds.length === 0 ? <span className="text-sm text-slate-500">No related tasks</span> : selectedDocument.relatedTaskIds.map((taskId) => (
                      <span key={taskId} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{taskId}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
