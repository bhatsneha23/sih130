"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type { MockProject } from "@/contracts/project-full";
import type { ApplicationRecord, ApplicationStatus, ProjectDocument, DocumentStatus } from "@/contracts/workflows";
import { getApplications, getDocuments, getProjects, updateApplicationStatus, updateDocumentStatus } from "@/lib/api";

type OfficerMode = "dashboard" | "queue" | "applications" | "documents";
type SlaState = "within" | "approaching" | "overdue";

const statusTone: Record<ApplicationStatus, "positive" | "warning" | "neutral" | "info"> = {
  draft: "neutral", ready: "info", submitted: "info", under_review: "warning", changes_requested: "warning", approved: "positive", rejected: "warning", cancelled: "neutral"
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function slaState(application: ApplicationRecord): SlaState {
  if (!application.submittedAt || application.status === "approved" || application.status === "rejected") return "within";
  const age = Date.now() - new Date(application.submittedAt).getTime();
  if (age > 10 * 24 * 60 * 60 * 1000) return "overdue";
  if (age > 5 * 24 * 60 * 60 * 1000) return "approaching";
  return "within";
}

function slaLabel(state: SlaState) {
  return state === "overdue" ? "Overdue" : state === "approaching" ? "Approaching SLA" : "Within SLA";
}

function slaTone(state: SlaState): "positive" | "warning" | "neutral" {
  return state === "overdue" ? "warning" : state === "approaching" ? "warning" : "positive";
}

export function OfficerWorkspace({ mode }: { mode: OfficerMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedApplicationId = searchParams.get("applicationId");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(requestedApplicationId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sla");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [applicationData, documentData, projectData] = await Promise.all([getApplications(), getDocuments(), getProjects()]);
      setApplications(applicationData);
      setDocuments(documentData);
      setProjects(projectData);
      setSelectedApplicationId((current) => current && applicationData.some((item) => item.id === current) ? current : applicationData[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The officer workspace could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const departments = useMemo(() => ["all", ...new Set(applications.map((application) => application.authority))], [applications]);
  const filteredApplications = useMemo(() => applications
    .filter((application) => {
      const query = `${application.id} ${application.referenceNumber ?? ""} ${application.name} ${application.projectName} ${application.authority}`.toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || application.authority === departmentFilter;
      const matchesSla = slaFilter === "all" || slaState(application) === slaFilter;
      return matchesSearch && matchesStatus && matchesDepartment && matchesSla;
    })
    .sort((left, right) => sortBy === "recent" ? new Date(right.lastUpdatedAt).getTime() - new Date(left.lastUpdatedAt).getTime() : slaState(left).localeCompare(slaState(right))),
    [applications, search, statusFilter, departmentFilter, slaFilter, sortBy]
  );
  const selectedApplication = applications.find((application) => application.id === selectedApplicationId) ?? null;
  const selectedDocuments = selectedApplication ? documents.filter((document) => selectedApplication.documents.includes(document.id)) : [];
  const pendingDocuments = documents.filter((document) => document.verificationStatus === "pending" || document.verificationStatus === "needs_review");
  const attentionApplications = applications.filter((application) => ["under_review", "submitted", "changes_requested"].includes(application.status) || slaState(application) !== "within");

  async function handleApplicationAction(status: ApplicationStatus, message: string) {
    if (!selectedApplication) return;
    if (status === "approved" && !window.confirm("Approve this illustrative application?")) return;
    if (status === "rejected") {
      const reason = window.prompt("Enter a rejection reason:", "Required evidence remains incomplete.");
      if (!reason) return;
      message = `Application rejected: ${reason}`;
    }
    const next = await updateApplicationStatus(selectedApplication.projectId, selectedApplication.id, status, message);
    setApplications((current) => current.map((application) => next.find((item) => item.id === application.id) ?? application));
    setNotice(`Application ${statusLabel(status).toLowerCase()} and timeline updated.`);
  }

  async function handleDocumentAction(document: ProjectDocument, status: DocumentStatus) {
    const reason = status === "needs_review" ? window.prompt("Enter the correction reason:", "Please provide a clearer signed version of this document.") : undefined;
    if (status === "needs_review" && !reason) return;
    const nextDocuments = await updateDocumentStatus(document.id, status, reason ?? undefined);
    setDocuments(nextDocuments);
    setNotice(status === "verified" ? `${document.name} verified.` : `${document.name} marked for correction.`);
    await load();
  }

  function openApplication(applicationId: string) {
    setSelectedApplicationId(applicationId);
    router.push(`/officer?applicationId=${encodeURIComponent(applicationId)}`);
  }

  if (loading) return <AppShell forcedRole="Officer"><Panel><div className="animate-pulse py-12 text-center text-sm text-slate-500">Loading officer workspace…</div></Panel></AppShell>;
  if (error) return <AppShell forcedRole="Officer"><EmptyState title="Officer workspace unavailable" description={error} action={<Button onClick={() => void load()}>Retry</Button>} /></AppShell>;

  const title = mode === "dashboard" ? "Officer dashboard" : mode === "queue" ? "Review queue" : mode === "applications" ? "Applications" : "Document review";
  const description = mode === "dashboard" ? "Review workload, deadlines, and application activity requiring officer attention." : mode === "queue" ? "Prioritize assigned applications by status, department, and SLA state." : mode === "applications" ? "Inspect application records and open the detailed review workspace." : "Review applicant-submitted documents linked to applications and projects.";

  return <AppShell forcedRole="Officer">
    <div className="space-y-6">
      <PageHeader eyebrow="Government Officer" title={title} description={description} actions={<StatusBadge tone="info">Illustrative officer workspace</StatusBadge>} />
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {mode === "dashboard" && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[{ label: "Assigned Applications", value: applications.length }, { label: "Pending Document Reviews", value: pendingDocuments.length }, { label: "Approaching SLA", value: applications.filter((application) => slaState(application) === "approaching").length }, { label: "Overdue Applications", value: applications.filter((application) => slaState(application) === "overdue").length }, { label: "Upcoming Inspections", value: 0 }, { label: "Open Grievances", value: 0 }].map((metric) => <Panel key={metric.label} className="p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate-500">{metric.label}</p><p className="mt-3 text-3xl font-semibold text-[#172b3a]">{metric.value}</p></Panel>)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Applications requiring attention"><div className="space-y-3">{attentionApplications.length === 0 ? <p className="text-sm text-slate-500">No applications require attention.</p> : attentionApplications.slice(0, 6).map((application) => <button key={application.id} onClick={() => openApplication(application.id)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-white"><div className="flex items-center justify-between gap-3"><p className="font-medium text-[#172b3a]">{application.referenceNumber ?? application.id}</p><StatusBadge tone={slaTone(slaState(application))}>{slaLabel(slaState(application))}</StatusBadge></div><p className="mt-1 text-sm text-slate-600">{application.projectName} · {application.name}</p><p className="mt-1 text-xs text-slate-500">{application.authority} · {statusLabel(application.status)}</p></button>)}</div></Panel>
          <Panel title="Recent officer activity"><div className="space-y-3">{applications.flatMap((application) => application.history.slice(-2).map((event) => ({ application, event }))).slice(0, 6).map(({ application, event }) => <div key={event.id} className="rounded-xl border border-slate-200 p-3"><p className="text-sm font-medium text-[#172b3a]">{event.message}</p><p className="mt-1 text-xs text-slate-500">{application.projectName} · {new Date(event.timestamp).toLocaleString()}</p></div>)}</div></Panel>
        </div>
      </>}

      {(mode === "queue" || mode === "applications") && <Panel title={mode === "queue" ? "Applications requiring review" : "Application records"}>
        <div className="mb-4 grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,1fr,1fr]">
          <input aria-label="Search officer applications" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, applicant, project, approval" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          <select aria-label="Filter application status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="all">All statuses</option>{["draft", "submitted", "under_review", "changes_requested", "approved", "rejected"].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select>
          <select aria-label="Filter department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{departments.map((department) => <option key={department} value={department}>{department === "all" ? "All departments" : department}</option>)}</select>
          <select aria-label="Filter SLA" value={slaFilter} onChange={(event) => setSlaFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="all">All SLA states</option><option value="within">Within SLA</option><option value="approaching">Approaching SLA</option><option value="overdue">Overdue</option></select>
          <select aria-label="Sort applications" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="sla">Sort by SLA</option><option value="recent">Sort by recent activity</option></select>
        </div>
        {filteredApplications.length === 0 ? <EmptyState title="No matching applications" description="Adjust the queue filters to find another application." /> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-[0.1em] text-slate-500"><tr>{["Application", "Applicant", "Project", "Approval", "Department", "Status", "SLA", "Action"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody>{filteredApplications.map((application) => <tr key={application.id} className="border-b border-slate-100"><td className="px-3 py-3 font-medium">{application.referenceNumber ?? application.id}</td><td className="px-3 py-3">{projects.find((project) => project.id === application.projectId)?.organization ?? "Applicant"}</td><td className="px-3 py-3">{application.projectName}</td><td className="px-3 py-3">{application.name}</td><td className="px-3 py-3">{application.authority}</td><td className="px-3 py-3"><StatusBadge tone={statusTone[application.status]}>{statusLabel(application.status)}</StatusBadge></td><td className="px-3 py-3"><StatusBadge tone={slaTone(slaState(application))}>{slaLabel(slaState(application))}</StatusBadge></td><td className="px-3 py-3"><Button variant="secondary" onClick={() => openApplication(application.id)}>Open</Button></td></tr>)}</tbody></table></div>}
      </Panel>}

      {mode === "documents" && <Panel title="Submitted documents requiring review"><div className="space-y-3">{documents.length === 0 ? <EmptyState title="No submitted documents" description="No documents are currently available for officer review." /> : documents.map((document) => { const application = applications.find((item) => item.documents.includes(document.id)); return <div key={document.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-medium text-[#172b3a]">{document.name}</p><p className="text-sm text-slate-600">{application?.referenceNumber ?? "Unlinked application"} · {document.projectName}</p><p className="text-xs text-slate-500">Submitted {new Date(document.uploadedAt).toLocaleDateString()} · {document.category}</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={document.verificationStatus === "verified" ? "positive" : "warning"}>{document.verificationStatus === "verified" ? "Verified" : document.verificationStatus === "needs_review" ? "Correction required" : "Pending verification"}</StatusBadge><Button variant="secondary" onClick={() => void handleDocumentAction(document, "verified")}>Verify Document</Button><Button variant="secondary" onClick={() => void handleDocumentAction(document, "needs_review")}>Request Correction</Button></div></div>})}</div></Panel>}

      {selectedApplication && <Panel title={`Review · ${selectedApplication.referenceNumber ?? selectedApplication.id}`}><div className="grid gap-6 xl:grid-cols-2"><div className="space-y-4"><div><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Applicant and project</p><p className="mt-1 font-semibold text-[#172b3a]">{projects.find((project) => project.id === selectedApplication.projectId)?.organization ?? "Applicant"}</p><p className="text-sm text-slate-600">{selectedApplication.projectName}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Approval and department</p><p className="mt-1 font-semibold text-[#172b3a]">{selectedApplication.name}</p><p className="text-sm text-slate-600">{selectedApplication.authority}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Risk / attention</p><p className="mt-1 text-sm text-slate-700">{slaLabel(slaState(selectedApplication))}. Review document completeness and the application timeline before taking action.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => void handleApplicationAction("approved", "Application approved in the illustrative officer review.")}>Approve application</Button><Button variant="secondary" onClick={() => void handleApplicationAction("changes_requested", "Officer requested applicant corrections.")}>Request correction</Button><Button variant="secondary" onClick={() => void handleApplicationAction("rejected", "Application rejected in the illustrative officer review.")}>Reject application</Button></div></div><div><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Timeline</p><div className="mt-2 space-y-2">{selectedApplication.history.map((event) => <div key={event.id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="font-medium text-[#172b3a]">{event.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p></div>)}</div><p className="mt-5 text-xs uppercase tracking-[0.12em] text-slate-500">Submitted documents</p><div className="mt-2 space-y-2">{selectedDocuments.map((document) => <div key={document.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm"><span>{document.name}</span><Button variant="secondary" onClick={() => void handleDocumentAction(document, "verified")}>Verify</Button></div>)}</div></div></div></Panel>}
    </div>
  </AppShell>;
}
