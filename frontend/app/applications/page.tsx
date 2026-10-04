"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel, Button, StatusBadge, EmptyState } from "@/components/ui";
import { getApplications, getProjects, createApplication, updateApplicationStatus } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";
import type { ApplicationRecord, ApplicationHistoryEntry } from "@/contracts/workflows";

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("projectId") ?? "all";
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppAuthority, setNewAppAuthority] = useState("");
  const [newAppType, setNewAppType] = useState("Factory License");
  const [newAppDesc, setNewAppDesc] = useState("");

  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  const selectedProject = projects.find((project) => project.id === projectFilter);
  const activeProject = selectedProject ?? projects[0];

  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const [data, projectData] = await Promise.all([
        getApplications(projectFilter === "all" ? undefined : projectFilter),
        getProjects()
      ]);
      setApplications(data);
      setProjects(projectData);
      if (selectedApp) {
        const updatedSelected = data.find(a => a.id === selectedApp.id);
        if (updatedSelected) setSelectedApp(updatedSelected);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newAppAuthority) return;
    try {
      const nameWithPrefix = `${newAppType}: ${newAppName}`;
      if (!activeProject) return;
      const updated = await createApplication(activeProject.id, nameWithPrefix);
      setApplications(updated);
      setIsNewDialogOpen(false);
      setNewAppName("");
      setNewAppAuthority("");
      setNewAppDesc("");
    } catch (err: any) {
      alert("Error creating application");
    }
  };

  const handleStatusUpdate = async (appId: string, status: ApplicationRecord["status"]) => {
    try {
      const updated = await updateApplicationStatus(selectedApp?.projectId ?? activeProject?.id ?? "", appId, status, `Status changed to ${status}`);
      setApplications(updated);
      const updatedSelected = updated.find(a => a.id === appId);
      if (updatedSelected) setSelectedApp(updatedSelected);
      alert("Status updated successfully");
    } catch (err: any) {
      alert("Error updating status");
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            app.authority.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || app.status.toLowerCase() === statusFilter.toLowerCase().replace(" ", "_");
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const getStatusTone = (status: string) => {
    switch (status) {
      case "draft": return "neutral";
      case "submitted":
      case "under_review": return "info";
      case "changes_requested":
      case "rejected": return "warning";
      case "approved": return "positive";
      default: return "neutral";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader 
          title="Applications" 
          description={selectedProject ? `Applications for ${selectedProject.name}.` : "Track application submissions across all projects, review statuses, and follow-up tasks across authorities."}
          actions={
            <Button variant="primary" onClick={() => setIsNewDialogOpen(true)}>
              New application
            </Button>
          }
        />

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <select
            value={projectFilter}
            onChange={(event) => router.push(event.target.value === "all" ? "/applications" : `/applications?projectId=${encodeURIComponent(event.target.value)}`)}
            className="w-full sm:w-64 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#27628a] focus:ring-[#27628a] outline-none text-sm"
            aria-label="Filter applications by project"
          >
            <option value="all">All projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input 
            type="text"
            placeholder="Search by name or authority..."
            className="flex-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#27628a] focus:ring-[#27628a] outline-none text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select 
            className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 focus:border-[#27628a] focus:ring-[#27628a] outline-none bg-white min-w-[180px] text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-48 bg-slate-100 rounded-2xl"></div>
            <div className="h-48 bg-slate-100 rounded-2xl"></div>
            <div className="h-48 bg-slate-100 rounded-2xl"></div>
          </div>
        ) : error ? (
          <EmptyState title="Error loading applications" description={error} />
        ) : filteredApps.length === 0 ? (
          <EmptyState 
            title="No applications found" 
            description="Try adjusting your filters or create a new application."
            action={<Button onClick={() => setIsNewDialogOpen(true)}>New application</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map(app => (
              <div 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                className="cursor-pointer transition-transform hover:-translate-y-1 h-full"
              >
                <Panel className={`h-full flex flex-col ${selectedApp?.id === app.id ? 'ring-2 ring-[#27628a]' : ''}`}>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <StatusBadge tone={getStatusTone(app.status)}>
                      {formatStatus(app.status)}
                    </StatusBadge>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                      {app.referenceNumber || 'Pending Ref'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#172b3a] mb-1 line-clamp-2">{app.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-1">{app.authority}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Project:</span>
                      <span className="truncate ml-2 font-medium text-slate-700">{app.projectName}</span>
                    </div>
                    {app.submittedAt && (
                      <div className="flex justify-between">
                        <span>Submitted:</span>
                        <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{new Date(app.lastUpdatedAt).toLocaleDateString()}</span>
                    </div>
                    {app.pendingAction && (
                      <div className="text-amber-700 mt-1 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100 line-clamp-2">
                        Action: {app.pendingAction}
                      </div>
                    )}
                  </div>
                </Panel>
              </div>
            ))}
          </div>
        )}

        {/* Selected App Details */}
        {selectedApp && (
          <div className="mt-8 scroll-mt-8" id="app-details">
            <Panel title="Application Details" action={<Button variant="ghost" onClick={() => setSelectedApp(null)}>Close</Button>}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-[#172b3a] mb-1">{selectedApp.name}</h3>
                    <p className="text-slate-600">{selectedApp.authority}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <StatusBadge tone={getStatusTone(selectedApp.status)}>
                      {formatStatus(selectedApp.status)}
                    </StatusBadge>
                    <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      Ref: {selectedApp.referenceNumber || 'Pending'}
                    </span>
                    <span className="text-sm text-slate-500">
                      Project: {selectedApp.projectName}
                    </span>
                  </div>

                  {selectedApp.pendingAction && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
                      <h4 className="font-semibold text-sm mb-1">Action Required</h4>
                      <p className="text-sm">{selectedApp.pendingAction}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="font-semibold text-[#172b3a] mb-5 text-lg">Timeline</h4>
                    <div className="space-y-6">
                      {selectedApp.history.map((entry, idx) => (
                        <div key={entry.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-[#27628a] rounded-full mt-1.5 ring-4 ring-[#edf5fa]"></div>
                            {idx !== selectedApp.history.length - 1 && (
                              <div className="w-px h-full bg-slate-200 mt-2"></div>
                            )}
                          </div>
                          <div className="pb-2">
                            <p className="text-sm font-medium text-[#172b3a]">{entry.message}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs text-slate-500 font-mono">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                              {entry.status && (
                                <StatusBadge tone={getStatusTone(entry.status)}>
                                  {formatStatus(entry.status)}
                                </StatusBadge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-semibold text-sm text-[#172b3a] mb-4">Quick Actions</h4>
                    <div className="flex flex-col gap-3">
                      {selectedApp.status === "draft" && (
                        <Button onClick={() => handleStatusUpdate(selectedApp.id, "submitted")}>
                          Submit Application
                        </Button>
                      )}
                      {selectedApp.status === "changes_requested" && (
                        <Button onClick={() => handleStatusUpdate(selectedApp.id, "under_review")}>
                          Respond & Resubmit
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => alert("Document upload not implemented in demo")}>
                        Upload Document
                      </Button>
                    </div>
                  </div>
                  
                  {selectedApp.documents.length > 0 && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-semibold text-sm text-[#172b3a] mb-3">Attached Documents</h4>
                      <ul className="space-y-2">
                        {selectedApp.documents.map((doc, idx) => (
                          <li key={idx} className="text-sm text-[#27628a] flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                            </svg>
                            <span className="truncate">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>
        )}

      </div>

      {/* New Application Dialog */}
      {isNewDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-[#172b3a]">New Application</h2>
              <button 
                onClick={() => setIsNewDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#172b3a] mb-1.5">Approval Type</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#27628a] focus:ring-2 focus:ring-[#edf5fa] text-sm"
                  value={newAppType}
                  onChange={e => setNewAppType(e.target.value)}
                >
                  <option>Factory License</option>
                  <option>Water Connection</option>
                  <option>Fire Safety NOC</option>
                  <option>Environmental Clearance</option>
                  <option>Building Plan Approval</option>
                  <option>Trade License</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#172b3a] mb-1.5">Application Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#27628a] focus:ring-2 focus:ring-[#edf5fa] text-sm"
                  placeholder="e.g. Unit 1 Setup"
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172b3a] mb-1.5">Authority <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#27628a] focus:ring-2 focus:ring-[#edf5fa] text-sm"
                  placeholder="e.g. State Pollution Control Board"
                  value={newAppAuthority}
                  onChange={e => setNewAppAuthority(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172b3a] mb-1.5">Notes / Description</label>
                <textarea 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#27628a] focus:ring-2 focus:ring-[#edf5fa] text-sm resize-none"
                  rows={3}
                  placeholder="Add any initial notes..."
                  value={newAppDesc}
                  onChange={e => setNewAppDesc(e.target.value)}
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsNewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
