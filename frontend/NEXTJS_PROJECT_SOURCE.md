# Next.js Project Source

This document contains source files from selected Next.js project directories and configuration files.

**Project root:** `C:\Users\parth\Desktop\Projects\sih130\frontend`

**Files included:** 37

---

## `app\applications\page.tsx`

**File:** `app\applications\page.tsx`

```text
"use client";



import { useEffect, useState, useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";

import { OfficerWorkspace } from "@/components/officer-workspace";

import { PageHeader, Panel, Button, StatusBadge, EmptyState } from "@/components/ui";

import { getApplications, getProjects, createApplication, updateApplicationStatus } from "@/lib/api";

import type { MockProject } from "@/contracts/project-full";

import type { ApplicationRecord } from "@/contracts/workflows";

import { getStoredDemoRole, type DemoRole } from "@/lib/demo-role";

import { Suspense } from "react";

function ApplicationsContent() {

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

  const [role, setRole] = useState<DemoRole>("Applicant");



  useEffect(() => setRole(getStoredDemoRole()), []);



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

    } catch (err: unknown) {

      setError(err instanceof Error ? err.message : "Failed to load applications");

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

    } catch {

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

    } catch {

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



  if (role === "Officer") {

    return <OfficerWorkspace mode="applications" />;

  }



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

                <label className="block text-sm font-medium text-[#172b3a] mb-1.5">Application Name <span className="text-red-500"></span></label>

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

                <label className="block text-sm font-medium text-[#172b3a] mb-1.5">Authority <span className="text-red-500"></span></label>

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

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
```

---

## `app\assistant\page.tsx`

**File:** `app\assistant\page.tsx`

```text
"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { getConversations, createConversation, sendAssistantPrompt } from "@/lib/api";
import type { AssistantConversation, AssistantMessage } from "@/contracts/workflows";

export default function AssistantPage() {
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const projectId = "proj-vasavi-food-processing";

  useEffect(() => {
    async function loadData() {
      try {
        const convos = await getConversations(projectId);
        setConversations(convos);
        if (convos.length > 0) {
          setActiveConversationId(convos[0].id);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages, isSending]);

  const handleNewConversation = async () => {
    try {
      const newConvo = await createConversation(projectId);
      setConversations((prev) => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeConversationId) return;
    setPrompt("");
    setIsSending(true);

    try {
      const tempMessage: AssistantMessage = {
        id: "temp-" + Date.now(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId 
          ? { ...c, messages: [...c.messages, tempMessage] }
          : c
      ));

      const updated = await sendAssistantPrompt(projectId, activeConversationId, text);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? updated : c))
      );
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(prompt);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Assistant"
        description="Ask contextual questions about project approvals, dependency sequencing, and likely next actions."
        actions={
          <Button
            variant="secondary"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Hide History" : "Show History"}
          </Button>
        }
      />

      <div className="flex h-[calc(100vh-220px)] min-h-[500px] gap-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
        {/* Sidebar */}
        <div 
          className={`absolute inset-y-0 left-0 z-10 w-72 flex-col border-r border-slate-200 bg-slate-50 transition-transform md:relative md:flex md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-slate-200 bg-white">
            <Button onClick={handleNewConversation} className="w-full">
              + New conversation
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-12 rounded-lg bg-slate-200"></div>
                <div className="h-12 rounded-lg bg-slate-200"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-4">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    c.id === activeConversationId
                      ? "bg-[#edf5fa] border-[#dfeaf3] text-[#27628a]"
                      : "bg-white border-transparent hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="font-medium text-sm truncate">{c.title || "New Conversation"}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs opacity-70">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs opacity-70 bg-black/5 px-1.5 py-0.5 rounded">
                      {c.messages?.length || 0} msgs
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/20 z-0 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center">
               <div className="animate-pulse flex flex-col items-center gap-4">
                 <div className="h-8 w-8 bg-[#edf5fa] rounded-full"></div>
                 <div className="h-4 w-32 bg-slate-200 rounded"></div>
               </div>
             </div>
          ) : !activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                title="No active conversation"
                description="Select a conversation from the sidebar or start a new one."
                action={<Button onClick={handleNewConversation}>Start Chat</Button>}
              />
            </div>
          ) : (
            <>
              {/* Banner */}
              <div className="bg-amber-50 text-amber-800 text-xs px-4 py-2 text-center border-b border-amber-100 shrink-0 z-0">
                AI responses are illustrative and based on demo project data. They do not constitute official advice.
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {activeConversation.messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isUser ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? "bg-[#27628a] text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-[#172b3a] shadow-sm rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Meta information for assistant messages */}
                      {!isUser && (msg.sourceTitle || msg.verificationStatus || msg.toolName) && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 ml-1">
                          {msg.sourceTitle && (
                            <span className="text-xs text-slate-500 font-medium">
                              Source: {msg.sourceTitle}
                            </span>
                          )}
                          {msg.toolName && (
                            <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {msg.toolName}
                            </span>
                          )}
                          {msg.verificationStatus && (
                            <StatusBadge
                              tone={
                                msg.verificationStatus === "verified"
                                  ? "positive"
                                  : msg.verificationStatus === "illustrative"
                                  ? "info"
                                  : msg.verificationStatus === "needs_review"
                                  ? "warning"
                                  : "neutral"
                              }
                            >
                              {msg.verificationStatus}
                            </StatusBadge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Suggested follow-ups (only at the bottom if not sending and last msg is assistant) */}
                {!isSending && 
                 activeConversation.messages.length > 0 && 
                 activeConversation.messages[activeConversation.messages.length - 1].role === "assistant" && 
                 activeConversation.suggestedFollowUps && 
                 activeConversation.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                    {activeConversation.suggestedFollowUps.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(suggestion)}
                        className="text-xs text-[#27628a] bg-[#edf5fa] hover:bg-[#dfeaf3] border border-[#dfeaf3] px-3 py-1.5 rounded-full transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {isSending && (
                  <div className="flex flex-col mr-auto items-start max-w-[85%]">
                    <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl rounded-bl-sm px-4 py-3 text-sm italic flex items-center gap-2">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
              </div>

              {/* Composer */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
                  <textarea
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#172b3a] focus:outline-none focus:ring-2 focus:ring-[#27628a] focus:border-transparent resize-none disabled:opacity-50"
                    placeholder="Ask a question..."
                    rows={Math.min(prompt.split("\n").length || 1, 5)}
                    style={{ minHeight: "48px" }}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                  />
                  <Button
                    onClick={() => handleSend(prompt)}
                    disabled={isSending || !prompt.trim()}
                    className="shrink-0 h-[48px] px-5"
                  >
                    Send
                  </Button>
                </div>
                <div className="text-center mt-2 text-[10px] text-slate-400">
                  Press Enter to send, Shift + Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
```

---

## `app\documents\page.tsx`

**File:** `app\documents\page.tsx`

```text
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { OfficerWorkspace } from '@/components/officer-workspace';
import { getDocuments, getProjects, uploadDocument } from '@/lib/api';
import type { MockProject } from '@/contracts/project-full';
import type { ProjectDocument, UploadDocumentInput } from '@/contracts/workflows';
import { PageHeader, Panel, Button, StatusBadge, EmptyState } from '@/components/ui';
import { getStoredDemoRole, type DemoRole } from '@/lib/demo-role';

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('projectId') ?? 'all';
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    category: 'Engineering',
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [role, setRole] = useState<DemoRole>('Applicant');
    // DigiLocker integration (UI placeholders – wire to real API when available)
  type DigiLockerDoc = {
    id: string;
    name: string;
    type: string;
    issuedBy: string;
    issuedOn: string;
  };

  type DocumentWithSource = ProjectDocument & { source?: "digilocker" | "manual" };

  const [digilockerConnected, setDigilockerConnected] = useState(false);
  const [digilockerLastSync, setDigilockerLastSync] = useState<string | null>(null);
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [digilockerDocs, setDigilockerDocs] = useState<DigiLockerDoc[]>([]);
  const [selectedDigiLockerIds, setSelectedDigiLockerIds] = useState<string[]>([]);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [digilockerError, setDigilockerError] = useState<string | null>(null);
  const [digilockerImportSuccess, setDigilockerImportSuccess] = useState<string | null>(null);
  const [linkProjectId, setLinkProjectId] = useState("");
  const [linkTaskNote, setLinkTaskNote] = useState("");

  // Enrich loaded docs with a default source label for UI
  const documentsWithSource: DocumentWithSource[] = documents.map((doc) => ({
    ...doc,
    source: (doc as DocumentWithSource).source ?? "manual"
  }));

  useEffect(() => setRole(getStoredDemoRole()), []);
    const handleConnectDigiLocker = () => {
    // Placeholder: replace with real DigiLocker OAuth / consent flow
    setDigilockerConnected(true);
    setDigilockerLastSync(new Date().toISOString());
  };

  const handleDisconnectDigiLocker = () => {
    // Placeholder: replace with real session revoke
    setDigilockerConnected(false);
    setDigilockerLastSync(null);
    setDigilockerDocs([]);
    setSelectedDigiLockerIds([]);
  };

  const handleFetchDigiLockerDocs = async () => {
    setIsDigiLockerModalOpen(true);
    setDigilockerError(null);
    setDigilockerImportSuccess(null);
    setSelectedDigiLockerIds([]);
    setLinkProjectId(uploadProject?.id ?? "");
    setLinkTaskNote("");
    setDigilockerLoading(true);

    try {
      // Placeholder: replace with real DigiLocker list API call
      await new Promise((r) => setTimeout(r, 600));
      const mockDocs: DigiLockerDoc[] = [
        { id: "dl-1", name: "Aadhaar e-KYC.pdf", type: "Identity", issuedBy: "UIDAI", issuedOn: "2025-11-12" },
        { id: "dl-2", name: "PAN Card.pdf", type: "Identity", issuedBy: "Income Tax Dept", issuedOn: "2024-03-08" },
        { id: "dl-3", name: "GST Registration Certificate.pdf", type: "Business", issuedBy: "GSTN", issuedOn: "2025-06-21" },
        { id: "dl-4", name: "Udyam Registration.pdf", type: "Business", issuedBy: "MSME", issuedOn: "2025-09-02" },
        { id: "dl-5", name: "Factory Licence (State).pdf", type: "Compliance", issuedBy: "Labour Dept", issuedOn: "2025-01-18" }
      ];
      setDigilockerDocs(mockDocs);
      setDigilockerLastSync(new Date().toISOString());
    } catch {
      setDigilockerError("Unable to fetch DigiLocker documents. Please try again later.");
      setDigilockerDocs([]);
    } finally {
      setDigilockerLoading(false);
    }
  };

  const toggleDigiLockerSelection = (id: string) => {
    setSelectedDigiLockerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImportSelected = async () => {
    if (selectedDigiLockerIds.length === 0) return;
    setDigilockerLoading(true);
    setDigilockerError(null);
    setDigilockerImportSuccess(null);

    try {
      // Placeholder: replace with real import API that creates ProjectDocument records
      const project = projects.find((p) => p.id === linkProjectId) ?? uploadProject;
      if (!project) throw new Error("Select a project before importing.");

      const selected = digilockerDocs.filter((d) => selectedDigiLockerIds.includes(d.id));
      for (const item of selected) {
        const input: UploadDocumentInput = {
          projectId: project.id,
          projectName: project.name,
          name: item.name,
          type: item.type,
          category: "Other",
          sizeLabel: "—",
          relatedTaskIds: [],
          description: `Imported from DigiLocker (${item.issuedBy}). Issued on ${item.issuedOn}. Import does not automatically satisfy any requirement — link and verify as needed.`
        };
        await uploadDocument(input);
      }

      await fetchDocuments();
      setDigilockerImportSuccess(
        `${selected.length} document${selected.length > 1 ? "s" : ""} imported. They are not automatically verified or linked to requirements.`
      );
      setSelectedDigiLockerIds([]);
    } catch (err) {
      console.error(err);
      setDigilockerError("Import failed. Please try again.");
    } finally {
      setDigilockerLoading(false);
    }
  };
  const selectedProject = projects.find((project) => project.id === projectFilter);
  const uploadProject = selectedProject ?? projects[0];

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [docs, projectData] = await Promise.all([
        getDocuments(projectFilter === 'all' ? undefined : projectFilter),
        getProjects()
      ]);
      setDocuments(docs);
      setProjects(projectData);
    } catch (err) {
      console.error(err);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const input: UploadDocumentInput = {
        projectId: uploadProject?.id ?? '',
        projectName: uploadProject?.name ?? '',
        name: uploadForm.name,
        category: uploadForm.category,
        type: uploadForm.type,
        sizeLabel: '2.5 MB', // mock
        relatedTaskIds: [],
        description: uploadForm.description
      };

      if (!input.projectId) throw new Error('Select a project before uploading a document.');
      
      await uploadDocument(input);
      await fetchDocuments();
      setIsUploadOpen(false);
      setUploadForm({ name: '', type: '', category: 'Engineering', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const getVerificationTone = (status: string) => {
    switch (status) {
      case 'verified': return 'positive';
      case 'pending': return 'warning';
      case 'needs_review': return 'info';
      case 'expired': return 'neutral';
      default: return 'neutral';
    }
  };
  
  const getRequirementTone = (status: string) => {
    switch (status) {
      case 'satisfied': return 'positive';
      case 'needs_review': return 'warning';
      case 'missing': return 'warning';
      default: return 'neutral';
    }
  };

  const filteredDocuments = documentsWithSource.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Engineering', 'Utilities', 'Environmental', 'Safety', 'Operations', 'Other'];
  
  if (role === 'Officer') {
    return <OfficerWorkspace mode="documents" />;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Documents"
          description={
            selectedProject
              ? `Documents for ${selectedProject.name}.`
              : "Manage and review documents across all projects."
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={digilockerConnected ? handleFetchDigiLockerDocs : handleConnectDigiLocker}
              >
                {digilockerConnected ? "Import from DigiLocker" : "Connect DigiLocker"}
              </Button>
              <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                Upload from device
              </Button>
            </div>
          }
        />
                {/* DigiLocker connection panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-[#172b3a]">DigiLocker</h2>
                <StatusBadge tone={digilockerConnected ? "positive" : "neutral"}>
                  {digilockerConnected ? "Connected" : "Not connected"}
                </StatusBadge>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
                {digilockerConnected
                  ? "Retrieve issued documents from your DigiLocker account into IndusAI. Imported files still need to be linked to project requirements and verified — import alone does not satisfy any approval."
                  : "Connect DigiLocker to securely fetch issued certificates and identity documents. You can still upload files manually for anything not available in DigiLocker."}
              </p>
              {digilockerConnected && digilockerLastSync ? (
                <p className="mt-1 text-xs text-slate-500">
                  Last sync: {new Date(digilockerLastSync).toLocaleString("en-IN")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              {digilockerConnected ? (
                <>
                  <Button variant="primary" onClick={handleFetchDigiLockerDocs}>
                    Fetch documents
                  </Button>
                  <Button variant="secondary" onClick={handleDisconnectDigiLocker}>
                    Manage connection
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={handleConnectDigiLocker}>
                  Connect DigiLocker
                </Button>
              )}
            </div>
          </div>
        </div>

        <Panel>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={projectFilter}
                onChange={(e) => router.push(e.target.value === 'all' ? '/documents' : `/documents?projectId=${encodeURIComponent(e.target.value)}`)}
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                aria-label="Filter documents by project"
              >
                <option value="all">All projects</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-[#f8fafc] h-32 w-full"></div>
              ))}
            </div>
          ) : error ? (
            <EmptyState 
              title="Error loading documents" 
              description={error} 
              action={<Button onClick={fetchDocuments}>Retry</Button>}
            />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState 
              title="No documents found" 
              description="Upload a new document or adjust your search filters."
              action={
                <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                  Upload document
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 flex flex-col gap-4">
                  <div 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#172b3a]">{doc.name}</span>
                        <StatusBadge tone="neutral">{doc.type}</StatusBadge>
                        <StatusBadge tone="info">{doc.category}</StatusBadge>
                        <StatusBadge tone={doc.source === "digilocker" ? "info" : "neutral"}>
                          {doc.source === "digilocker" ? "DigiLocker" : "Manual upload"}
                        </StatusBadge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Project: {doc.projectName}</span>
                        <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        <span>Size: {doc.sizeLabel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge tone={getVerificationTone(doc.verificationStatus)}>
                        Verification: {doc.verificationStatus.replace('_', ' ')}
                      </StatusBadge>
                      {doc.requirementStatus && (
                        <StatusBadge tone={getRequirementTone(doc.requirementStatus)}>
                          Req: {doc.requirementStatus.replace('_', ' ')}
                        </StatusBadge>
                      )}
                    </div>
                  </div>

                  {expandedDocId === doc.id && (
                    <div className="mt-2 pt-4 border-t border-slate-200 text-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Details</h4>
                        <div className="space-y-2 text-slate-600">
                          <p><span className="font-medium">Description:</span> {doc.description || 'No description provided.'}</p>
                          <p><span className="font-medium">Document ID:</span> {doc.id}</p>
                          {doc.expiryAt && <p><span className="font-medium">Expiry:</span> {new Date(doc.expiryAt).toLocaleDateString()}</p>}
                          <p><span className="font-medium">Source Verification:</span> {doc.sourceVerificationStatus?.replace('_', ' ') || 'Unknown'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Related Tasks</h4>
                        {doc.relatedTaskIds && doc.relatedTaskIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {doc.relatedTaskIds.map(taskId => (
                              <StatusBadge key={taskId} tone="neutral">{taskId}</StatusBadge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No related tasks</p>
                        )}
                        <div className="mt-4 flex gap-2">
                           <Button variant="secondary">View full document</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#172b3a] mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. site-plan-v2.pdf"
                  value={uploadForm.name}
                  onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. PDF, CAD"
                    value={uploadForm.type}
                    onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <input
                  type="text"
                  readOnly
                  value={uploadProject?.name ?? 'Select a project'}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Optional details about this document..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isUploading || !uploadForm.name || !uploadForm.type}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
            {isDigiLockerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-[#172b3a]">Import from DigiLocker</h2>
              <p className="mt-1 text-sm text-slate-600">
                Select documents to import. Importing does <strong>not</strong> automatically
                satisfy or approve any project requirement — you can link them afterwards and
                reuse one document across multiple requirements.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {digilockerLoading && digilockerDocs.length === 0 ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : digilockerError && digilockerDocs.length === 0 ? (
                <EmptyState
                  title="Could not load DigiLocker documents"
                  description={digilockerError}
                  action={
                    <Button variant="secondary" onClick={handleFetchDigiLockerDocs}>
                      Retry
                    </Button>
                  }
                />
              ) : digilockerDocs.length === 0 ? (
                <EmptyState
                  title="No documents available"
                  description="No issued documents were returned from DigiLocker for this account."
                />
              ) : (
                <div className="space-y-2">
                  {digilockerDocs.map((item) => {
                    const checked = selectedDigiLockerIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                          checked
                            ? "border-[#27628a] bg-[#eef8ff]"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#27628a] focus:ring-[#27628a]"
                          checked={checked}
                          onChange={() => toggleDigiLockerSelection(item.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#172b3a]">{item.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.type} · Issued by {item.issuedBy} ·{" "}
                            {new Date(item.issuedOn).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {digilockerDocs.length > 0 && (
                <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Link to project
                    </label>
                    <select
                      value={linkProjectId}
                      onChange={(e) => setLinkProjectId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Optional note for requirements (not auto-linked)
                    </label>
                    <input
                      type="text"
                      value={linkTaskNote}
                      onChange={(e) => setLinkTaskNote(e.target.value)}
                      placeholder="e.g. Candidate for fire safety / site plan requirement"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      One imported document can later be associated with multiple requirements.
                      Verification status remains separate from requirement status.
                    </p>
                  </div>
                </div>
              )}

              {digilockerImportSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {digilockerImportSuccess}
                </div>
              )}
              {digilockerError && digilockerDocs.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {digilockerError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-500">
                {selectedDigiLockerIds.length} selected
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsDigiLockerModalOpen(false);
                    setDigilockerImportSuccess(null);
                    setDigilockerError(null);
                  }}
                  disabled={digilockerLoading}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleImportSelected}
                  disabled={
                    digilockerLoading ||
                    selectedDigiLockerIds.length === 0 ||
                    !linkProjectId
                  }
                >
                  {digilockerLoading ? "Importing…" : "Import selected"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
```

---

## `app\globals.css`

**File:** `app\globals.css`

```text
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  background: #f7f9fb;
  color: #172b3a;
  font-family: "Segoe UI", Arial, sans-serif;
}

html {
  scroll-behavior: smooth;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
}

@layer base {
  body {
    @apply bg-[#f7f9fb] text-[#172b3a];
  }

  a {
    @apply no-underline;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}

@layer utilities {
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
}
```

---

## `app\layout.tsx`

**File:** `app\layout.tsx`

```text
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "IndusAI | Industrial approvals",
  description: "AI-powered industrial approvals and compliance intelligence"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f9fb] text-[#172b3a] antialiased">
        {children}
      </body>
    </html>
  );
}
```

---

## `app\officer\page.tsx`

**File:** `app\officer\page.tsx`

```text
import { OfficerWorkspace } from "@/components/officer-workspace";
import { Suspense } from "react";

export default function OfficerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfficerWorkspace mode="queue" />
    </Suspense>
  );
}
```

---

## `app\page.tsx`

**File:** `app\page.tsx`

```text
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard";
import { OfficerWorkspace } from "@/components/officer-workspace";
import { Button, PageHeader } from "@/components/ui";
import { getStoredDemoRole, type DemoRole } from "@/lib/demo-role";

export default function HomePage() {
  const [role, setRole] = useState<DemoRole>("Applicant");

  useEffect(() => setRole(getStoredDemoRole()), []);

  if (role === "Officer") {
    return <OfficerWorkspace mode="dashboard" />;
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title="Approval dashboard"
        description="Monitor approvals, project milestones, and outstanding regulatory actions for your active industrial portfolio."
        actions={
          <>
            <Link href="/projects">
              <Button variant="secondary">View projects</Button>
            </Link>
            <Link href="/projects/new">
              <Button>New project</Button>
            </Link>
          </>
        }
      />
      <DashboardContent />
    </AppShell>
  );
}
```

---

## `app\projects\[id]\page.tsx`

**File:** `app\projects\[id]\page.tsx`

```text
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel, StatusBadge, EmptyState } from "@/components/ui";
import { getProject } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  
  const [project, setProject] = useState<MockProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  return (
    <AppShell>
      <PageHeader
        title={project?.name || "Project Details"}
        description={project ? "Detailed view of the project and its current status." : ""}
        actions={
          <Link href="/projects">
            <Button variant="secondary">Back to Projects</Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl p-6">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <Panel className="h-48"></Panel>
            <Panel className="h-32"></Panel>
          </div>
        ) : !project ? (
          <EmptyState
            title="Project not found"
            description="The project you are looking for does not exist or you do not have access."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Overview Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Panel>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-[#172b3a]">Project Overview</h3>
                  <StatusBadge tone={project.status === "completed" ? "positive" : project.status === "on_hold" ? "warning" : "info"}>{project.status}</StatusBadge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Organization</div>
                    <div className="font-medium text-[#172b3a]">{project.organization || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Sector</div>
                    <div className="font-medium text-[#172b3a]">{project.sector}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Location</div>
                    <div className="font-medium text-[#172b3a]">{project.location}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Stage</div>
                    <div className="font-medium text-[#172b3a]">{project.stage.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Investment</div>
                    <div className="font-medium text-[#172b3a]">{project.investmentAmount || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Site Status</div>
                    <div className="font-medium text-[#172b3a]">{project.siteStatus.replace('_', ' ')}</div>
                  </div>
                </div>

                {project.description && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-2">Description</div>
                    <p className="text-sm text-slate-700">{project.description}</p>
                  </div>
                )}
              </Panel>

              <Panel>
                <h3 className="text-lg font-bold text-[#172b3a] mb-4">Approval Progress</h3>
                <div className="mb-2 flex justify-between text-sm text-[#172b3a]">
                  <span>Overall Completion</span>
                  <span className="font-bold">{project.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden mb-4">
                  <div className="h-full bg-[#27628a]" style={{ width: `${project.progress}%` }} />
                </div>
                <p className="text-sm text-slate-500">
                  {project.completedApprovals} of {project.approvalCount} required approvals have been completed.
                </p>
              </Panel>
            </div>

            {/* Quick Links Sidebar */}
            <div className="space-y-6">
              <Panel className="bg-[#f8fafc]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#172b3a] mb-4">Quick Links</h3>
                <div className="space-y-3 flex flex-col">
                  <Link href={`/roadmap?projectId=${encodeURIComponent(project.id)}`}>
                    <Button variant="secondary" className="w-full justify-start text-left bg-white">
                      View Roadmap
                    </Button>
                  </Link>
                  <Link href={`/documents?projectId=${encodeURIComponent(project.id)}`}>
                    <Button variant="secondary" className="w-full justify-start text-left bg-white">
                      View Documents
                    </Button>
                  </Link>
                  <Link href={`/applications?projectId=${encodeURIComponent(project.id)}`}>
                    <Button variant="secondary" className="w-full justify-start text-left bg-white">
                      View Applications
                    </Button>
                  </Link>
                </div>
              </Panel>
              
              <Panel>
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Created At</div>
                <div className="text-sm text-[#172b3a] mb-4">{new Date(project.createdAt).toLocaleDateString()}</div>
                
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Last Updated</div>
                <div className="text-sm text-[#172b3a]">{new Date(project.updatedAt).toLocaleDateString()}</div>
              </Panel>
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}
```

---

## `app\projects\new\page.tsx`

**File:** `app\projects\new\page.tsx`

```text
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel } from "@/components/ui";
import { createProject } from "@/lib/api";
import type { CreateProjectInput, ProjectStage, SiteStatus } from "@/contracts/project-full";

type ChatPhase = "chat" | "preparing" | "form" | "success";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type QuestionId =
  | "name"
  | "organization"
  | "sector"
  | "description"
  | "location"
  | "stage"
  | "investmentAmount"
  | "siteStatus";

type Question = {
  id: QuestionId;
  prompt: string;
  required: boolean;
  hint?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "name",
    prompt: "What is the name of your industrial project?",
    required: true,
    hint: "e.g. Vasavi Food Processing Unit"
  },
  {
    id: "organization",
    prompt: "Which organization or company is leading this project?",
    required: true,
    hint: "e.g. Gujarat Industrial Growth Cell"
  },
  {
    id: "sector",
    prompt: "What industry sector does this project belong to?",
    required: false,
    hint: "Manufacturing, Food processing, Textiles, Metals, Electronics, or Automotive. You can also type Skip."
  },
  {
    id: "description",
    prompt: "Briefly describe the project (what you plan to build or expand).",
    required: false,
    hint: "A short paragraph is enough. Type Skip to leave this blank."
  },
  {
    id: "location",
    prompt: "Where will the project be located? (state, district, or city)",
    required: false,
    hint: "e.g. Vadodara, Gujarat. Type Skip if not decided yet."
  },
  {
    id: "stage",
    prompt: "What stage is the project currently in?",
    required: false,
    hint: "Planning, Land acquisition, Construction, Pre-operational, or Operational. Type Skip for Planning."
  },
  {
    id: "investmentAmount",
    prompt: "What is the approximate investment amount?",
    required: false,
    hint: "e.g. ₹12.5 Cr. Type Skip if unknown."
  },
  {
    id: "siteStatus",
    prompt: "What is the current site status?",
    required: false,
    hint: "Unallocated, Allocated, Possession taken, or Developed. Type Skip for Unallocated."
  }
];

const DEFAULT_FORM: CreateProjectInput = {
  name: "",
  organization: "",
  sector: "Manufacturing",
  description: "",
  location: "",
  stage: "planning",
  investmentAmount: "",
  siteStatus: "identified"
};

function normalizeStage(raw: string): ProjectStage {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (v.includes("land")) return "land_acquisition";
  if (v.includes("construct")) return "construction";
  if (v.includes("pre")) return "pre_operational";
  if (v.includes("operat")) return "operational";
  return "planning";
}

function normalizeSiteStatus(raw: string): SiteStatus {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (v.includes("lease")) return "leased";
  if (v.includes("own")) return "owned";
  if (v.includes("develop") || v.includes("under")) return "under_development";
  return "identified";
}

function normalizeSector(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v.includes("food")) return "Food processing";
  if (v.includes("textile")) return "Textiles";
  if (v.includes("metal")) return "Metals";
  if (v.includes("electron")) return "Electronics";
  if (v.includes("auto")) return "Automotive";
  if (v.includes("manufact")) return "Manufacturing";
  return raw.trim() || "Manufacturing";
}

function isSkip(text: string) {
  return /^(skip|na|n\/a|none|-)$/i.test(text.trim());
}

export default function NewProjectPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<ChatPhase>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<Partial<CreateProjectInput>>({});
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState<CreateProjectInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message + first question
  useEffect(() => {
    if (messages.length > 0) return;
    const welcome: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I’ll help you set up a new project profile for IndusAI. I’ll ask a few short questions one at a time. You can type Skip for optional fields. Ready?"
    };
    const first: ChatMessage = {
      id: `q-${QUESTIONS[0].id}`,
      role: "assistant",
      content: QUESTIONS[0].prompt + (QUESTIONS[0].hint ? `\n\n${QUESTIONS[0].hint}` : "")
    };
    setMessages([welcome, first]);
  }, [messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  useEffect(() => {
    if (phase === "chat") {
      inputRef.current?.focus();
    }
  }, [phase, questionIndex]);

  const progress = Math.min(questionIndex, QUESTIONS.length);
  const progressPct = Math.round((progress / QUESTIONS.length) * 100);

  const applyAnswer = (qid: QuestionId, raw: string) => {
    const skipped = isSkip(raw);
    setDraftAnswers((prev) => {
      const next = { ...prev };
      switch (qid) {
        case "name":
          next.name = skipped ? prev.name ?? "" : raw.trim();
          break;
        case "organization":
          next.organization = skipped ? prev.organization ?? "" : raw.trim();
          break;
        case "sector":
          next.sector = skipped ? "Manufacturing" : normalizeSector(raw);
          break;
        case "description":
          next.description = skipped ? "" : raw.trim();
          break;
        case "location":
          next.location = skipped ? "" : raw.trim();
          break;
        case "stage":
          next.stage = skipped ? "planning" : normalizeStage(raw);
          break;
        case "investmentAmount":
          next.investmentAmount = skipped ? "" : raw.trim();
          break;
        case "siteStatus":
          next.siteStatus = skipped ? "identified" : normalizeSiteStatus(raw);
          break;
      }
      return next;
    });
  };

  const finishChatAndShowForm = (finalAnswers: Partial<CreateProjectInput>) => {
    setPhase("preparing");
    const merged: CreateProjectInput = {
      ...DEFAULT_FORM,
      ...finalAnswers,
      name: (finalAnswers.name ?? "").trim(),
      organization: (finalAnswers.organization ?? "").trim()
    };
    // Brief “preparing” state, then show the same form prefilled
    window.setTimeout(() => {
      setFormData(merged);
      setPhase("form");
    }, 900);
  };

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text || isSending || phase !== "chat") return;

    const current = QUESTIONS[questionIndex];
    if (!current) return;

    // Required fields cannot be skipped empty
    if (current.required && isSkip(text)) {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: text },
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `This field is required. Please enter a ${current.id === "name" ? "project name" : "organization name"}.`
        }
      ]);
      setChatInput("");
      return;
    }
    if (current.required && !text.trim()) return;

    setIsSending(true);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    applyAnswer(current.id, text);

    const nextIndex = questionIndex + 1;

    // Build answers including this turn (state update is async)
    const tentative: Partial<CreateProjectInput> = { ...draftAnswers };
    if (current.id === "name") tentative.name = isSkip(text) ? tentative.name ?? "" : text.trim();
    if (current.id === "organization")
      tentative.organization = isSkip(text) ? tentative.organization ?? "" : text.trim();
    if (current.id === "sector") tentative.sector = isSkip(text) ? "Manufacturing" : normalizeSector(text);
    if (current.id === "description") tentative.description = isSkip(text) ? "" : text.trim();
    if (current.id === "location") tentative.location = isSkip(text) ? "" : text.trim();
    if (current.id === "stage") tentative.stage = isSkip(text) ? "planning" : normalizeStage(text);
    if (current.id === "investmentAmount")
      tentative.investmentAmount = isSkip(text) ? "" : text.trim();
    if (current.id === "siteStatus")
      tentative.siteStatus = isSkip(text) ? "identified" : normalizeSiteStatus(text);

    window.setTimeout(() => {
      if (nextIndex >= QUESTIONS.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: `done-${Date.now()}`,
            role: "assistant",
            content:
              "Thanks — I have everything I need. Preparing your project profile so you can review and edit it before creating."
          }
        ]);
        setQuestionIndex(QUESTIONS.length);
        setIsSending(false);
        finishChatAndShowForm(tentative);
        return;
      }

      setQuestionIndex(nextIndex);
      const nextQ = QUESTIONS[nextIndex];
      setMessages((prev) => [
        ...prev,
        {
          id: `q-${nextQ.id}-${Date.now()}`,
          role: "assistant",
          content: nextQ.prompt + (nextQ.hint ? `\n\n${nextQ.hint}` : "")
        }
      ]);
      setIsSending(false);
    }, 350);
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateProjectInput, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.organization.trim()) newErrors.organization = "Organization name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createProject(formData);
      setCreatedProjectId(created.id);
      setIsSuccess(true);
      setPhase("success");
      // Navigate to the real project detail page using the API-returned id
      window.setTimeout(() => {
        router.push(`/projects/${encodeURIComponent(created.id)}`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to create project. Your answers are still here — you can try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateProjectInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const backToChat = () => {
    setPhase("chat");
    setSubmitError(null);
    // Resume from last unanswered question if needed; otherwise stay at end
    if (questionIndex >= QUESTIONS.length) {
      setQuestionIndex(QUESTIONS.length - 1);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#172b3a] focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20";
  const labelClass = "block text-sm font-medium text-[#172b3a] mb-1.5";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <AppShell>
      <PageHeader
        title="New Project"
        description={
          phase === "chat" || phase === "preparing"
            ? "Answer a few questions and we’ll prepare your project profile."
            : "Review and edit the details before creating the project."
        }
      />

      <div className="mx-auto max-w-3xl p-6">
        {/* ——— Chat phase ——— */}
        {(phase === "chat" || phase === "preparing") && (
          <Panel className="flex flex-col overflow-hidden p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#172b3a]">Project setup assistant</p>
                <p className="text-xs text-slate-500">
                  {Math.min(questionIndex + (phase === "preparing" ? 1 : 0), QUESTIONS.length)} of{" "}
                  {QUESTIONS.length}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#27628a] transition-all duration-300"
                  style={{ width: `${phase === "preparing" ? 100 : progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex max-h-[420px] min-h-[320px] flex-col gap-3 overflow-y-auto bg-[#f8fafc] px-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={[
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "self-start bg-white text-[#172b3a] shadow-sm ring-1 ring-slate-200"
                      : "self-end bg-[#27628a] text-white"
                  ].join(" ")}
                >
                  {msg.content}
                </div>
              ))}
              {phase === "preparing" && (
                <div className="self-start rounded-2xl bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#27628a]" />
                    Preparing your project profile…
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {phase === "chat" && (
              <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your answer…"
                  disabled={isSending}
                  className={inputClass}
                  aria-label="Chat message"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSend}
                  disabled={isSending || !chatInput.trim()}
                >
                  Send
                </Button>
              </div>
            )}
          </Panel>
        )}

        {/* ——— Success ——— */}
        {phase === "success" && isSuccess && (
          <Panel className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold text-[#27628a]">Project Created Successfully!</h2>
            <p className="text-slate-500">
              {createdProjectId
                ? "Opening your project workspace…"
                : "Redirecting…"}
            </p>
          </Panel>
        )}

        {/* ——— Existing form (prefilled, fully editable) ——— */}
        {phase === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-600">
                Review the details collected from the conversation. Everything is editable before you create the project.
              </p>
              <Button type="button" variant="secondary" onClick={backToChat}>
                Back to conversation
              </Button>
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <Panel>
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-[#172b3a]">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Apex Textile Expansion"
                  />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                <div>
                  <label className={labelClass}>Organization Name *</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Apex Industries Ltd"
                  />
                  {errors.organization && <p className={errorClass}>{errors.organization}</p>}
                </div>

                <div>
                  <label className={labelClass}>Industry Sector</label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Food processing">Food processing</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Metals">Metals</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Brief description of the project"
                  />
                </div>
              </div>
            </Panel>

            <Panel>
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-[#172b3a]">
                Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>State / District / City</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Vadodara, Gujarat"
                  />
                </div>
              </div>
            </Panel>

            <Panel>
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-[#172b3a]">
                Project Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="planning">Planning</option>
                    <option value="land_acquisition">Land Acquisition</option>
                    <option value="construction">Construction</option>
                    <option value="pre_operational">Pre-operational</option>
                    <option value="operational">Operational</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Investment Amount</label>
                  <input
                    type="text"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. ₹50 Cr, $10M"
                  />
                </div>

                <div>
                  <label className={labelClass}>Site Status</label>
                  <select
                    name="siteStatus"
                    value={formData.siteStatus}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="unallocated">Unallocated</option>
                    <option value="allocated">Allocated</option>
                    <option value="possession_taken">Possession Taken</option>
                    <option value="developed">Developed</option>
                  </select>
                </div>
              </div>
            </Panel>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.push("/projects")}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
```

---

## `app\projects\page.tsx`

**File:** `app\projects\page.tsx`

```text
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel, StatusBadge, EmptyState } from "@/components/ui";
import { getProjects } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sector.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
  });

  return (
    <AppShell>
      <PageHeader
        title="Projects"
        description="Review active industrial projects, their milestones, and readiness across the approval lifecycle."
        actions={
          <Link href="/projects/new">
            <Button variant="primary">New project</Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl p-6">
        <Panel className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by project name, sector, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#172b3a] focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
          />
        </Panel>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <Panel key={i} className="h-48"></Panel>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Adjust your search or create a new project."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <Panel className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#172b3a] text-lg group-hover:text-[#27628a] transition-colors">{project.name}</h3>
                    <StatusBadge tone={project.status === "completed" ? "positive" : project.status === "on_hold" ? "warning" : "info"}>{project.status}</StatusBadge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-sm text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded">{project.sector}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{project.location}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                      <span>{project.stage.replace('_', ' ')}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#27628a]" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 items-center">
                    <span>{project.completedApprovals}/{project.approvalCount} approvals completed</span>
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
```

---

## `app\regulatory-updates\page.tsx`

**File:** `app\regulatory-updates\page.tsx`

```text
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
```

---

## `app\roadmap\page.tsx`

**File:** `app\roadmap\page.tsx`

```text
import { RoadmapWorkspaceView } from "@/components/roadmap";

export default function RoadmapPage() {
  return <RoadmapWorkspaceView />;
}
```

---

## `next.config.ts`

**File:** `next.config.ts`

```text
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

---

## `package.json`

**File:** `package.json`

```text
{
  "name": "indusai-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint app src",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.5.4",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@types/node": "^24.2.0",
    "@types/react": "^19.1.5",
    "@types/react-dom": "^19.1.5",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.5.4",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.9.2"
  }
}
```

---

## `postcss.config.mjs`

**File:** `postcss.config.mjs`

```text
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

---

## `src\components\app-shell.tsx`

**File:** `src\components\app-shell.tsx`

```text
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { getStoredDemoRole, setStoredDemoRole, getRoleLabel, getRoleUser, DEMO_ROLE_OPTIONS, type DemoRole } from "@/lib/demo-role";
import { getVisibleNavItems } from "@/lib/mock-permissions";

function Sidebar({
  isMobileOpen,
  onClose,
  currentRole,
  onRoleChange
}: {
  isMobileOpen: boolean;
  onClose: () => void;
  currentRole: DemoRole;
  onRoleChange: (role: DemoRole) => void;
}) {
  const pathname = usePathname();
  const navItems = getVisibleNavItems(currentRole);

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col overflow-y-auto border-r border-slate-200 bg-[#172b3a] text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
            IndusAI
          </p>
          <h2 className="mt-1 text-lg font-semibold">Operations</h2>
        </div>
        <Button variant="ghost" className="text-slate-200 lg:hidden" onClick={onClose}>
          Close
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#edf5fa] text-[#172b3a] shadow-sm"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              ].join(" ")}
              onClick={onClose}
            >
              <span>{item.label}</span>
              <span className="rounded-full border border-current/30 px-1.5 text-[10px] uppercase tracking-[0.14em] opacity-70">
                {item.href === "/" ? "home" : "nav"}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-sky-200">Current role</p>
          <div className="flex flex-col gap-1">
            {DEMO_ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  onClose();
                }}
                className={[
                  "text-left rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  currentRole === role
                    ? "bg-[#edf5fa] text-[#172b3a]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {getRoleLabel(role)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children, forcedRole }: { children: React.ReactNode; forcedRole?: DemoRole }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<DemoRole>(forcedRole ?? "Applicant");

  useEffect(() => {
    setCurrentRole(forcedRole ?? getStoredDemoRole());
  }, [forcedRole]);

  const handleRoleChange = (role: DemoRole) => {
    const leavingOfficer = currentRole === "Officer" && role !== "Officer";
    setCurrentRole(role);
    setStoredDemoRole(role);
    if (role === "Officer") router.push("/officer");
    else if (leavingOfficer) router.push("/");
  };

  const user = getRoleUser(currentRole);

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fb] text-[#172b3a]">
      <div className="flex h-full min-h-0">
        <Sidebar 
          isMobileOpen={mobileNavOpen} 
          onClose={() => setMobileNavOpen(false)} 
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="z-30 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="rounded-xl p-2 lg:hidden"
                  aria-label="Open navigation menu"
                  onClick={() => setMobileNavOpen(true)}
                >
                  ☰
                </Button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#27628a]">
                    Industrial approvals
                  </p>
                  <p className="text-sm text-slate-600">Compliance intelligence workspace</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-full border border-slate-200 bg-slate-50 p-2 text-sm font-medium text-[#172b3a]"
                >
                  🔔
                  <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#27628a]" />
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf5fa] text-xs font-semibold text-[#27628a]">
                    {user.avatar}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium text-[#172b3a]">{user.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{currentRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/45 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
    </div>
  );
}
```

---

## `src\components\application-workspace.tsx`

**File:** `src\components\application-workspace.tsx`

```text
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
      const next = await updateApplicationStatus(selectedApplication?.projectId ?? activeProjectId, applicationId, status, messageOverride ?? `Mock status update to ${status}.`);
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
```

---

## `src\components\assistant-workspace.tsx`

**File:** `src\components\assistant-workspace.tsx`

```text
"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type {
  ActivityEvent,
  ApprovalRequest,
  AssistantConversation,
  AssistantMessage,
  AssistantTool,
  NotificationItem
} from "@/contracts/workflows";
import {
  getActivity,
  getApprovalRequests,
  getAssistantTools,
  getConversations,
  getNotifications,
  markNotificationsRead,
  respondToApprovalRequest,
  retryAssistantTurn,
  sendAssistantPrompt,
  createConversation
} from "@/lib/api";

const PROJECT_ID = "proj-vasavi-food-processing";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function AssistantWorkspace() {
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [tools, setTools] = useState<AssistantTool[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [conversationData, toolData, notificationData, activityData, requestData] = await Promise.all([
          getConversations(PROJECT_ID),
          getAssistantTools(),
          getNotifications(PROJECT_ID),
          getActivity(PROJECT_ID),
          getApprovalRequests(PROJECT_ID)
        ]);

        if (!active) return;

        setConversations(conversationData);
        setSelectedConversationId((current) => current ?? conversationData[0]?.id ?? null);
        setTools(toolData);
        setNotifications(notificationData);
        setActivity(activityData);
        setRequests(requestData);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "The assistant could not be loaded.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0] ?? null,
    [conversations, selectedConversationId]
  );

  async function refreshAll() {
    const [conversationData, notificationData, activityData, requestData] = await Promise.all([
      getConversations(PROJECT_ID),
      getNotifications(PROJECT_ID),
      getActivity(PROJECT_ID),
      getApprovalRequests(PROJECT_ID)
    ]);
    setConversations(conversationData);
    setNotifications(notificationData);
    setActivity(activityData);
    setRequests(requestData);
  }

  async function handleNewConversation() {
    const next = await createConversation(PROJECT_ID);
    setConversations((current) => [next, ...current]);
    setSelectedConversationId(next.id);
  }

  async function handleSend() {
    if (!prompt.trim() || !selectedConversation) return;
    setSending(true);
    setError(null);
    try {
      const next = await sendAssistantPrompt(PROJECT_ID, selectedConversation.id, prompt.trim());
      setConversations((current) => current.map((conversation) => (conversation.id === next.id ? next : conversation)));
      setSelectedConversationId(next.id);
      setPrompt("");
      await refreshAll();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The assistant prompt could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function handleRetry() {
    if (!selectedConversation) return;
    try {
      const next = await retryAssistantTurn(PROJECT_ID, selectedConversation.id);
      setConversations((current) => current.map((conversation) => (conversation.id === next.id ? next : conversation)));
      setSelectedConversationId(next.id);
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "The assistant could not regenerate its answer.");
    }
  }

  async function handleApprovalDecision(requestId: string, decision: "approved" | "rejected") {
    const confirmed = window.confirm(
      decision === "approved"
        ? "Confirm that you want to approve this mock action? This is a simulated approval step."
        : "Reject this mock action? This requires explicit confirmation in the demo workflow."
    );

    if (!confirmed) return;

    try {
      const next = await respondToApprovalRequest(PROJECT_ID, requestId, decision);
      setRequests(next);
      await refreshAll();
      await markNotificationsRead(PROJECT_ID);
      setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The approval action could not be completed.");
    }
  }

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map((index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project AI"
        title="AI assistant"
        description="Ask contextual questions about the project roadmap, documents, regulatory dependencies, and likely next actions."
        actions={<StatusBadge tone="info">Mock guidance</StatusBadge>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr_0.7fr]">
        <Panel title="Conversations">
          <div className="mb-4 flex justify-between gap-2">
            <p className="text-sm text-slate-600">{conversations.length} active threads</p>
            <Button type="button" variant="secondary" onClick={handleNewConversation}>New</Button>
          </div>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <EmptyState title="No conversations" description="Start a new context review for this project." />
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={[
                    "w-full rounded-xl border p-3 text-left",
                    selectedConversation?.id === conversation.id ? "border-[#27628a] bg-[#edf5fa]" : "border-slate-200 bg-slate-50"
                  ].join(" ")}
                >
                  <p className="text-sm font-medium text-[#172b3a]">{conversation.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(conversation.updatedAt)}</p>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel title={selectedConversation?.title ?? "Assistant"}>
          {selectedConversation ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedConversation.suggestedFollowUps.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setPrompt(question)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="max-h-[480px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {selectedConversation.messages.map((message: AssistantMessage) => (
                  <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-[#27628a] p-3 text-sm text-white" : "mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700"}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] opacity-80">
                      <span>{formatDate(message.timestamp)}</span>
                      {message.sourceTitle ? <span>{message.sourceTitle}</span> : null}
                    </div>
                    {message.toolName ? <div className="mt-2 text-[10px] uppercase tracking-[0.12em] opacity-80">Tool: {message.toolName}</div> : null}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  placeholder="Ask about project status, documents, dependencies, or the next approval steps."
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={sending || !prompt.trim()} onClick={handleSend}>{sending ? "Sending…" : "Send"}</Button>
                  <Button type="button" variant="secondary" onClick={handleRetry}>Retry</Button>
                </div>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </div>
          ) : (
            <EmptyState title="No conversation selected" description="Start a new review to begin a mock assistant thread." />
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Tool menu">
            <div className="space-y-2">
              {tools.map((tool) => (
                <div key={tool.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#172b3a]">{tool.label}</p>
                    <span className={[
                      "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                      tool.state === "available" ? "bg-emerald-50 text-emerald-700" : tool.state === "disabled" ? "bg-amber-50 text-amber-700" : "bg-slate-200 text-slate-600"
                    ].join(" ")}>{tool.state}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{tool.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Notifications" action={<Button type="button" variant="ghost" onClick={() => markNotificationsRead(PROJECT_ID)}>Mark all read</Button>}>
            <div className="space-y-2">
              {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> : notifications.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#172b3a]">{item.title}</p>
                    {item.unread ? <span className="h-2.5 w-2.5 rounded-full bg-[#27628a]" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-500">{formatDate(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Approval requests">
            <div className="space-y-2">
              {requests.length === 0 ? <p className="text-sm text-slate-500">No pending approval requests.</p> : requests.map((request) => (
                <div key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-[#172b3a]">{request.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{request.reason}</p>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => handleApprovalDecision(request.id, "approved")}>Approve</Button>
                    <Button type="button" variant="secondary" onClick={() => handleApprovalDecision(request.id, "rejected")}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
```

---

## `src\components\dashboard.tsx`

**File:** `src\components\dashboard.tsx`

```text
"use client";

import { useEffect, useState } from "react";

import type { DashboardSummary } from "@/contracts/dashboard";
import { Button, EmptyState, Panel, StatusBadge } from "@/components/ui";
import { getDashboardSummary } from "@/lib/api";

export function DashboardContent() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (loadError) {
        if (isMounted) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "The dashboard data could not be loaded.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <EmptyState
        title="Dashboard is unavailable"
        description={error ?? "The dashboard could not be loaded from the current data source."}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold text-[#172b3a]">{metric.value}</p>
              <StatusBadge
                tone={
                  metric.tone === "positive"
                    ? "positive"
                    : metric.tone === "warning"
                      ? "warning"
                      : "neutral"
                }
              >
                {metric.change}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Panel
          title="Continue working"
          action={<StatusBadge tone="info">Illustrative data</StatusBadge>}
        >
          <div className="space-y-4">
            {summary.projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#172b3a]">{project.name}</h3>
                      {project.illustrative ? (
                        <StatusBadge tone="info">Demo</StatusBadge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {project.sector} · {project.stage}
                    </p>
                  </div>
                  <StatusBadge
                    tone={project.status.toLowerCase().includes("review") ? "warning" : "neutral"}
                  >
                    {project.status}
                  </StatusBadge>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Next due</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{project.due}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Approval</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{project.approval}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Progress</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{project.progress}%</p>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#27628a]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent activity" action={<Button variant="ghost">View all</Button>}>
          <ul className="space-y-4">
            {summary.activity.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div
                  className={
                    item.tone === "success"
                      ? "mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"
                      : item.tone === "warning"
                        ? "mt-1 h-2.5 w-2.5 rounded-full bg-amber-500"
                        : "mt-1 h-2.5 w-2.5 rounded-full bg-[#27628a]"
                  }
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#172b3a]">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
```

---

## `src\components\documents-workspace.tsx`

**File:** `src\components\documents-workspace.tsx`

```text
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
```

---

## `src\components\officer-workspace.tsx`

**File:** `src\components\officer-workspace.tsx`

```text
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
const QUEUE_STATUSES: ApplicationStatus[] = ["ready", "submitted", "under_review", "changes_requested"];
const HISTORY_STATUSES: ApplicationStatus[] = ["draft", "approved", "rejected", "cancelled"];

function formatApplicationDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

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
    const scopedApplications = useMemo(() => {
    if (mode === "queue") {
      return applications.filter((application) => QUEUE_STATUSES.includes(application.status));
    }
    if (mode === "applications") {
      return applications.filter((application) => HISTORY_STATUSES.includes(application.status));
    }
    return applications;
  }, [applications, mode]);

  const filteredApplications = useMemo(
    () =>
      scopedApplications
        .filter((application) => {
          const query = `${application.id} ${application.referenceNumber ?? ""} ${application.name} ${application.projectName} ${application.authority}`.toLowerCase();
          const matchesSearch = query.includes(search.toLowerCase());
          const matchesStatus = statusFilter === "all" || application.status === statusFilter;
          const matchesDepartment = departmentFilter === "all" || application.authority === departmentFilter;
          const matchesSla = slaFilter === "all" || slaState(application) === slaFilter;
          return matchesSearch && matchesStatus && matchesDepartment && matchesSla;
        })
        .sort((left, right) =>
          sortBy === "recent"
            ? new Date(right.lastUpdatedAt).getTime() - new Date(left.lastUpdatedAt).getTime()
            : slaState(left).localeCompare(slaState(right))
        ),
    [scopedApplications, search, statusFilter, departmentFilter, slaFilter, sortBy]
  );
  const selectedApplication = applications.find((application) => application.id === selectedApplicationId) ?? null;
  const selectedDocuments = selectedApplication ? documents.filter((document) => selectedApplication.documents.includes(document.id)) : [];
  const pendingDocuments = documents.filter((document) => document.verificationStatus === "pending" || document.verificationStatus === "needs_review");
  const attentionApplications = applications.filter(
    (application) => QUEUE_STATUSES.includes(application.status) || slaState(application) !== "within"
  );
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
    if (mode === "queue" && (status === "approved" || status === "rejected" || status === "cancelled")) {
      setStatusFilter("all");
      setSelectedApplicationId(null);
    }
    setNotice(`Application ${statusLabel(status).toLowerCase()} and timeline updated.`);    setNotice(`Application ${statusLabel(status).toLowerCase()} and timeline updated.`);
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

    const title =
    mode === "dashboard"
      ? "Officer dashboard"
      : mode === "queue"
        ? "Review queue"
        : mode === "applications"
          ? "Application history"
          : "Document review";
  const description =
    mode === "dashboard"
      ? "Review workload, deadlines, and application activity requiring officer attention."
      : mode === "queue"
        ? "Applications awaiting officer review. Approved and rejected records are not listed here."
        : mode === "applications"
          ? "History of reviewed and closed applications, including approved, rejected, and draft records."
          : "Review applicant-submitted documents linked to applications and projects.";
  
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

            {(mode === "queue" || mode === "applications") && (
        <Panel title={mode === "queue" ? "Applications requiring review" : "Application history"}>
          <div className="mb-4 grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,1fr,1fr]">
            <input
              aria-label="Search officer applications"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, applicant, project, approval"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <select
              aria-label="Filter application status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {(mode === "queue" ? QUEUE_STATUSES : HISTORY_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter department"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "all" ? "All departments" : department}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter SLA"
              value={slaFilter}
              onChange={(event) => setSlaFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="all">All SLA states</option>
              <option value="within">Within SLA</option>
              <option value="approaching">Approaching SLA</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              aria-label="Sort applications"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="sla">Sort by SLA</option>
              <option value="recent">Sort by recent activity</option>
            </select>
          </div>
          {filteredApplications.length === 0 ? (
            <EmptyState
              title={mode === "queue" ? "No applications awaiting review" : "No application history found"}
              description={
                mode === "queue"
                  ? "There are no submitted or in-review applications matching the current filters."
                  : "No approved, rejected, or draft applications match the current filters."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.1em] text-slate-500">
                  <tr>
                    {["Application", "Applicant", "Project", "Approval", "Department", "Status", "Date", "SLA", "Action"].map(
                      (heading) => (
                        <th key={heading} className="px-3 py-3">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-medium">{application.referenceNumber ?? application.id}</td>
                      <td className="px-3 py-3">
                        {projects.find((project) => project.id === application.projectId)?.organization ?? "Applicant"}
                      </td>
                      <td className="px-3 py-3">{application.projectName}</td>
                      <td className="px-3 py-3">{application.name}</td>
                      <td className="px-3 py-3">{application.authority}</td>
                      <td className="px-3 py-3">
                        <StatusBadge tone={statusTone[application.status]}>{statusLabel(application.status)}</StatusBadge>
                      </td>
                      <td className="px-3 py-3">{formatApplicationDate(application.submittedAt ?? application.lastUpdatedAt)}</td>
                      <td className="px-3 py-3">
                        <StatusBadge tone={slaTone(slaState(application))}>{slaLabel(slaState(application))}</StatusBadge>
                      </td>
                      <td className="px-3 py-3">
                        <Button variant="secondary" onClick={() => openApplication(application.id)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {mode === "documents" && <Panel title="Submitted documents requiring review"><div className="space-y-3">{documents.length === 0 ? <EmptyState title="No submitted documents" description="No documents are currently available for officer review." /> : documents.map((document) => { const application = applications.find((item) => item.documents.includes(document.id)); return <div key={document.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-medium text-[#172b3a]">{document.name}</p><p className="text-sm text-slate-600">{application?.referenceNumber ?? "Unlinked application"} · {document.projectName}</p><p className="text-xs text-slate-500">Submitted {new Date(document.uploadedAt).toLocaleDateString()} · {document.category}</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={document.verificationStatus === "verified" ? "positive" : "warning"}>{document.verificationStatus === "verified" ? "Verified" : document.verificationStatus === "needs_review" ? "Correction required" : "Pending verification"}</StatusBadge><Button variant="secondary" onClick={() => void handleDocumentAction(document, "verified")}>Verify Document</Button><Button variant="secondary" onClick={() => void handleDocumentAction(document, "needs_review")}>Request Correction</Button></div></div>})}</div></Panel>}

      {selectedApplication && <Panel title={`Review · ${selectedApplication.referenceNumber ?? selectedApplication.id}`}><div className="grid gap-6 xl:grid-cols-2"><div className="space-y-4"><div><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Applicant and project</p><p className="mt-1 font-semibold text-[#172b3a]">{projects.find((project) => project.id === selectedApplication.projectId)?.organization ?? "Applicant"}</p><p className="text-sm text-slate-600">{selectedApplication.projectName}</p></div><div><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Approval and department</p><p className="mt-1 font-semibold text-[#172b3a]">{selectedApplication.name}</p><p className="text-sm text-slate-600">{selectedApplication.authority}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Risk / attention</p><p className="mt-1 text-sm text-slate-700">{slaLabel(slaState(selectedApplication))}. Review document completeness and the application timeline before taking action.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => void handleApplicationAction("approved", "Application approved in the illustrative officer review.")}>Approve application</Button><Button variant="secondary" onClick={() => void handleApplicationAction("changes_requested", "Officer requested applicant corrections.")}>Request correction</Button><Button variant="secondary" onClick={() => void handleApplicationAction("rejected", "Application rejected in the illustrative officer review.")}>Reject application</Button></div></div><div><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Timeline</p><div className="mt-2 space-y-2">{selectedApplication.history.map((event) => <div key={event.id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="font-medium text-[#172b3a]">{event.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p></div>)}</div><p className="mt-5 text-xs uppercase tracking-[0.12em] text-slate-500">Submitted documents</p><div className="mt-2 space-y-2">{selectedDocuments.map((document) => <div key={document.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm"><span>{document.name}</span><Button variant="secondary" onClick={() => void handleDocumentAction(document, "verified")}>Verify</Button></div>)}</div></div></div></Panel>}
    </div>
  </AppShell>;
}
```

---

## `src\components\roadmap.tsx`

**File:** `src\components\roadmap.tsx`

```text
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type {
  ApprovalTaskStatus,
  RoadmapNodeType,
  RoadmapTask,
  RoadmapTaskActionId,
  RoadmapWorkspace,
  SourceVerificationStatus
} from "@/contracts/roadmap";
import { mockRoadmapApi } from "@/lib/mock-services";
import { getProjects } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

const statusMeta: Record<
  ApprovalTaskStatus,
  { label: string; tone: "positive" | "warning" | "neutral" | "info" }
> = {
  not_started: { label: "Not started", tone: "neutral" },
  blocked: { label: "Blocked", tone: "warning" },
  pending: { label: "Pending", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "warning" },
  changes_requested: { label: "Changes requested", tone: "warning" },
  completed: { label: "Completed", tone: "positive" },
  rejected: { label: "Rejected", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" }
};

const readinessMeta: Record<
  NonNullable<RoadmapTask["readiness"]>,
  { label: string; tone: "positive" | "warning" | "neutral" | "info" }
> = {
  ready: { label: "Ready", tone: "positive" },
  at_risk: { label: "At risk", tone: "warning" },
  blocked: { label: "Blocked", tone: "warning" },
  needs_review: { label: "Needs review", tone: "warning" },
  not_applicable: { label: "Not applicable", tone: "neutral" }
};

const typeMeta: Record<RoadmapNodeType, { label: string; color: string }> = {
  approval: { label: "Approval", color: "#2563eb" },
  document: { label: "Document", color: "#0ea5e9" },
  inspection: { label: "Inspection", color: "#f59e0b" },
  applicant_action: { label: "Applicant action", color: "#10b981" }
};

const verificationMeta: Record<SourceVerificationStatus, string> = {
  verified: "Verified",
  unverified: "Unverified",
  illustrative: "Illustrative",
  needs_review: "Needs review"
};

const statusOrder: Record<ApprovalTaskStatus, number> = {
  not_started: 0,
  pending: 1,
  in_progress: 2,
  submitted: 3,
  under_review: 4,
  changes_requested: 5,
  blocked: 6,
  completed: 7,
  rejected: 8,
  cancelled: 9
};

function getStatusTone(value: ApprovalTaskStatus) {
  return statusMeta[value]?.tone ?? "neutral";
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function sortTasks(tasks: RoadmapTask[], sortBy: string) {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "status":
        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99) || a.title.localeCompare(b.title);
      case "type":
        return a.node_type.localeCompare(b.node_type) || a.title.localeCompare(b.title);
      case "last_updated":
        return new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime();
      case "due_date":
      default:
        if (!a.due_at && !b.due_at) return a.title.localeCompare(b.title);
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    }
  });

  return sorted;
}

function getNodeVisual(status: ApprovalTaskStatus, readiness?: RoadmapTask["readiness"]) {
  // Blocked only when the task is explicitly blocked by status or readiness.
  // Having prerequisites alone does not make a node blocked.
  const isBlocked =
    status === "blocked" || readiness === "blocked";

  if (isBlocked) {
    return {
      fill: "#e2e8f0",
      text: "#475569",
      border: "#94a3b8",
      muted: true,
      label: "Blocked"
    };
  }

  switch (status) {
    case "completed":
      return {
        fill: "#10b981",
        text: "#ffffff",
        border: "#059669",
        muted: false,
        label: "Completed"
      };
    case "in_progress":
      return {
        fill: "#f97316",
        text: "#ffffff",
        border: "#ea580c",
        muted: false,
        label: "In progress"
      };
    case "not_started":
    case "pending":
      return {
        fill: "#3b82f6",
        text: "#ffffff",
        border: "#2563eb",
        muted: false,
        label: status === "not_started" ? "Not started" : "Pending"
      };
    case "submitted":
    case "under_review":
      return {
        fill: "#8b5cf6",
        text: "#ffffff",
        border: "#7c3aed",
        muted: false,
        label: status === "submitted" ? "Submitted" : "Under review"
      };
    case "changes_requested":
      return {
        fill: "#f59e0b",
        text: "#ffffff",
        border: "#d97706",
        muted: false,
        label: "Changes requested"
      };
    case "rejected":
      return {
        fill: "#ef4444",
        text: "#ffffff",
        border: "#dc2626",
        muted: false,
        label: "Rejected"
      };
    case "cancelled":
      return {
        fill: "#64748b",
        text: "#ffffff",
        border: "#475569",
        muted: false,
        label: "Cancelled"
      };
    default: {
      // Fallback for any future status values
      const meta = statusMeta[status as ApprovalTaskStatus];
      return {
        fill: "#64748b",
        text: "#ffffff",
        border: "#475569",
        muted: false,
        label: meta?.label ?? String(status)
      };
    }
  }
}

function NodeShape({
  type,
  text,
  selected,
  status,
  readiness,
  x,
  y,
  width,
  height,
  onClick
}: {
  type: RoadmapNodeType;
  text: string;
  selected: boolean;
  status: ApprovalTaskStatus;
  readiness?: RoadmapTask["readiness"];
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}) {
  const visual = getNodeVisual(status, readiness);
  const border = selected ? "#0f172a" : visual.border;
  const strokeWidth = selected ? 3.5 : 1.75;

  // Split long titles into up to 2 lines for readability
  const words = text.split(" ");
  let line1 = text;
  let line2 = "";
  if (text.length > 18 && words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(" ");
    line2 = words.slice(mid).join(" ");
  }

  const shape =
    type === "document"
      ? { shape: "circle" as const, cx: x + width / 2, cy: y + height / 2, r: Math.max(width / 2, 42) }
      : type === "inspection"
        ? {
            shape: "diamond" as const,
            points: `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`
          }
        : { shape: "rect" as const, x, y, width, height };

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {shape.shape === "circle" ? (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={visual.fill}
          opacity={visual.muted ? 0.55 : selected ? 1 : 0.95}
          stroke={border}
          strokeWidth={strokeWidth}
        />
      ) : shape.shape === "diamond" ? (
        <polygon
          points={shape.points}
          fill={visual.fill}
          opacity={visual.muted ? 0.55 : selected ? 1 : 0.95}
          stroke={border}
          strokeWidth={strokeWidth}
        />
      ) : (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={16}
          fill={visual.fill}
          opacity={visual.muted ? 0.55 : selected ? 1 : 0.95}
          stroke={border}
          strokeWidth={strokeWidth}
        />
      )}

      {/* Title – multiline when needed */}
      <text
        x={x + width / 2}
        y={line2 ? y + height / 2 - 10 : y + height / 2 - 4}
        fill={visual.text}
        fontSize={13}
        fontWeight={700}
        textAnchor="middle"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {line1.length > 22 ? `${line1.slice(0, 20)}…` : line1}
      </text>
      {line2 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          fill={visual.text}
          fontSize={13}
          fontWeight={700}
          textAnchor="middle"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {line2.length > 22 ? `${line2.slice(0, 20)}…` : line2}
        </text>
      ) : null}

      {/* Status label under title */}
      <text
        x={x + width / 2}
        y={line2 ? y + height / 2 + 26 : y + height / 2 + 16}
        fill={visual.muted ? "#64748b" : "rgba(255,255,255,0.92)"}
        fontSize={11}
        fontWeight={500}
        textAnchor="middle"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {visual.label}
      </text>
    </g>
  );
}

function DependencyGraph({
  workspace,
  selectedTaskId,
  onSelectTask
}: {
  workspace: RoadmapWorkspace | null;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ x: number; y: number } | null>(null);

    const layout = useMemo(() => {
    if (!workspace || workspace.graph.nodes.length === 0) {
      return { nodes: [], edges: [], width: 900, height: 560 };
    }

    const layerMap = new Map<string, number>();
    const queue: string[] = [];

    workspace.graph.nodes.forEach((node) => {
      const incoming = workspace.graph.edges.filter((edge) => edge.target === node.id).length;
      if (incoming === 0) {
        layerMap.set(node.id, 0);
        queue.push(node.id);
      }
    });

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLayer = layerMap.get(currentId) ?? 0;
      workspace.graph.edges
        .filter((edge) => edge.source === currentId)
        .forEach((edge) => {
          const nextLayer = currentLayer + 1;
          const prior = layerMap.get(edge.target) ?? Number.NEGATIVE_INFINITY;
          if (nextLayer > prior) {
            layerMap.set(edge.target, nextLayer);
            queue.push(edge.target);
          }
        });
    }

    const layerGroups = new Map<number, string[]>();
    workspace.graph.nodes.forEach((node) => {
      const layer = layerMap.get(node.id) ?? 0;
      const existing = layerGroups.get(layer) ?? [];
      existing.push(node.id);
      layerGroups.set(layer, existing);
    });

    const maxLayer = Math.max(...[...layerGroups.keys()], 0);
    const maxItemsInLayer = Math.max(...[...layerGroups.values()].map((items) => items.length), 1);

    // Increased spacing for larger, more readable nodes
    const nodeWidth = 200;
    const nodeHeight = 96;
    const layerGap = 260;
    const rowGap = 140;

    const graphWidth = Math.max(900, (maxLayer + 1) * layerGap + 80);
    const totalHeight = Math.max(560, maxItemsInLayer * rowGap + 120);

    const nodes = workspace.graph.nodes.map((node) => {
      const layer = layerMap.get(node.id) ?? 0;
      const itemsInLayer = layerGroups.get(layer) ?? [];
      const index = itemsInLayer.indexOf(node.id);
      const x = 40 + layer * layerGap + (layer % 2) * 24;
      const y = 48 + index * rowGap + (index % 2 ? 16 : 0);
      return {
        ...node,
        layoutX: x,
        layoutY: y,
        width: nodeWidth,
        height: nodeHeight
      };
    });

    const edgeData = workspace.graph.edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)!;
      const targetNode = nodes.find((n) => n.id === edge.target)!;
      return {
        ...edge,
        sourceX: sourceNode.layoutX + sourceNode.width,
        sourceY: sourceNode.layoutY + sourceNode.height / 2,
        targetX: targetNode.layoutX,
        targetY: targetNode.layoutY + targetNode.height / 2
      };
    });

    return { nodes, edges: edgeData, width: graphWidth, height: totalHeight };
  }, [workspace]);

  useEffect(() => {
    if (!workspace || layout.nodes.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const contentWidth = layout.width ?? 900;
    const contentHeight = layout.height ?? 560;
    const svgWidth = 900;
    const svgHeight = 560;
    const nextZoom = Math.min(svgWidth / (contentWidth + 80), svgHeight / (contentHeight + 60), 1.1);
    setZoom(nextZoom);
    setPan({ x: 18, y: 10 });
  }, [layout, workspace]);

  if (!workspace || workspace.graph.nodes.length === 0) {
    return (
      <EmptyState
        title="No roadmap available"
        description="This project does not yet have any approval tasks or dependencies in the illustrative mock data."
      />
    );
  }

  const fitGraph = () => {
    const width = Math.max(900, layout.width ?? 900);
    const height = Math.max(520, layout.height ?? 520);
    const nextZoom = Math.min(900 / (width + 60), 520 / (height + 50), 1.1);
    setZoom(nextZoom);
    setPan({ x: 20, y: 20 });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-1">{workspace.graph.nodes.length} tasks</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">{workspace.graph.edges.length} dependencies</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => setZoom((current) => Math.max(0.6, Number((current * 0.85).toFixed(2))))}>
            −
          </Button>
          <Button variant="secondary" type="button" onClick={() => setZoom((current) => Math.min(1.8, Number((current * 1.15).toFixed(2))))}>
            +
          </Button>
          <Button variant="secondary" type="button" onClick={fitGraph}>
            Fit view
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <svg
          role="img"
          aria-label="Roadmap dependency graph"
          className="block h-[560px] w-full cursor-grab bg-[radial-gradient(circle_at_top,_#f8fbff,_#f8fafc_35%,_#eef4f7)]"
          onWheel={(event) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 0.9 : 1.1;
            setZoom((current) => Math.min(1.8, Math.max(0.5, Number((current * delta).toFixed(2)))));
          }}
          onPointerDown={(event) => {
            dragState.current = { x: event.clientX, y: event.clientY };
            setIsDragging(true);
          }}
          onPointerMove={(event) => {
            if (!isDragging || !dragState.current) return;
            const dx = event.clientX - dragState.current.x;
            const dy = event.clientY - dragState.current.y;
            dragState.current = { x: event.clientX, y: event.clientY };
            setPan((current) => ({ x: current.x + dx / zoom, y: current.y + dy / zoom }));
          }}
          onPointerUp={() => {
            dragState.current = null;
            setIsDragging(false);
          }}
          onPointerLeave={() => {
            dragState.current = null;
            setIsDragging(false);
          }}
        >
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                        {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={`M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX + 90},${edge.sourceY} ${edge.targetX - 90},${edge.targetY} ${edge.targetX},${edge.targetY}`}
                fill="none"
                stroke="#64748b"
                strokeWidth={2.25}
                strokeOpacity={0.85}
                markerEnd="url(#arrowhead)"
              />
            ))}
            {layout.nodes.map((node) => (
              <NodeShape
                key={node.id}
                type={node.node_type}
                text={node.title}
                selected={selectedTaskId === node.id}
                status={node.status}
                readiness={node.readiness}
                x={node.layoutX}
                y={node.layoutY}
                width={node.width}
                height={node.height}
                onClick={() => onSelectTask(node.id)}
              />
            ))}
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill="#64748b" />
            </marker>
          </defs>
        </svg>
      </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Node background colors
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-emerald-500 shadow-sm" />
            <span>Completed / approved</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-orange-500 shadow-sm" />
            <span>In progress</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-blue-500 shadow-sm" />
            <span>Available to start</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-slate-300 shadow-sm opacity-70" />
            <span>Blocked (prerequisites incomplete)</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-violet-500 shadow-sm" />
            <span>Submitted / under review</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-amber-500 shadow-sm" />
            <span>Changes requested</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-red-500 shadow-sm" />
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-slate-500 shadow-sm" />
            <span>Cancelled</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Node shape still indicates type (rectangle = approval / action, circle = document, diamond = inspection). Selected nodes have a stronger dark border.
        </p>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  isSelected,
  onSelect
}: {
  task: RoadmapTask;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border p-4 text-left transition-colors",
        isSelected ? "border-[#27628a] bg-[#eef8ff]" : "border-slate-200 bg-white hover:bg-slate-50"
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
              style={{ backgroundColor: typeMeta[task.node_type].color }}
            >
              {typeMeta[task.node_type].label}
            </span>
            <h3 className="truncate text-base font-semibold text-[#172b3a]">{task.title}</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">{task.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={getStatusTone(task.status)}>{statusMeta[task.status].label}</StatusBadge>
          {task.readiness ? (
            <StatusBadge tone={readinessMeta[task.readiness].tone}>
              {readinessMeta[task.readiness].label}
            </StatusBadge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Due</p>
          <p className="mt-1 font-medium text-slate-800">{formatDate(task.due_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Owner</p>
          <p className="mt-1 font-medium text-slate-800">{task.responsible_party ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Dependencies</p>
          <p className="mt-1 font-medium text-slate-800">{task.prerequisites.length ? task.prerequisites.length : "None"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Updated</p>
          <p className="mt-1 font-medium text-slate-800">{formatDate(task.last_updated_at)}</p>
        </div>
      </div>
    </button>
  );
}

function RoadmapListView({
  workspace,
  selectedTaskId,
  onSelectTask,
  search,
  statusFilter,
  typeFilter,
  sortBy,
  setSearch,
  setStatusFilter,
  setTypeFilter,
  setSortBy,
  groupBy,
  setGroupBy,
  clearFilters
}: {
  workspace: RoadmapWorkspace | null;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  search: string;
  statusFilter: "all" | ApprovalTaskStatus;
  typeFilter: "all" | RoadmapNodeType;
  sortBy: string;
  setSearch: (value: string) => void;
  setStatusFilter: (value: "all" | ApprovalTaskStatus) => void;
  setTypeFilter: (value: "all" | RoadmapNodeType) => void;
  setSortBy: (value: string) => void;
  groupBy: "none" | "status" | "type";
  setGroupBy: (value: "none" | "status" | "type") => void;
  clearFilters: () => void;
}) {
  const tasks = useMemo(() => {
    if (!workspace) return [];

    const filtered = workspace.tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesType = typeFilter === "all" || task.node_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    return sortTasks(filtered, sortBy);
  }, [workspace, search, statusFilter, typeFilter, sortBy]);

  const groupedTasks = useMemo(() => {
    if (groupBy === "none") {
      return { All: tasks };
    }

    const collection = new Map<string, RoadmapTask[]>();
    tasks.forEach((task) => {
      const key = groupBy === "status" ? statusMeta[task.status].label : typeMeta[task.node_type].label;
      const current = collection.get(key) ?? [];
      current.push(task);
      collection.set(key, current);
    });

    return Object.fromEntries(collection.entries());
  }, [tasks, groupBy]);

  if (!workspace) {
    return <div className="text-sm text-slate-500">Loading roadmap…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,1fr,1.2fr]">
          <input
            aria-label="Search approval tasks"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task name"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-[#27628a]"
          />
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | ApprovalTaskStatus)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(statusMeta).map(([status]) => (
              <option key={status} value={status}>
                {statusMeta[status as ApprovalTaskStatus].label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as "all" | RoadmapNodeType)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="all">All types</option>
            {Object.entries(typeMeta).map(([type, details]) => (
              <option key={type} value={type}>
                {details.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort tasks"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="due_date">Due date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="type">Type</option>
            <option value="last_updated">Last updated</option>
          </select>
          <div className="flex items-center gap-2">
            <select
              aria-label="Group tasks"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as "none" | "status" | "type")}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="none">No grouping</option>
              <option value="status">Group by status</option>
              <option value="type">Group by type</option>
            </select>
            <Button variant="secondary" type="button" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your filters"
          description="Adjust your search or clear the current filters to see the full roadmap."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([groupName, groupItems]) => (
            <div key={groupName} className="space-y-3">
              {groupBy !== "none" ? (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{groupName}</span>
                  <span className="text-xs text-slate-400">({groupItems.length})</span>
                </div>
              ) : null}
              <div className="space-y-3">
                {groupItems.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={() => onSelectTask(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskDetailDrawer({
  task,
  projectName,
  workspace,
  onClose,
  onTaskSelection,
  onUpdateTaskStatus,
  onAddNote,
  noteDraft,
  setNoteDraft,
  isSaving
}: {
  task: RoadmapTask | null;
  projectName: string;
  workspace: RoadmapWorkspace | null;
  onClose: () => void;
  onTaskSelection: (taskId: string) => void;
  onUpdateTaskStatus: (nextStatus: ApprovalTaskStatus) => Promise<void>;
  onAddNote: () => Promise<void>;
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  isSaving: boolean;
}) {
  if (!task || !workspace) {
    return null;
  }

  const prerequisites = task.prerequisites
    .map((id) => workspace.tasks.find((entry) => entry.id === id))
    .filter(Boolean) as RoadmapTask[];
  const dependents = task.dependents
    .map((id) => workspace.tasks.find((entry) => entry.id === id))
    .filter(Boolean) as RoadmapTask[];

  return (
    <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#27628a]">{projectName}</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#172b3a]">{task.title}</h2>
          </div>
          <Button variant="ghost" type="button" onClick={onClose} aria-label="Close task details">
            Close
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={getStatusTone(task.status)}>{statusMeta[task.status].label}</StatusBadge>
          {task.readiness ? (
            <StatusBadge tone={readinessMeta[task.readiness].tone}>{readinessMeta[task.readiness].label}</StatusBadge>
          ) : null}
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
            {typeMeta[task.node_type].label}
          </span>
        </div>

        <Panel title="Overview">
          <dl className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Authority</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{task.authority ?? "Illustrative authority"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Source verification</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{verificationMeta[task.source_verification_status]}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Responsible party</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{task.responsible_party ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Due date</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{formatDate(task.due_at)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-700">{task.description}</p>
        </Panel>

        {task.blocked_reason ? (
          <Panel title="Blocked reason">
            <p className="text-sm text-slate-700">{task.blocked_reason}</p>
            {prerequisites.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {prerequisites.map((dependency) => (
                  <Button key={dependency.id} variant="secondary" type="button" onClick={() => onTaskSelection(dependency.id)}>
                    View prerequisite: {dependency.title}
                  </Button>
                ))}
              </div>
            ) : null}
          </Panel>
        ) : null}

        <Panel title="Readiness and source references">
          <div className="space-y-3">
            {task.readiness ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">Readiness</span>
                <StatusBadge tone={readinessMeta[task.readiness].tone}>{readinessMeta[task.readiness].label}</StatusBadge>
              </div>
            ) : null}
            {task.applicability_rationale ? (
              <p className="text-sm text-slate-700">{task.applicability_rationale}</p>
            ) : null}
            {task.source_refs.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {task.source_refs.map((reference) => (
                  <li key={reference.source_id} className="rounded-xl border border-slate-200 p-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{reference.label}</span>
                      <StatusBadge tone={reference.verification_status === "verified" ? "positive" : reference.verification_status === "illustrative" ? "info" : "warning"}>
                        {verificationMeta[reference.verification_status]}
                      </StatusBadge>
                    </div>
                    {reference.url ? (
                      <a href={reference.url} className="mt-2 inline-block text-xs text-[#27628a] underline" target="_blank" rel="noreferrer">
                        View reference
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>

        <Panel title="Dependencies">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Prerequisites</p>
              {prerequisites.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {prerequisites.map((dependency) => (
                    <li key={dependency.id}>
                      <button type="button" className="text-left text-sm text-[#27628a] underline" onClick={() => onTaskSelection(dependency.id)}>
                        {dependency.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No prerequisites</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Dependents</p>
              {dependents.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {dependents.map((dependent) => (
                    <li key={dependent.id}>
                      <button type="button" className="text-left text-sm text-[#27628a] underline" onClick={() => onTaskSelection(dependent.id)}>
                        {dependent.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No downstream tasks</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Documents and activity">
          <div className="space-y-3">
            {task.required_documents.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Required documents</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {task.required_documents.map((doc) => (
                    <li key={doc} className="rounded-lg border border-slate-200 px-2 py-1.5">
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {task.activity.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Recent activity</p>
                <ul className="mt-2 space-y-2">
                  {task.activity.slice(0, 4).map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-slate-200 p-2 text-sm text-slate-700">
                      <p className="font-medium text-[#172b3a]">{entry.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.actor} · {formatDate(entry.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Actions">
          <div className="flex flex-wrap gap-2">
            {task.available_actions.map((action) => (
              <Button
                key={action}
                variant={action === "mark_complete" ? "primary" : "secondary"}
                type="button"
                onClick={() => {
                  if (action === "add_note") {
                    return void onAddNote();
                  }
                  const nextStatusMap: Partial<Record<RoadmapTaskActionId, ApprovalTaskStatus>> = {
                    mark_complete: "completed",
                    mark_in_progress: "in_progress",
                    submit_for_review: "under_review",
                    request_changes: "changes_requested"
                  };
                  const nextStatus = nextStatusMap[action as keyof typeof nextStatusMap];
                  if (nextStatus) {
                    void onUpdateTaskStatus(nextStatus);
                  }
                }}
                disabled={isSaving}
              >
                {action === "mark_complete"
                  ? "Mark complete"
                  : action === "mark_in_progress"
                    ? "Resume task"
                    : action === "submit_for_review"
                      ? "Submit for review"
                      : action === "request_changes"
                        ? "Request changes"
                        : "Add note"}
              </Button>
            ))}
          </div>

          <div className="mt-4">
            <label htmlFor="task-note" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Add note
            </label>
            <textarea
              id="task-note"
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              placeholder="Capture follow-up actions, clarifications, or contextual notes."
            />
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="primary" onClick={() => void onAddNote()} disabled={isSaving || !noteDraft.trim()}>
                Save note
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </aside>
  );
}

export function RoadmapWorkspaceView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedProjectId = searchParams.get("projectId");
  const [workspace, setWorkspace] = useState<RoadmapWorkspace | null>(null);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(requestedProjectId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApprovalTaskStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | RoadmapNodeType>("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [groupBy, setGroupBy] = useState<"none" | "status" | "type">("status");
  const [noteDraft, setNoteDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const projectData = await getProjects();
        const projectId = requestedProjectId && projectData.some((project) => project.id === requestedProjectId)
          ? requestedProjectId
          : projectData[0]?.id;
        if (!projectId) throw new Error("No projects are available for the roadmap.");
        if (!cancelled) {
          setProjects(projectData);
          setSelectedProjectId(projectId);
        }
        const roadmap = await mockRoadmapApi.getProjectRoadmap(projectId);
        if (!cancelled) {
          setWorkspace(roadmap);
          setSelectedTaskId(roadmap.tasks[0]?.id ?? null);
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError("Unable to load the roadmap workspace. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [requestedProjectId]);

  const selectedTask = useMemo(() => {
    if (!workspace || !selectedTaskId) return null;
    return workspace.tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [workspace, selectedTaskId]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setGroupBy("status");
    setSortBy("due_date");
  };

  const handleTaskUpdate = async (nextStatus: ApprovalTaskStatus) => {
    if (!workspace || !selectedTask) return;
    const shouldContinue = window.confirm(`Update “${selectedTask.title}” to ${statusMeta[nextStatus].label}?`);
    if (!shouldContinue) return;

    try {
      setIsSaving(true);
      if (!selectedProjectId) return;
      const nextWorkspace = await mockRoadmapApi.updateTask(selectedProjectId, selectedTask.id, { status: nextStatus });
      setWorkspace(nextWorkspace);
      setSelectedTaskId(selectedTask.id);
      setNotice(`Task status updated to ${statusMeta[nextStatus].label}.`);
    } catch (updateError) {
      console.error(updateError);
      setNotice("This status change is not permitted for the current task workflow.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!workspace || !selectedTask || !noteDraft.trim()) return;

    try {
      setIsSaving(true);
      if (!selectedProjectId) return;
      const nextWorkspace = await mockRoadmapApi.addTaskNote(selectedProjectId, selectedTask.id, noteDraft.trim());
      setWorkspace(nextWorkspace);
      setNoteDraft("");
      setNotice("Note saved to the roadmap timeline.");
    } catch (addError) {
      console.error(addError);
      setNotice("Unable to save the note right now.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Approval Roadmap" description="Loading the project roadmap and active dependencies…" />
        <Panel>
          <div className="py-10 text-center text-sm text-slate-500">Loading illustrative roadmap data…</div>
        </Panel>
      </AppShell>
    );
  }

  if (error || !workspace) {
    return (
      <AppShell>
        <PageHeader title="Approval Roadmap" description="Illustrative roadmap data for planning and mock workflow testing." />
        <EmptyState
          title="Roadmap unavailable"
          description={error ?? "The roadmap is not available right now."}
          action={<Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Illustrative roadmap data"
          title={workspace.project_name}
          description={`${workspace.location} · The mock service represents illustrative approval activities and dependency relationships only.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Select roadmap project"
                value={selectedProjectId ?? ""}
                onChange={(event) => router.push(`/roadmap?projectId=${encodeURIComponent(event.target.value)}`)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <Button variant={view === "graph" ? "primary" : "secondary"} type="button" onClick={() => setView("graph")}>
                Graph view
              </Button>
              <Button variant={view === "list" ? "primary" : "secondary"} type="button" onClick={() => setView("list")}>
                List view
              </Button>
            </div>
          }
        />

        {notice ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total tasks", value: workspace.summary.total_tasks },
            { label: "Completed", value: workspace.summary.completed_tasks },
            { label: "Pending", value: workspace.summary.pending_tasks },
            { label: "Blocked", value: workspace.summary.blocked_tasks },
            { label: "In progress", value: workspace.summary.in_progress_tasks }
          ].map((metric) => (
            <Panel key={metric.label} className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#172b3a]">{metric.value}</p>
            </Panel>
          ))}
        </div>

        <Panel title="Roadmap summary" action={<span className="text-xs text-slate-500">Updated {formatDate(workspace.summary.last_updated_at)}</span>}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-600">Overall roadmap progress</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-3 w-64 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[#27628a]" style={{ width: `${workspace.summary.overall_progress}%` }} />
                </div>
                <span className="text-lg font-semibold text-[#172b3a]">{workspace.summary.overall_progress}%</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {workspace.summary.next_recommended_actions.map((action) => (
                <StatusBadge key={action} tone="info">
                  {action}
                </StatusBadge>
              ))}
            </div>
          </div>
        </Panel>

        {view === "graph" ? (
          <DependencyGraph workspace={workspace} selectedTaskId={selectedTaskId} onSelectTask={(taskId) => setSelectedTaskId(taskId)} />
        ) : (
          <RoadmapListView
            workspace={workspace}
            selectedTaskId={selectedTaskId}
            onSelectTask={(taskId) => setSelectedTaskId(taskId)}
            search={search}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            sortBy={sortBy}
            setSearch={setSearch}
            setStatusFilter={setStatusFilter}
            setTypeFilter={setTypeFilter}
            setSortBy={setSortBy}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            clearFilters={clearFilters}
          />
        )}
      </div>

      {selectedTask ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30"
            onClick={() => setSelectedTaskId(null)}
            onKeyDown={(e) => { if (e.key === 'Escape') setSelectedTaskId(null); }}
            role="button"
            tabIndex={-1}
            aria-label="Close task details"
          />
          <TaskDetailDrawer
            task={selectedTask}
            projectName={workspace.project_name}
            workspace={workspace}
            onClose={() => setSelectedTaskId(null)}
            onTaskSelection={(taskId) => setSelectedTaskId(taskId)}
            onUpdateTaskStatus={handleTaskUpdate}
            onAddNote={handleAddNote}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            isSaving={isSaving}
          />
        </>
      ) : null}
    </AppShell>
  );
}
```

---

## `src\components\route-placeholder.tsx`

**File:** `src\components\route-placeholder.tsx`

```text
import { Button, PageHeader, Panel } from "@/components/ui";

export function RoutePlaceholder({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeader
        eyebrow="IndusAI workspace"
        title={title}
        description={description}
        actions={<Button variant="secondary">Open quick actions</Button>}
      />

      <Panel title="Illustrative workspace view" className="max-w-3xl">
        <p className="text-sm leading-7 text-slate-600">
          This section is intentionally kept minimal as a route placeholder for the next
          feature phase. The shell, design tokens, responsive layout, and mock service layer
          are in place so future product surfaces can be added without rewriting the base UI.
        </p>
        <div className="mt-5 flex gap-3">
          <Button>Review backlog</Button>
          <Button variant="secondary">View guidance</Button>
        </div>
      </Panel>
    </>
  );
}
```

---

## `src\components\ui.tsx`

**File:** `src\components\ui.tsx`

```text
import type { ReactNode } from "react";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children?: ReactNode;
}) {
  const variants = {
    primary:
      "bg-[#27628a] text-white hover:bg-[#214f76] focus-visible:ring-[#27628a]",
    secondary:
      "border border-slate-200 bg-white text-[#172b3a] hover:bg-slate-50 focus-visible:ring-[#27628a]",
    ghost: "bg-transparent text-[#172b3a] hover:bg-slate-100 focus-visible:ring-[#27628a]"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  action,
  children,
  className
}: {
  title?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-base font-semibold text-[#172b3a]">{title}</h2> : null}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({
  tone,
  children
}: {
  tone: "positive" | "warning" | "neutral" | "info";
  children: ReactNode;
}) {
  const tones = {
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    neutral: "bg-slate-100 text-slate-700 ring-slate-200",
    info: "bg-[#edf5fa] text-[#27628a] ring-[#dfeaf3]"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-base font-semibold text-[#172b3a]">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#27628a]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172b3a]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```

---

## `src\contracts\dashboard.ts`

**File:** `src\contracts\dashboard.ts`

```text
export type MetricTone = "positive" | "neutral" | "warning";

export interface DemoUser {
  id: string;
  name: string;
  role: "Applicant" | "Officer" | "Administrator";
  organization: string;
  location: string;
  avatar: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  tone: MetricTone;
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  sector: string;
  stage: string;
  status: string;
  due: string;
  approval: string;
  progress: number;
  illustrative: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "info" | "warning" | "success";
}

export interface DashboardSummary {
  user: DemoUser;
  metrics: DashboardMetric[];
  projects: ProjectSnapshot[];
  activity: ActivityItem[];
}
```

---

## `src\contracts\errors.ts`

**File:** `src\contracts\errors.ts`

```text
export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Array<{ path: string; message: string }>;
    request_id: string;
  };
}
```

---

## `src\contracts\project-full.ts`

**File:** `src\contracts\project-full.ts`

```text
import type { ProjectStage, SiteStatus } from './project';

export type { ProjectStage, SiteStatus } from './project';

export interface MockProject {
  id: string;
  name: string;
  sector: string;
  stage: ProjectStage;
  status: 'active' | 'completed' | 'on_hold';
  location: string;
  organization: string;
  description: string;
  investmentAmount: string;
  siteStatus: SiteStatus;
  createdAt: string;
  updatedAt: string;
  progress: number;
  approvalCount: number;
  completedApprovals: number;
}

export interface CreateProjectInput {
  name: string;
  sector: string;
  stage: ProjectStage;
  location: string;
  organization: string;
  description: string;
  investmentAmount: string;
  siteStatus: SiteStatus;
}
```

---

## `src\contracts\project.ts`

**File:** `src\contracts\project.ts`

```text
export type SiteStatus =
  | "identified"
  | "leased"
  | "owned"
  | "under_development";

export type ProjectStage =
  | "planning"
  | "land_acquisition"
  | "construction"
  | "pre_operational"
  | "operational";

export interface ProjectProfile {
  sector: string | null;
  products: string[];
  location: string | null;
  /** Decimal amount encoded as a string to preserve monetary precision. */
  investment_amount: string | null;
  investment_currency: string;
  site_status: SiteStatus | null;
  project_stage: ProjectStage | null;
}
```

---

## `src\contracts\roadmap.ts`

**File:** `src\contracts\roadmap.ts`

```text
export type RoadmapNodeType =
  | "approval"
  | "document"
  | "inspection"
  | "applicant_action";

export type ApprovalTaskStatus =
  | "not_started"
  | "blocked"
  | "pending"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "completed"
  | "rejected"
  | "cancelled";

export type RoadmapReadiness =
  | "ready"
  | "at_risk"
  | "blocked"
  | "needs_review"
  | "not_applicable";

export type SourceVerificationStatus =
  | "verified"
  | "unverified"
  | "illustrative"
  | "needs_review";

export type RoadmapTaskActionId =
  | "mark_complete"
  | "mark_in_progress"
  | "submit_for_review"
  | "request_changes"
  | "add_note";

export interface SourceReference {
  source_id: string;
  version_id: string | null;
  label: string;
  url: string | null;
  verification_status: SourceVerificationStatus;
}

export interface TaskActivityEntry {
  id: string;
  actor: string;
  message: string;
  timestamp: string;
  type: "status" | "note" | "document" | "action";
}

export interface TaskNote {
  id: string;
  author: string;
  created_at: string;
  text: string;
}

export interface RoadmapTask {
  id: string;
  node_type: RoadmapNodeType;
  title: string;
  description: string;
  status: ApprovalTaskStatus;
  readiness: RoadmapReadiness | null;
  authority: string | null;
  responsible_party: string | null;
  applicability_rationale: string | null;
  source_verification_status: SourceVerificationStatus;
  source_refs: SourceReference[];
  required_documents: string[];
  prerequisites: string[];
  dependents: string[];
  document_requirement_ids: string[];
  estimated_sla_days: number | null;
  due_at: string | null;
  last_updated_at: string;
  blocked_reason: string | null;
  notes: TaskNote[];
  activity: TaskActivityEntry[];
  permitted_status_updates: ApprovalTaskStatus[];
  available_actions: RoadmapTaskActionId[];
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  edge_type: "depends_on";
}

export interface RoadmapGraph {
  project_id: string;
  version: number;
  generated_at: string;
  nodes: RoadmapTask[];
  edges: RoadmapEdge[];
}

export interface RoadmapSummary {
  project_name: string;
  location: string;
  overall_progress: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  blocked_tasks: number;
  in_progress_tasks: number;
  next_recommended_actions: string[];
  last_updated_at: string;
}

export interface RoadmapWorkspace {
  project_id: string;
  project_name: string;
  location: string;
  last_updated_at: string;
  summary: RoadmapSummary;
  graph: RoadmapGraph;
  tasks: RoadmapTask[];
}

export interface TaskUpdateInput {
  status?: ApprovalTaskStatus;
  readiness?: RoadmapReadiness | null;
  blocked_reason?: string | null;
  due_at?: string | null;
  notes?: string;
}

export type RoadmapTaskUpdate = TaskUpdateInput;
```

---

## `src\contracts\workflows.ts`

**File:** `src\contracts\workflows.ts`

```text
import type { SourceVerificationStatus } from "@/contracts/roadmap";

export type DocumentStatus = "verified" | "pending" | "needs_review" | "expired";
export type RequirementStatus = "satisfied" | "missing" | "needs_review";

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  projectId: string;
  projectName: string;
  uploadedAt: string;
  expiryAt: string | null;
  verificationStatus: DocumentStatus;
  sizeLabel: string;
  description: string;
  relatedTaskIds: string[];
  requirementStatus: RequirementStatus;
  sourceVerificationStatus: SourceVerificationStatus;
}

export type ApplicationStatus =
  | "draft"
  | "ready"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ApplicationHistoryEntry {
  id: string;
  timestamp: string;
  status: ApplicationStatus | null;
  message: string;
}

export interface ApplicationRecord {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  authority: string;
  referenceNumber: string | null;
  status: ApplicationStatus;
  submittedAt: string | null;
  lastUpdatedAt: string;
  pendingAction: string | null;
  relatedTaskIds: string[];
  documents: string[];
  history: ApplicationHistoryEntry[];
}

export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  timestamp: string;
  sourceTitle?: string;
  verificationStatus?: SourceVerificationStatus;
  toolName?: string;
  feedback?: "positive" | "negative" | null;
}

export interface AssistantConversation {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
  suggestedFollowUps: string[];
}

export type ToolState = "available" | "disabled" | "unavailable";

export interface AssistantTool {
  id: string;
  label: string;
  detail: string;
  state: ToolState;
}

export interface ActivityEvent {
  id: string;
  type: "project" | "approval" | "document" | "application" | "assistant" | "approval_request";
  title: string;
  description: string;
  timestamp: string;
  projectId: string;
  taskId?: string;
  read: boolean;
}

export interface NotificationItem {
  id: string;
  type: ActivityEvent["type"];
  title: string;
  description: string;
  timestamp: string;
  projectId: string;
  taskId?: string;
  unread: boolean;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  reason: string;
  projectId: string;
  taskId?: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  actionLabel: string;
}

export type OfficerReviewStatus = "assigned" | "in_review" | "changes_requested" | "approved" | "rejected";
export type RegulatoryUpdateStatus = "pending" | "reviewed" | "flagged";

export interface OfficerReviewItem {
  id: string;
  projectId: string;
  projectName: string;
  applicantName: string;
  taskName: string;
  status: OfficerReviewStatus;
  priority: "Low" | "Medium" | "High";
  submittedAt: string;
  lastUpdatedAt: string;
  summary: string;
  relatedTaskId?: string;
  hasDocuments: boolean;
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  source: string;
  summary: string;
  status: RegulatoryUpdateStatus;
  publishedAt: string;
  affectedAreas: string[];
  note?: string;
  sourceVerificationStatus: SourceVerificationStatus;
}

export interface AdminOverviewSummary {
  totalUsers: number;
  totalProjects: number;
  openReviews: number;
  pendingRegulatoryUpdates: number;
}

export interface UploadDocumentInput {
  projectId: string;
  projectName: string;
  name: string;
  category: string;
  type: string;
  sizeLabel: string;
  relatedTaskIds: string[];
  expiryAt?: string | null;
  description?: string;
}
```

---

## `src\lib\api.ts`

**File:** `src\lib\api.ts`

```text
import type { DashboardSummary } from "@/contracts/dashboard";
import type {
  ActivityEvent,
  ApprovalRequest,
  AssistantConversation,
  AssistantTool,
  ApplicationRecord,
  NotificationItem,
  ProjectDocument,
  UploadDocumentInput,
  AdminOverviewSummary,
  OfficerReviewItem,
  RegulatoryUpdate
} from "@/contracts/workflows";
import type { MockProject, CreateProjectInput } from "@/contracts/project-full";

import { apiBaseUrl, isMockMode } from "@/lib/config";
import {
  mockApprovalRequestsApi,
  mockApplicationsApi,
  mockAssistantApi,
  mockDashboardApi,
  mockDocumentApi,
  mockNotificationApi,
  mockProjectsApi,
  mockRegulatoryUpdatesApi,
  mockOfficerReviewApi,
  mockAdminApi
} from "@/lib/mock-services";
import type { DocumentStatus } from "@/contracts/workflows";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(new URL(path, apiBaseUrl), {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`IndusAI API request failed (${response.status}).`);
  }

  return (await response.json()) as T;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (isMockMode) {
    return mockDashboardApi.getDashboardSummary();
  }

  return apiGet<DashboardSummary>("/dashboard/summary");
}

export async function getDocuments(projectId?: string): Promise<ProjectDocument[]> {
  if (isMockMode) {
    return mockDocumentApi.getDocuments(projectId);
  }

  return apiGet<ProjectDocument[]>(projectId ? `/projects/${projectId}/documents` : "/documents");
}

export async function uploadDocument(input: UploadDocumentInput): Promise<ProjectDocument[]> {
  if (isMockMode) {
    return mockDocumentApi.uploadDocument(input);
  }

  return apiGet<ProjectDocument[]>(`/projects/${input.projectId}/documents`);
}

export async function updateDocumentStatus(documentId: string, status: DocumentStatus, reason?: string): Promise<ProjectDocument[]> {
  if (isMockMode) {
    return mockDocumentApi.updateDocumentStatus(documentId, status, reason);
  }
  return apiGet<ProjectDocument[]>(`/documents/${documentId}`);
}

export async function getApplications(projectId?: string): Promise<ApplicationRecord[]> {
  if (isMockMode) {
    return mockApplicationsApi.getApplications(projectId);
  }

  return apiGet<ApplicationRecord[]>(projectId ? `/projects/${projectId}/applications` : "/applications");
}

export async function createApplication(projectId: string, name: string): Promise<ApplicationRecord[]> {
  if (isMockMode) {
    return mockApplicationsApi.createDraftApplication(projectId, name);
  }

  return apiGet<ApplicationRecord[]>(`/projects/${projectId}/applications`);
}

export async function updateApplicationStatus(
  projectId: string,
  applicationId: string,
  status: ApplicationRecord["status"],
  message?: string
): Promise<ApplicationRecord[]> {
  if (isMockMode) {
    return mockApplicationsApi.updateApplicationStatus(projectId, applicationId, status, message);
  }

  return apiGet<ApplicationRecord[]>(`/projects/${projectId}/applications`);
}

export async function getConversations(projectId: string): Promise<AssistantConversation[]> {
  if (isMockMode) {
    return mockAssistantApi.getConversations(projectId);
  }

  return apiGet<AssistantConversation[]>(`/projects/${projectId}/assistant/conversations`);
}

export async function createConversation(projectId: string): Promise<AssistantConversation> {
  if (isMockMode) {
    return mockAssistantApi.createConversation(projectId);
  }

  return apiGet<AssistantConversation>(`/projects/${projectId}/assistant/conversations`);
}

export async function sendAssistantPrompt(
  projectId: string,
  conversationId: string,
  prompt: string
): Promise<AssistantConversation> {
  if (isMockMode) {
    return mockAssistantApi.addMessage(projectId, conversationId, prompt);
  }

  return apiGet<AssistantConversation>(`/projects/${projectId}/assistant/conversations/${conversationId}`);
}

export async function retryAssistantTurn(
  projectId: string,
  conversationId: string
): Promise<AssistantConversation> {
  if (isMockMode) {
    return mockAssistantApi.retryAssistantTurn(projectId, conversationId);
  }

  return apiGet<AssistantConversation>(`/projects/${projectId}/assistant/conversations/${conversationId}`);
}

export async function getAssistantTools(): Promise<AssistantTool[]> {
  if (isMockMode) {
    return mockAssistantApi.getTools();
  }

  return apiGet<AssistantTool[]>("/assistant/tools");
}

export async function getActivity(projectId: string): Promise<ActivityEvent[]> {
  if (isMockMode) {
    return mockNotificationApi.getActivity(projectId);
  }

  return apiGet<ActivityEvent[]>(`/projects/${projectId}/activity`);
}

export async function getNotifications(projectId: string): Promise<NotificationItem[]> {
  if (isMockMode) {
    return mockNotificationApi.getNotifications(projectId);
  }

  return apiGet<NotificationItem[]>(`/projects/${projectId}/notifications`);
}

export async function markNotificationsRead(projectId: string): Promise<void> {
  if (isMockMode) {
    await mockNotificationApi.markAllRead(projectId);
    return;
  }
}

export async function getApprovalRequests(projectId: string): Promise<ApprovalRequest[]> {
  if (isMockMode) {
    return mockApprovalRequestsApi.list(projectId);
  }

  return apiGet<ApprovalRequest[]>(`/projects/${projectId}/approval-requests`);
}

export async function respondToApprovalRequest(
  projectId: string,
  requestId: string,
  decision: "approved" | "rejected"
): Promise<ApprovalRequest[]> {
  if (isMockMode) {
    return mockApprovalRequestsApi.respond(projectId, requestId, decision);
  }

  return apiGet<ApprovalRequest[]>(`/projects/${projectId}/approval-requests`);
}


export async function getProjects(): Promise<MockProject[]> {
  if (isMockMode) {
    return mockProjectsApi.getProjects();
  }
  return apiGet<MockProject[]>('/projects');
}

export async function getProject(id: string): Promise<MockProject | null> {
  if (isMockMode) {
    return mockProjectsApi.getProject(id);
  }
  return apiGet<MockProject | null>(`/projects/${id}`);
}

export async function createProject(input: CreateProjectInput): Promise<MockProject> {
  if (isMockMode) {
    return mockProjectsApi.createProject(input);
  }
  // Simplified for demo since it usually takes fetch POST
  return apiGet<MockProject>('/projects');
}

export async function getRegulatoryUpdates(): Promise<RegulatoryUpdate[]> {
  if (isMockMode) {
    return mockRegulatoryUpdatesApi.getUpdates();
  }
  return apiGet<RegulatoryUpdate[]>('/regulatory-updates');
}

export async function getOfficerReviews(): Promise<OfficerReviewItem[]> {
  if (isMockMode) {
    return mockOfficerReviewApi.getReviews();
  }
  return apiGet<OfficerReviewItem[]>('/officer-reviews');
}

export async function updateOfficerReview(id: string, status: 'approved' | 'rejected' | 'changes_requested', note?: string): Promise<OfficerReviewItem[]> {
  if (isMockMode) {
    return mockOfficerReviewApi.updateReview(id, status, note);
  }
  return apiGet<OfficerReviewItem[]>(`/officer-reviews/${id}`);
}

export async function getAdminOverview(): Promise<AdminOverviewSummary> {
  if (isMockMode) {
    return mockAdminApi.getOverview();
  }
  return apiGet<AdminOverviewSummary>('/admin/overview');
}
```

---

## `src\lib\config.ts`

**File:** `src\lib\config.ts`

```text
export const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";

export const isMockMode = apiMode === "mock";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
```

---

## `src\lib\demo-role.ts`

**File:** `src\lib\demo-role.ts`

```text
export type DemoRole = "Applicant" | "Officer" | "Administrator";

export const DEMO_ROLE_OPTIONS: DemoRole[] = ["Applicant", "Officer", "Administrator"];

const DEMO_ROLE_STORAGE_KEY = "indusai-demo-role";

export function getStoredDemoRole(): DemoRole {
  if (typeof window === "undefined") {
    return "Applicant";
  }

  const saved = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);
  if (saved === "Officer" || saved === "Administrator") {
    return saved;
  }

  return "Applicant";
}

export function setStoredDemoRole(role: DemoRole): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
}

export function getRoleLabel(role: DemoRole): string {
  switch (role) {
    case "Officer":
      return "Officer workspace";
    case "Administrator":
      return "Administrator workspace";
    default:
      return "Applicant workspace";
  }
}

export function getRoleUser(role: DemoRole): {
  name: string;
  avatar: string;
  organization: string;
} {
  switch (role) {
    case "Officer":
      return {
        name: "Malik Desai",
        avatar: "MD",
        organization: "Vadodara Industrial Compliance Office"
      };
    case "Administrator":
      return {
        name: "Priya Shenoy",
        avatar: "PS",
        organization: "IndusAI Platform Administration"
      };
    default:
      return {
        name: "Asha Nair",
        avatar: "AN",
        organization: "Gujarat Industrial Growth Cell"
      };
  }
}
```

---

## `src\lib\mock-permissions.ts`

**File:** `src\lib\mock-permissions.ts`

```text
import type { DemoRole } from "@/lib/demo-role";

export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS_BY_ROLE: Record<DemoRole, NavItem[]> = {
  Applicant: [
    { href: "/", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/documents", label: "Documents" },
    { href: "/applications", label: "Applications" },
    { href: "/assistant", label: "AI Assistant" },
    { href: "/regulatory-updates", label: "Regulatory Updates" }
  ],
  Officer: [
    { href: "/", label: "Dashboard" },
    { href: "/officer", label: "Review Queue" },
    { href: "/applications", label: "Applications" },
    { href: "/documents", label: "Documents" }
  ],
  Administrator: [
    { href: "/", label: "Dashboard" },
    { href: "/admin", label: "Admin Overview" },
    { href: "/regulatory-updates", label: "Regulatory Updates" },
    { href: "/projects", label: "Projects" },
    { href: "/assistant", label: "AI Assistant" }
  ]
};

export function getVisibleNavItems(role: DemoRole): NavItem[] {
  return NAV_ITEMS_BY_ROLE[role];
}

export function getRolePermissions(role: DemoRole) {
  return {
    canAccessApplicantWorkflows: role === "Applicant",
    canReviewApplications: role === "Officer" || role === "Administrator",
    canManagePlatformState: role === "Administrator"
  };
}
```

---

## `src\lib\mock-services.ts`

**File:** `src\lib\mock-services.ts`

```text
import type { DashboardSummary } from "@/contracts/dashboard";
import type {
  ApprovalRequest,
  ActivityEvent,
  ApplicationRecord,
  AssistantConversation,
  AssistantMessage,
  AssistantTool,
  NotificationItem,
  ProjectDocument,
  RequirementStatus,
  UploadDocumentInput,
  AdminOverviewSummary,
  OfficerReviewItem,
  RegulatoryUpdate
} from "@/contracts/workflows";
import type { MockProject, CreateProjectInput } from "@/contracts/project-full";
import type { ApprovalTaskStatus } from "@/contracts/roadmap";
import type {
  RoadmapEdge,
  RoadmapTask,
  RoadmapTaskActionId,
  RoadmapWorkspace,
  TaskUpdateInput
} from "@/contracts/roadmap";

const DASHBOARD_STORAGE_KEY = "indusai-demo-dashboard";
const ROADMAP_STORAGE_KEY = "indusai-demo-roadmap";
const PROJECTS_STORAGE_KEY = "indusai-demo-projects";
const REGULATORY_UPDATES_STORAGE_KEY = "indusai-demo-regulatory-updates";
const OFFICER_REVIEWS_STORAGE_KEY = "indusai-demo-officer-reviews";

const mockUser = {
  id: "usr-204",
  name: "Asha Nair",
  role: "Applicant" as const,
  organization: "Gujarat Industrial Growth Cell",
  location: "Vadodara, Gujarat",
  avatar: "AN"
};

const defaultSummary: DashboardSummary = {
  user: mockUser,
  metrics: [
    {
      label: "Active approvals",
      value: "8",
      change: "+2 this month",
      tone: "positive"
    },
    {
      label: "Documents due",
      value: "3",
      change: "1 urgent",
      tone: "warning"
    },
    {
      label: "Compliant items",
      value: "92%",
      change: "+6 pts",
      tone: "positive"
    },
    {
      label: "Officer actions",
      value: "5",
      change: "2 awaiting response",
      tone: "neutral"
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Vasavi Food Processing Unit",
      sector: "Food processing",
      stage: "Construction",
      status: "In progress",
      due: "12 Jun 2026",
      approval: "Consent to Establish",
      progress: 78,
      illustrative: true
    },
    {
      id: "proj-2",
      name: "Apex Textile Expansion",
      sector: "Textiles",
      stage: "Pre-operational",
      status: "Pending review",
      due: "24 Jun 2026",
      approval: "Factory license renewal",
      progress: 59,
      illustrative: true
    },
    {
      id: "proj-3",
      name: "Mehta Metalworks",
      sector: "Metals",
      stage: "Land acquisition",
      status: "Awaiting documents",
      due: "07 Jul 2026",
      approval: "Fire safety approval",
      progress: 34,
      illustrative: true
    }
  ],
  activity: [
    {
      id: "act-1",
      title: "Pollution control checklist uploaded",
      detail: "Updated for the Vasavi project",
      time: "18 minutes ago",
      tone: "success"
    },
    {
      id: "act-2",
      title: "Officer query received",
      detail: "Factory expansion documents returned for clarification",
      time: "1 hour ago",
      tone: "warning"
    },
    {
      id: "act-3",
      title: "Calendar reminder created",
      detail: "Inspection window available for 06 July",
      time: "Yesterday",
      tone: "info"
    }
  ]
};

function readStoredSummary(): DashboardSummary | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as DashboardSummary;
  } catch {
    return null;
  }
}

function writeStoredSummary(summary: DashboardSummary): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(summary));
}

function waitForDemo<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 350);
  });
}

function makeRoadmapTask(task: RoadmapTask): RoadmapTask {
  return {
    ...task,
    prerequisites: [...task.prerequisites],
    dependents: [...task.dependents],
    required_documents: [...task.required_documents],
    document_requirement_ids: [...task.document_requirement_ids],
    source_refs: [...task.source_refs],
    notes: [...task.notes],
    activity: [...task.activity],
    available_actions: [...task.available_actions],
    permitted_status_updates: [...task.permitted_status_updates]
  };
}

const roadmapBase: RoadmapWorkspace = {
  project_id: "proj-vasavi-food-processing",
  project_name: "Vasavi Food Processing Unit",
  location: "Vadodara, Gujarat",
  last_updated_at: "2026-10-03T09:40:00Z",
  summary: {
    project_name: "Vasavi Food Processing Unit",
    location: "Vadodara, Gujarat",
    overall_progress: 68,
    total_tasks: 9,
    completed_tasks: 3,
    pending_tasks: 2,
    blocked_tasks: 1,
    in_progress_tasks: 3,
    next_recommended_actions: ["Complete effluent treatment review", "Schedule site inspection", "Upload final fire safety checklist"],
    last_updated_at: "2026-10-03T09:40:00Z"
  },
  graph: {
    project_id: "proj-vasavi-food-processing",
    version: 1,
    generated_at: "2026-10-03T09:40:00Z",
    nodes: [],
    edges: []
  },
  tasks: [
    {
      id: "site-layout-plan",
      node_type: "document",
      title: "Site layout plan",
      description: "Illustrative site plan required for risk assessment and inspection scheduling.",
      status: "completed",
      readiness: "ready",
      authority: "State industrial development authority",
      responsible_party: "Project engineering team",
      applicability_rationale: "Illustrative requirement for this industrial project configuration.",
      source_verification_status: "illustrative",
      source_refs: [
        {
          source_id: "src-001",
          version_id: "v1",
          label: "Illustrative zoning checklist",
          url: "https://example.gov.in/illustrative/zoning-checklist",
          verification_status: "illustrative"
        }
      ],
      required_documents: ["Site layout plan.pdf"],
      prerequisites: [],
      dependents: ["inspection-site", "fire-safety-clearance"],
      document_requirement_ids: ["doc-001"],
      estimated_sla_days: 7,
      due_at: "2026-09-20T00:00:00Z",
      last_updated_at: "2026-09-21T00:00:00Z",
      blocked_reason: null,
      notes: [{ id: "n-001", author: "Project analyst", created_at: "2026-09-21T00:00:00Z", text: "Site plan approved for the illustrative data set." }],
      activity: [
        { id: "a-001", actor: "Project analyst", message: "Site layout plan was uploaded and marked complete.", timestamp: "2026-09-21T00:00:00Z", type: "document" },
        { id: "a-002", actor: "System", message: "Inspection scheduling dependency was updated.", timestamp: "2026-09-22T00:00:00Z", type: "status" }
      ],
      permitted_status_updates: ["completed", "changes_requested"],
      available_actions: ["mark_in_progress", "request_changes", "add_note"]
    },
    {
      id: "water-connection",
      node_type: "approval",
      title: "Water connection approval",
      description: "Illustrative approval for water utility fit-out and source intake assessment.",
      status: "completed",
      readiness: "ready",
      authority: "Municipal utilities office",
      responsible_party: "Facilities lead",
      applicability_rationale: "Illustrative stage-gated approval based on planned process water demand.",
      source_verification_status: "verified",
      source_refs: [
        {
          source_id: "src-002",
          version_id: "v2",
          label: "Illustrative utility approval reference",
          url: "https://example.gov.in/illustrative/utility-approval",
          verification_status: "verified"
        }
      ],
      required_documents: ["Water demand estimate.pdf"],
      prerequisites: ["site-layout-plan"],
      dependents: ["effluent-treatment-review"],
      document_requirement_ids: ["doc-002"],
      estimated_sla_days: 14,
      due_at: "2026-09-30T00:00:00Z",
      last_updated_at: "2026-09-30T00:00:00Z",
      blocked_reason: null,
      notes: [{ id: "n-002", author: "Compliance manager", created_at: "2026-09-30T00:00:00Z", text: "Connection approval obtained in the illustrative mock environment." }],
      activity: [{ id: "a-003", actor: "Compliance manager", message: "Approval status updated to completed.", timestamp: "2026-09-30T00:00:00Z", type: "status" }],
      permitted_status_updates: ["completed", "under_review"],
      available_actions: ["submit_for_review", "add_note"]
    },
    {
      id: "effluent-treatment-review",
      node_type: "approval",
      title: "Effluent treatment review",
      description: "Review of process effluent treatment arrangements and discharge readiness.",
      status: "in_progress",
      readiness: "ready",
      authority: "Pollution control board",
      responsible_party: "Environmental compliance lead",
      applicability_rationale: "Illustrative readiness status based on approved water and site inputs.",
      source_verification_status: "needs_review",
      source_refs: [
        {
          source_id: "src-003",
          version_id: "v1",
          label: "Illustrative discharge checklist",
          url: null,
          verification_status: "needs_review"
        }
      ],
      required_documents: ["Effluent treatment plan.pdf", "Process water balance.xlsx"],
      prerequisites: ["site-layout-plan", "water-connection"],
      dependents: ["fire-safety-clearance"],
      document_requirement_ids: ["doc-003", "doc-004"],
      estimated_sla_days: 18,
      due_at: "2026-10-12T00:00:00Z",
      last_updated_at: "2026-10-02T00:00:00Z",
      blocked_reason: null,
      notes: [{ id: "n-003", author: "Environmental engineer", created_at: "2026-10-02T00:00:00Z", text: "Awaiting final process balance sign-off." }],
      activity: [{ id: "a-004", actor: "Environmental engineer", message: "Review package was opened and assigned for completion.", timestamp: "2026-10-02T00:00:00Z", type: "action" }],
      permitted_status_updates: ["in_progress", "submitted", "blocked"],
      available_actions: ["submit_for_review", "mark_in_progress", "add_note"]
    },
    {
      id: "inspection-site",
      node_type: "inspection",
      title: "Site inspection scheduling",
      description: "Inspection planning and site readiness review for the production unit.",
      status: "pending",
      readiness: "at_risk",
      authority: "Factory inspectorate",
      responsible_party: "Operations manager",
      applicability_rationale: "Illustrative pre-operational inspection requirement.",
      source_verification_status: "unverified",
      source_refs: [
        {
          source_id: "src-004",
          version_id: "v1",
          label: "Illustrative inspection advisory",
          url: "https://example.gov.in/illustrative/inspection-advisory",
          verification_status: "unverified"
        }
      ],
      required_documents: ["Firewall clearance certificate.pdf"],
      prerequisites: ["site-layout-plan"],
      dependents: ["fire-safety-clearance"],
      document_requirement_ids: ["doc-005"],
      estimated_sla_days: 10,
      due_at: "2026-10-08T00:00:00Z",
      last_updated_at: "2026-10-01T00:00:00Z",
      blocked_reason: null,
      notes: [{ id: "n-004", author: "Operations manager", created_at: "2026-10-01T00:00:00Z", text: "Inspection slot to be aligned with commissioning schedule." }],
      activity: [{ id: "a-005", actor: "Operations manager", message: "Inspection date has been proposed but remains pending confirmation.", timestamp: "2026-10-01T00:00:00Z", type: "status" }],
      permitted_status_updates: ["pending", "in_progress", "completed"],
      available_actions: ["mark_in_progress", "add_note"]
    },
    {
      id: "fire-safety-clearance",
      node_type: "approval",
      title: "Fire safety clearance",
      description: "Illustrative fire safety approval after inspection and safety readiness confirmation.",
      status: "blocked",
      readiness: "blocked",
      authority: "State fire services department",
      responsible_party: "Safety manager",
      applicability_rationale: "Illustrative requirement triggered by scale and hazardous process configuration.",
      source_verification_status: "illustrative",
      source_refs: [
        {
          source_id: "src-005",
          version_id: "v1",
          label: "Illustrative fire safety checklist",
          url: null,
          verification_status: "illustrative"
        }
      ],
      required_documents: ["Fire safety layout.pdf", "Emergency drill records.pdf"],
      prerequisites: ["site-layout-plan", "inspection-site", "effluent-treatment-review"],
      dependents: ["factory-license"],
      document_requirement_ids: ["doc-006", "doc-007"],
      estimated_sla_days: 15,
      due_at: "2026-10-18T00:00:00Z",
      last_updated_at: "2026-10-03T09:20:00Z",
      blocked_reason: "Awaiting final fire layout approval and the scheduled site inspection before clearance can be issued.",
      notes: [{ id: "n-005", author: "Safety manager", created_at: "2026-10-03T09:20:00Z", text: "Waiting on inspection confirmation and emergency layout sign-off." }],
      activity: [
        { id: "a-006", actor: "Safety manager", message: "Task was marked blocked pending inspection completion.", timestamp: "2026-10-03T09:20:00Z", type: "status" },
        { id: "a-007", actor: "Project analyst", message: "Prerequisite review identified the inspection schedule as the blocking dependency.", timestamp: "2026-10-03T09:25:00Z", type: "action" }
      ],
      permitted_status_updates: ["in_progress", "submitted", "blocked"],
      available_actions: ["mark_in_progress", "submit_for_review", "add_note"]
    },
    {
      id: "applicant-qa-response",
      node_type: "applicant_action",
      title: "Respond to officer queries",
      description: "Address outstanding queries and revise the fire and effluent appendices.",
      status: "pending",
      readiness: "needs_review",
      authority: "Applicant operations desk",
      responsible_party: "Applicant coordinator",
      applicability_rationale: "Illustrative action required to resolve procedural clarifications.",
      source_verification_status: "verified",
      source_refs: [
        {
          source_id: "src-006",
          version_id: "v2",
          label: "Illustrative response workflow",
          url: "https://example.gov.in/illustrative/response-workflow",
          verification_status: "verified"
        }
      ],
      required_documents: ["Query response draft.pdf"],
      prerequisites: ["fire-safety-clearance"],
      dependents: ["factory-license"],
      document_requirement_ids: ["doc-008"],
      estimated_sla_days: 5,
      due_at: "2026-10-05T00:00:00Z",
      last_updated_at: "2026-10-03T08:10:00Z",
      blocked_reason: "Waiting for the fire safety clearance to move out of the blocked state.",
      notes: [{ id: "n-006", author: "Applicant coordinator", created_at: "2026-10-03T08:10:00Z", text: "Draft clarifications have been prepared and are ready for submission once clearance is active." }],
      activity: [{ id: "a-008", actor: "Applicant coordinator", message: "Query response checklist drafted.", timestamp: "2026-10-03T08:10:00Z", type: "note" }],
      permitted_status_updates: ["pending", "submitted", "completed"],
      available_actions: ["mark_complete", "submit_for_review", "add_note"]
    },
    {
      id: "factory-license",
      node_type: "approval",
      title: "Factory license application",
      description: "Primary factory license application after fire and environmental review milestones.",
      status: "under_review",
      readiness: "ready",
      authority: "Factory licensing office",
      responsible_party: "Compliance desk",
      applicability_rationale: "Illustrative downstream approval activated after upstream clearances are near completion.",
      source_verification_status: "verified",
      source_refs: [
        {
          source_id: "src-007",
          version_id: "v1",
          label: "Illustrative factory license checklist",
          url: null,
          verification_status: "verified"
        }
      ],
      required_documents: ["License application.pdf", "Factory layout approval.pdf"],
      prerequisites: ["fire-safety-clearance", "applicant-qa-response"],
      dependents: [],
      document_requirement_ids: ["doc-009", "doc-010"],
      estimated_sla_days: 21,
      due_at: "2026-10-24T00:00:00Z",
      last_updated_at: "2026-10-03T09:10:00Z",
      blocked_reason: null,
      notes: [{ id: "n-007", author: "Compliance desk", created_at: "2026-10-03T09:10:00Z", text: "Application package is under officer review." }],
      activity: [{ id: "a-009", actor: "Compliance desk", message: "Application moved into officer review after prerequisite checks.", timestamp: "2026-10-03T09:10:00Z", type: "status" }],
      permitted_status_updates: ["under_review", "changes_requested", "completed"],
      available_actions: ["mark_complete", "request_changes", "add_note"]
    },
    {
      id: "document-utility-plan",
      node_type: "document",
      title: "Utility and drainage plan",
      description: "Illustrative drainage and utility layout document for process area readiness.",
      status: "not_started",
      readiness: "not_applicable",
      authority: "Engineering team",
      responsible_party: "Utilities engineer",
      applicability_rationale: "Illustrative documentation item linked to downstream approval readiness.",
      source_verification_status: "illustrative",
      source_refs: [
        { source_id: "src-008", version_id: "v1", label: "Illustrative engineering memo", url: null, verification_status: "illustrative" }
      ],
      required_documents: ["Drainage plan.pdf"],
      prerequisites: [],
      dependents: [],
      document_requirement_ids: ["doc-011"],
      estimated_sla_days: 6,
      due_at: "2026-10-07T00:00:00Z",
      last_updated_at: "2026-10-03T07:15:00Z",
      blocked_reason: null,
      notes: [],
      activity: [{ id: "a-010", actor: "Utilities engineer", message: "Document queued for engineering review.", timestamp: "2026-10-03T07:15:00Z", type: "document" }],
      permitted_status_updates: ["not_started", "pending", "submitted"],
      available_actions: ["mark_in_progress", "add_note"]
    }
  ]
};

function ensureRoadmapData(projectIdValue = roadmapBase.project_id): RoadmapWorkspace {
  const stored = readStoredRoadmap(projectIdValue);
  if (stored) {
    return stored;
  }

    if (projectIdValue !== roadmapBase.project_id) {
    const project = ensureProjects().find((entry) => entry.id === projectIdValue);
    if (!project) {
      // Graceful fallback for unknown / stale IDs instead of throwing
            const fallback: MockProject = {
        id: projectIdValue,
        name: "New project",
        sector: "Manufacturing",
        stage: "planning",
        status: "active",
        location: "Not specified",
        organization: "Not specified",
        description: "",
        investmentAmount: "",
        siteStatus: "identified",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        approvalCount: 5,
        completedApprovals: 0
      };
      const generated = createProjectRoadmap(fallback);
      writeStoredRoadmap(generated);
      return generated;
    }
    const generated = createProjectRoadmap(project);
    writeStoredRoadmap(generated);
    return generated;
  }

  const edges: RoadmapEdge[] = [
    { id: "edge-1", source: "site-layout-plan", target: "inspection-site", edge_type: "depends_on" },
    { id: "edge-2", source: "site-layout-plan", target: "fire-safety-clearance", edge_type: "depends_on" },
    { id: "edge-3", source: "site-layout-plan", target: "effluent-treatment-review", edge_type: "depends_on" },
    { id: "edge-4", source: "water-connection", target: "effluent-treatment-review", edge_type: "depends_on" },
    { id: "edge-5", source: "inspection-site", target: "fire-safety-clearance", edge_type: "depends_on" },
    { id: "edge-6", source: "effluent-treatment-review", target: "fire-safety-clearance", edge_type: "depends_on" },
    { id: "edge-7", source: "fire-safety-clearance", target: "factory-license", edge_type: "depends_on" },
    { id: "edge-8", source: "applicant-qa-response", target: "factory-license", edge_type: "depends_on" }
  ];

  const base: RoadmapWorkspace = {
    ...roadmapBase,
    graph: {
      ...roadmapBase.graph,
      nodes: roadmapBase.tasks.map((task) => makeRoadmapTask(task)),
      edges
    },
    tasks: roadmapBase.tasks.map((task) => makeRoadmapTask(task))
  };

  writeStoredRoadmap(base);
  return base;
}

function readStoredRoadmap(projectIdValue = roadmapBase.project_id): RoadmapWorkspace | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(roadmapStorageKey(projectIdValue));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as RoadmapWorkspace;
  } catch {
    return null;
  }
}

function writeStoredRoadmap(roadmap: RoadmapWorkspace): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(roadmapStorageKey(roadmap.project_id), JSON.stringify(roadmap));
}

function computeRoadmapSummary(workspace: RoadmapWorkspace): RoadmapWorkspace {
  const tasks = workspace.tasks;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const pending = tasks.filter((task) => task.status === "pending" || task.status === "not_started").length;
  const updatedAt = new Date().toISOString();

  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    ...workspace,
    last_updated_at: updatedAt,
    summary: {
      project_name: workspace.project_name,
      location: workspace.location,
      overall_progress: progress,
      total_tasks: total,
      completed_tasks: completed,
      pending_tasks: pending,
      blocked_tasks: blocked,
      in_progress_tasks: inProgress,
      next_recommended_actions: [
        "Complete effluent treatment review",
        "Schedule site inspection",
        "Upload final fire safety checklist"
      ],
      last_updated_at: updatedAt
    }
  };
}

function syncTaskDependents(tasks: RoadmapTask[]): RoadmapTask[] {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  return tasks.map((task) => {
    const prerequisites = task.prerequisites.filter((id) => taskMap.has(id));
    const dependents = tasks
      .filter((candidate) => candidate.prerequisites.includes(task.id))
      .map((candidate) => candidate.id);

    return {
      ...task,
      prerequisites,
      dependents
    };
  });
}

export const mockDashboardApi = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const stored = readStoredSummary() ?? defaultSummary;
    writeStoredSummary(stored);
    return waitForDemo(stored);
  },
  async reset(): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    }
  }
};

export const mockRoadmapApi = {
  async getProjectRoadmap(projectId: string): Promise<RoadmapWorkspace> {
    const workspace = ensureRoadmapData(projectId);
    if (projectId !== workspace.project_id) {
      throw new Error(`Project ${projectId} not found in mock roadmap data.`);
    }
    const nextWorkspace = computeRoadmapSummary(workspace);
    writeStoredRoadmap(nextWorkspace);
    return waitForDemo(nextWorkspace);
  },

  async getTask(projectId: string, taskId: string): Promise<RoadmapTask> {
    const workspace = ensureRoadmapData(projectId);
    const task = workspace.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new Error(`Roadmap task ${taskId} not found.`);
    }
    if (projectId !== workspace.project_id) {
      throw new Error(`Project ${projectId} not found in mock roadmap data.`);
    }
    return waitForDemo(task);
  },

  async addTaskNote(projectId: string, taskId: string, noteText: string): Promise<RoadmapWorkspace> {
    const workspace = ensureRoadmapData(projectId);
    if (projectId !== workspace.project_id) {
      throw new Error(`Project ${projectId} not found in mock roadmap data.`);
    }
    const task = workspace.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new Error(`Roadmap task ${taskId} not found.`);
    }

    const updatedTask: RoadmapTask = {
      ...task,
      notes: [
        ...task.notes,
        {
          id: `note-${Date.now()}`,
          author: "Applicant coordinator",
          created_at: new Date().toISOString(),
          text: noteText
        }
      ],
      activity: [
        ...task.activity,
        {
          id: `activity-${Date.now()}`,
          actor: "Applicant coordinator",
          message: `Added note: ${noteText}`,
          timestamp: new Date().toISOString(),
          type: "note"
        }
      ],
      last_updated_at: new Date().toISOString()
    };

    const tasks = workspace.tasks.map((entry) => (entry.id === taskId ? updatedTask : entry));
    const syncedTasks = syncTaskDependents(tasks);
    const synced = {
      ...workspace,
      tasks: syncedTasks,
      graph: {
        ...workspace.graph,
        nodes: syncedTasks,
        edges: workspace.graph.edges
      }
    };
    const next = computeRoadmapSummary(synced);
    writeStoredRoadmap(next);
    return waitForDemo(next);
  },

  async updateTask(projectId: string, taskId: string, updates: TaskUpdateInput): Promise<RoadmapWorkspace> {
    const workspace = ensureRoadmapData(projectId);
    if (projectId !== workspace.project_id) {
      throw new Error(`Project ${projectId} not found in mock roadmap data.`);
    }

    const task = workspace.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new Error(`Roadmap task ${taskId} not found.`);
    }

    const currentStatus = task.status;
    const allowedTransitions = task.permitted_status_updates;
    if (updates.status && !allowedTransitions.includes(updates.status) && updates.status !== currentStatus) {
      throw new Error(`Status change from ${currentStatus} to ${updates.status} is not permitted in the mock workflow.`);
    }

    const updatedTask: RoadmapTask = {
      ...task,
      status: updates.status ?? task.status,
      readiness: updates.readiness ?? task.readiness,
      blocked_reason: updates.blocked_reason ?? task.blocked_reason,
      due_at: updates.due_at ?? task.due_at,
      last_updated_at: new Date().toISOString(),
      notes: updates.notes ? [...task.notes, { id: `note-${Date.now()}`, author: "Applicant coordinator", created_at: new Date().toISOString(), text: updates.notes }] : task.notes,
      activity: [
        ...task.activity,
        {
          id: `activity-${Date.now()}`,
          actor: "Applicant coordinator",
          message: updates.status ? `Updated status to ${updates.status}.` : "Updated task metadata.",
          timestamp: new Date().toISOString(),
          type: "status"
        }
      ]
    };

    const tasks = syncTaskDependents(
      workspace.tasks.map((entry) => (entry.id === taskId ? updatedTask : entry))
    );
    const next = computeRoadmapSummary({
      ...workspace,
      tasks,
      graph: { ...workspace.graph, nodes: tasks, edges: workspace.graph.edges }
    });

    writeStoredRoadmap(next);
    return waitForDemo(next);
  },

  async performTaskAction(projectId: string, taskId: string, actionId: RoadmapTaskActionId): Promise<RoadmapWorkspace> {
    const workspace = ensureRoadmapData(projectId);
    if (projectId !== workspace.project_id) {
      throw new Error(`Project ${projectId} not found in mock roadmap data.`);
    }

    const task = workspace.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new Error(`Roadmap task ${taskId} not found.`);
    }

    if (!task.available_actions.includes(actionId)) {
      throw new Error(`Action ${actionId} is not supported for this task in the mock workflow.`);
    }

    const actionMap: Record<RoadmapTaskActionId, Partial<RoadmapTask>> = {
      mark_complete: {
        status: "completed",
        readiness: "ready",
        blocked_reason: null,
        last_updated_at: new Date().toISOString()
      },
      mark_in_progress: {
        status: "in_progress",
        readiness: "ready",
        blocked_reason: null,
        last_updated_at: new Date().toISOString()
      },
      submit_for_review: {
        status: "under_review",
        readiness: "needs_review",
        blocked_reason: null,
        last_updated_at: new Date().toISOString()
      },
      request_changes: {
        status: "changes_requested",
        readiness: "needs_review",
        blocked_reason: "Applicant updates requested by the reviewing authority.",
        last_updated_at: new Date().toISOString()
      },
      add_note: {
        last_updated_at: new Date().toISOString()
      }
    };

    const updates = actionMap[actionId];
    const updatedTask: RoadmapTask = {
      ...task,
      ...updates,
      activity: [
        ...task.activity,
        {
          id: `activity-${Date.now()}`,
          actor: "Applicant coordinator",
          message: `Action invoked: ${actionId}`,
          timestamp: new Date().toISOString(),
          type: "action"
        }
      ]
    };

    const tasks = syncTaskDependents(
      workspace.tasks.map((entry) => (entry.id === taskId ? updatedTask : entry))
    );
    const next = computeRoadmapSummary({
      ...workspace,
      tasks,
      graph: { ...workspace.graph, nodes: tasks, edges: workspace.graph.edges }
    });

    writeStoredRoadmap(next);
    return waitForDemo(next);
  },

  async reset(): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(roadmapStorageKey(roadmapBase.project_id));
      ensureProjects().forEach((project) => window.localStorage.removeItem(roadmapStorageKey(project.id)));
    }
  }
};

export type RoadmapTaskUpdate = TaskUpdateInput;

const DOCUMENTS_STORAGE_KEY = "indusai-demo-documents";
const APPLICATIONS_STORAGE_KEY = "indusai-demo-applications";
const CONVERSATIONS_STORAGE_KEY = "indusai-demo-conversations";
const ACTIVITY_STORAGE_KEY = "indusai-demo-activity";
const NOTIFICATIONS_STORAGE_KEY = "indusai-demo-notifications";
const APPROVAL_REQUESTS_STORAGE_KEY = "indusai-demo-approval-requests";

function readStoredJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function writeStoredJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function roadmapStorageKey(projectIdValue: string): string {
  return `${ROADMAP_STORAGE_KEY}:${projectIdValue}`;
}

const projectId = "proj-vasavi-food-processing";
const projectName = "Vasavi Food Processing Unit";

const defaultDocuments: ProjectDocument[] = [
  {
    id: "doc-001",
    name: "Site layout plan.pdf",
    type: "Site plan",
    category: "Engineering",
    projectId,
    projectName,
    uploadedAt: "2026-09-21T00:00:00Z",
    expiryAt: null,
    verificationStatus: "verified",
    sizeLabel: "2.4 MB",
    description: "Current site layout for process block and utility corridors.",
    relatedTaskIds: ["site-layout-plan"],
    requirementStatus: "satisfied",
    sourceVerificationStatus: "illustrative"
  },
  {
    id: "doc-002",
    name: "Water demand estimate.xlsx",
    type: "Utility estimate",
    category: "Utilities",
    projectId,
    projectName,
    uploadedAt: "2026-09-28T00:00:00Z",
    expiryAt: null,
    verificationStatus: "verified",
    sizeLabel: "810 KB",
    description: "Projected utility demand for water and wastewater systems.",
    relatedTaskIds: ["water-connection"],
    requirementStatus: "satisfied",
    sourceVerificationStatus: "verified"
  },
  {
    id: "doc-003",
    name: "Effluent treatment plan.pdf",
    type: "Treatment plan",
    category: "Environmental",
    projectId,
    projectName,
    uploadedAt: "2026-10-01T00:00:00Z",
    expiryAt: null,
    verificationStatus: "needs_review",
    sizeLabel: "1.8 MB",
    description: "Treatment process flow demonstrating neutralization and discharge handling.",
    relatedTaskIds: ["effluent-treatment-review"],
    requirementStatus: "needs_review",
    sourceVerificationStatus: "needs_review"
  },
  {
    id: "doc-004",
    name: "Fire safety layout.pdf",
    type: "Safety plan",
    category: "Safety",
    projectId,
    projectName,
    uploadedAt: "2026-09-30T00:00:00Z",
    expiryAt: null,
    verificationStatus: "pending",
    sizeLabel: "3.1 MB",
    description: "Illustrative fire safety layout for emergency access and hydrant arrangement.",
    relatedTaskIds: ["fire-safety-clearance"],
    requirementStatus: "missing",
    sourceVerificationStatus: "illustrative"
  },
  {
    id: "doc-005",
    name: "Inspection readiness checklist.pdf",
    type: "Inspection record",
    category: "Operations",
    projectId,
    projectName,
    uploadedAt: "2026-10-02T00:00:00Z",
    expiryAt: null,
    verificationStatus: "pending",
    sizeLabel: "1.1 MB",
    description: "Checklist covering plant readiness, signage, and emergency drills.",
    relatedTaskIds: ["inspection-site"],
    requirementStatus: "missing",
    sourceVerificationStatus: "unverified"
  }
];
const defaultApplications: ApplicationRecord[] = [
  {
    id: "app-101",
    projectId,
    projectName,
    name: "Factory license application",
    authority: "Factory licensing office",
    referenceNumber: "FL-2218",
    status: "under_review",
    submittedAt: "2026-09-28T00:00:00Z",
    lastUpdatedAt: "2026-10-03T09:20:00Z",
    pendingAction: "Review pending officer comments",
    relatedTaskIds: ["factory-license"],
    documents: ["doc-001", "doc-004"],
    history: [
      { id: "hist-1", timestamp: "2026-09-28T00:00:00Z", status: "submitted", message: "Application packet submitted to the licensing office." },
      { id: "hist-2", timestamp: "2026-10-03T09:20:00Z", status: "under_review", message: "Application is actively under review." }
    ]
  },
  {
    id: "app-102",
    projectId,
    projectName,
    name: "Water utility connection form",
    authority: "Municipal utilities office",
    referenceNumber: "WU-9182",
    status: "approved",
    submittedAt: "2026-09-18T00:00:00Z",
    lastUpdatedAt: "2026-09-30T00:00:00Z",
    pendingAction: null,
    relatedTaskIds: ["water-connection"],
    documents: ["doc-002"],
    history: [
      { id: "hist-3", timestamp: "2026-09-18T00:00:00Z", status: "submitted", message: "Application submitted for Water department assessment." },
      { id: "hist-4", timestamp: "2026-09-30T00:00:00Z", status: "approved", message: "Approved in the illustrative mock process." }
    ]
  },
  {
    id: "app-103",
    projectId,
    projectName,
    name: "Fire safety clearance application",
    authority: "State fire services department",
    referenceNumber: "FS-4410",
    status: "submitted",
    submittedAt: "2026-10-01T08:00:00Z",
    lastUpdatedAt: "2026-10-01T08:00:00Z",
    pendingAction: "Awaiting officer assignment",
    relatedTaskIds: ["fire-safety-clearance"],
    documents: ["doc-004"],
    history: [
      { id: "hist-5", timestamp: "2026-10-01T08:00:00Z", status: "submitted", message: "Fire safety package submitted for officer review." }
    ]
  },
  {
    id: "app-104",
    projectId,
    projectName,
    name: "Effluent treatment consent",
    authority: "Pollution control board",
    referenceNumber: "ET-3301",
    status: "changes_requested",
    submittedAt: "2026-09-22T00:00:00Z",
    lastUpdatedAt: "2026-10-02T14:00:00Z",
    pendingAction: "Applicant must revise process balance evidence",
    relatedTaskIds: ["effluent-treatment-review"],
    documents: ["doc-003"],
    history: [
      { id: "hist-6", timestamp: "2026-09-22T00:00:00Z", status: "submitted", message: "Effluent consent application submitted." },
      { id: "hist-7", timestamp: "2026-10-02T14:00:00Z", status: "changes_requested", message: "Officer requested updated process water balance." }
    ]
  },
  {
    id: "app-105",
    projectId,
    projectName,
    name: "Site layout endorsement",
    authority: "State industrial development authority",
    referenceNumber: "SL-1102",
    status: "rejected",
    submittedAt: "2026-08-10T00:00:00Z",
    lastUpdatedAt: "2026-08-25T00:00:00Z",
    pendingAction: null,
    relatedTaskIds: ["site-layout-plan"],
    documents: ["doc-001"],
    history: [
      { id: "hist-8", timestamp: "2026-08-10T00:00:00Z", status: "submitted", message: "Site layout endorsement requested." },
      { id: "hist-9", timestamp: "2026-08-25T00:00:00Z", status: "rejected", message: "Rejected: incomplete zoning setbacks on drawing." }
    ]
  }
];

function createDocumentsForProject(project: MockProject): ProjectDocument[] {
  const predefined: Record<string, ProjectDocument[]> = {
    [projectId]: defaultDocuments,
    "proj-apex-textile": [
      { id: "apex-doc-land", name: "Apex leased industrial plot deed.pdf", type: "Land record", category: "Engineering", projectId: "proj-apex-textile", projectName: "Apex Textile Expansion", uploadedAt: "2026-09-12T00:00:00Z", expiryAt: null, verificationStatus: "verified", sizeLabel: "1.7 MB", description: "Predefined lease evidence for the textile expansion site.", relatedTaskIds: ["proj-apex-textile-site-plan"], requirementStatus: "satisfied", sourceVerificationStatus: "illustrative" },
      { id: "apex-doc-process", name: "Dyeing and chemical process plan.pdf", type: "Environmental report", category: "Environmental", projectId: "proj-apex-textile", projectName: "Apex Textile Expansion", uploadedAt: "2026-09-18T00:00:00Z", expiryAt: null, verificationStatus: "needs_review", sizeLabel: "2.8 MB", description: "Predefined textile process evidence for effluent consent.", relatedTaskIds: ["proj-apex-textile-sector-approval"], requirementStatus: "needs_review", sourceVerificationStatus: "illustrative" },
      { id: "apex-doc-layout", name: "Textile factory layout.pdf", type: "Factory layout", category: "Engineering", projectId: "proj-apex-textile", projectName: "Apex Textile Expansion", uploadedAt: "2026-09-20T00:00:00Z", expiryAt: null, verificationStatus: "pending", sizeLabel: "2.2 MB", description: "Predefined layout evidence for textile factory inspection.", relatedTaskIds: ["proj-apex-textile-inspection"], requirementStatus: "missing", sourceVerificationStatus: "illustrative" }
    ],
    "proj-mehta-metalworks": [
      { id: "mehta-doc-land", name: "Mehta industrial plot identification.pdf", type: "Land record", category: "Engineering", projectId: "proj-mehta-metalworks", projectName: "Mehta Metalworks", uploadedAt: "2026-09-08T00:00:00Z", expiryAt: null, verificationStatus: "pending", sizeLabel: "1.4 MB", description: "Predefined site identification record for the metalworks project.", relatedTaskIds: ["proj-mehta-metalworks-site-plan"], requirementStatus: "needs_review", sourceVerificationStatus: "illustrative" },
      { id: "mehta-doc-emissions", name: "Steel re-rolling emissions plan.pdf", type: "Environmental report", category: "Environmental", projectId: "proj-mehta-metalworks", projectName: "Mehta Metalworks", uploadedAt: "2026-09-14T00:00:00Z", expiryAt: null, verificationStatus: "needs_review", sizeLabel: "3.4 MB", description: "Predefined emissions evidence for metal process consent.", relatedTaskIds: ["proj-mehta-metalworks-sector-approval"], requirementStatus: "missing", sourceVerificationStatus: "illustrative" },
      { id: "mehta-doc-safety", name: "Scrap processing safety layout.pdf", type: "Safety plan", category: "Safety", projectId: "proj-mehta-metalworks", projectName: "Mehta Metalworks", uploadedAt: "2026-09-16T00:00:00Z", expiryAt: null, verificationStatus: "pending", sizeLabel: "2.6 MB", description: "Predefined safety layout for the metal processing site inspection.", relatedTaskIds: ["proj-mehta-metalworks-inspection"], requirementStatus: "missing", sourceVerificationStatus: "illustrative" }
    ]
  };
  return predefined[project.id] ?? [];
}

function createApplicationsForProject(project: MockProject): ApplicationRecord[] {
  const predefined: Record<string, ApplicationRecord[]> = {
    [projectId]: defaultApplications,
        "proj-apex-textile": [
      {
        id: "apex-app-factory",
        projectId: "proj-apex-textile",
        projectName: "Apex Textile Expansion",
        name: "Textile factory license application",
        authority: "Factory licensing office",
        referenceNumber: "AT-4102",
        status: "under_review",
        submittedAt: "2026-09-25T00:00:00Z",
        lastUpdatedAt: "2026-10-01T00:00:00Z",
        pendingAction: "Review textile layout comments",
        relatedTaskIds: ["proj-apex-textile-operating-license"],
        documents: ["apex-doc-land", "apex-doc-layout"],
        history: [
          { id: "apex-hist-factory", timestamp: "2026-10-01T00:00:00Z", status: "under_review", message: "Textile factory license is under illustrative review." }
        ]
      },
      {
        id: "apex-app-pollution",
        projectId: "proj-apex-textile",
        projectName: "Apex Textile Expansion",
        name: "Dyeing and effluent consent application",
        authority: "Pollution control board",
        referenceNumber: "AT-4103",
        status: "changes_requested",
        submittedAt: "2026-09-22T00:00:00Z",
        lastUpdatedAt: "2026-09-29T00:00:00Z",
        pendingAction: "Update chemical process evidence",
        relatedTaskIds: ["proj-apex-textile-sector-approval"],
        documents: ["apex-doc-process"],
        history: [
          { id: "apex-hist-pollution", timestamp: "2026-09-29T00:00:00Z", status: "changes_requested", message: "Additional textile process evidence was requested." }
        ]
      },
      {
        id: "apex-app-water",
        projectId: "proj-apex-textile",
        projectName: "Apex Textile Expansion",
        name: "Textile water connection application",
        authority: "Municipal utilities office",
        referenceNumber: "AT-4104",
        status: "approved",
        submittedAt: "2026-09-10T00:00:00Z",
        lastUpdatedAt: "2026-09-20T00:00:00Z",
        pendingAction: null,
        relatedTaskIds: ["proj-apex-textile-operating-license"],
        documents: [],
        history: [
          { id: "apex-hist-water", timestamp: "2026-09-10T00:00:00Z", status: "submitted", message: "Water connection request submitted." },
          { id: "apex-hist-water-ok", timestamp: "2026-09-20T00:00:00Z", status: "approved", message: "Water connection approved." }
        ]
      }
    ],
    "proj-mehta-metalworks": [
      {
        id: "mehta-app-environment",
        projectId: "proj-mehta-metalworks",
        projectName: "Mehta Metalworks",
        name: "Metal process environmental consent application",
        authority: "Pollution control board",
        referenceNumber: "MM-1201",
        status: "submitted",
        submittedAt: "2026-09-30T00:00:00Z",
        lastUpdatedAt: "2026-10-02T00:00:00Z",
        pendingAction: "Review emissions plan",
        relatedTaskIds: ["proj-mehta-metalworks-sector-approval"],
        documents: ["mehta-doc-emissions"],
        history: [
          { id: "mehta-hist-environment", timestamp: "2026-10-02T00:00:00Z", status: "submitted", message: "Metal process consent submitted for review." }
        ]
      },
      {
        id: "mehta-app-fire",
        projectId: "proj-mehta-metalworks",
        projectName: "Mehta Metalworks",
        name: "Scrap processing fire safety application",
        authority: "State fire services",
        referenceNumber: "MM-1202",
        status: "rejected",
        submittedAt: "2026-09-15T00:00:00Z",
        lastUpdatedAt: "2026-09-28T00:00:00Z",
        pendingAction: null,
        relatedTaskIds: ["proj-mehta-metalworks-inspection"],
        documents: ["mehta-doc-safety"],
        history: [
          { id: "mehta-hist-fire", timestamp: "2026-09-15T00:00:00Z", status: "submitted", message: "Fire safety request submitted." },
          { id: "mehta-hist-fire-rej", timestamp: "2026-09-28T00:00:00Z", status: "rejected", message: "Rejected: incomplete emergency access layout." }
        ]
      }
    ]
  };
  return predefined[project.id] ?? [];
}

const defaultAssistantTools: AssistantTool[] = [
  { id: "web_search", label: "Web Search", detail: "External web lookup for general guidance", state: "available" },
  { id: "deep_research", label: "Deep Research", detail: "Context-rich research across multiple sources", state: "disabled" },
  { id: "file_search", label: "File Search", detail: "Search project artifacts and uploaded documents", state: "available" },
  { id: "database", label: "Database", detail: "Project and approval metadata access", state: "unavailable" },
  { id: "code_execution", label: "Code Execution", detail: "Sandboxed data analysis and automation", state: "disabled" },
  { id: "mcp", label: "MCP", detail: "External model context integrations", state: "unavailable" }
];

const defaultAssistantConversations: AssistantConversation[] = [
  {
    id: "conv-1",
    projectId,
    title: "Next approval actions",
    createdAt: "2026-10-02T11:00:00Z",
    updatedAt: "2026-10-03T09:15:00Z",
    suggestedFollowUps: ["What risks are blocking fire clearance?", "Which documents are still missing?"],
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "What are the next actions needed before the factory license application can move forward?",
        timestamp: "2026-10-03T09:00:00Z"
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Based on the current mock roadmap, the primary blockers are the site inspection and the fire safety clearance. The effluent treatment review is still in progress, and the applicant response workflow remains pending. Once those dependencies are satisfied, the license application can continue.",
        timestamp: "2026-10-03T09:15:00Z",
        sourceTitle: "Roadmap dependency review",
        verificationStatus: "illustrative",
        toolName: "File Search"
      }
    ]
  }
];

const defaultActivityEvents: ActivityEvent[] = [
  {
    id: "evt-1",
    type: "project",
    title: "Project profile updated",
    description: "The project timeline and readiness status were refreshed.",
    timestamp: "2026-10-03T09:40:00Z",
    projectId,
    read: false
  },
  {
    id: "evt-2",
    type: "approval",
    title: "Effluent treatment review moved to in progress",
    description: "Environmental review is active and awaiting final balance confirmation.",
    timestamp: "2026-10-02T16:00:00Z",
    projectId,
    taskId: "effluent-treatment-review",
    read: true
  },
  {
    id: "evt-3",
    type: "document",
    title: "Document added",
    description: "Water demand estimate was uploaded and associated with the water approval route.",
    timestamp: "2026-09-28T00:00:00Z",
    projectId,
    taskId: "water-connection",
    read: true
  },
  {
    id: "evt-4",
    type: "application",
    title: "Application status updated",
    description: "Factory license application moved into officer review.",
    timestamp: "2026-10-03T09:20:00Z",
    projectId,
    taskId: "factory-license",
    read: false
  }
];

const defaultNotifications: NotificationItem[] = [
  {
    id: "note-1",
    type: "approval_request",
    title: "Action required: approve review follow-up",
    description: "The compliance desk asked for confirmation before proceeding with the next mock approval action.",
    timestamp: "2026-10-03T09:45:00Z",
    projectId,
    taskId: "factory-license",
    unread: true
  },
  {
    id: "note-2",
    type: "assistant",
    title: "AI summary ready",
    description: "A contextual recommendation summary is ready for the Vasavi project.",
    timestamp: "2026-10-03T08:45:00Z",
    projectId,
    unread: false
  }
];

const defaultApprovalRequests: ApprovalRequest[] = [
  {
    id: "req-1",
    title: "Confirm fire safety response package",
    reason: "The mock authority requests explicit approval before finalizing the next-stage review action.",
    projectId,
    taskId: "fire-safety-clearance",
    requestedAt: "2026-10-03T09:45:00Z",
    status: "pending",
    actionLabel: "Approve review submission"
  },
  {
    id: "req-2",
    title: "Confirm applicant response package",
    reason: "A follow-up clarification is ready to send; the user must confirm before it is treated as submitted.",
    projectId,
    taskId: "applicant-qa-response",
    requestedAt: "2026-10-03T08:20:00Z",
    status: "pending",
    actionLabel: "Confirm response package"
  }
];

function ensureDocuments(): ProjectDocument[] {
  const stored = readStoredJson<ProjectDocument[]>(DOCUMENTS_STORAGE_KEY);
  if (stored) {
    const knownProjects = new Set(stored.map((document) => document.projectId));
    const additions = ensureProjects().filter((project) => !knownProjects.has(project.id)).flatMap(createDocumentsForProject);
    if (additions.length > 0) {
      const merged = [...stored, ...additions];
      writeStoredJson(DOCUMENTS_STORAGE_KEY, merged);
      return merged;
    }
    return stored;
  }
  const seeded = ensureProjects().flatMap(createDocumentsForProject);
  writeStoredJson(DOCUMENTS_STORAGE_KEY, seeded);
  return seeded;
}

function ensureApplications(): ApplicationRecord[] {
  const stored = readStoredJson<ApplicationRecord[]>(APPLICATIONS_STORAGE_KEY);
  if (stored) {
    const knownProjects = new Set(stored.map((application) => application.projectId));
    const additions = ensureProjects().filter((project) => !knownProjects.has(project.id)).flatMap(createApplicationsForProject);
    if (additions.length > 0) {
      const merged = [...stored, ...additions];
      writeStoredJson(APPLICATIONS_STORAGE_KEY, merged);
      return merged;
    }
    return stored;
  }
  const seeded = ensureProjects().flatMap(createApplicationsForProject);
  writeStoredJson(APPLICATIONS_STORAGE_KEY, seeded);
  return seeded;
}

function ensureConversations(): AssistantConversation[] {
  const stored = readStoredJson<AssistantConversation[]>(CONVERSATIONS_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  writeStoredJson(CONVERSATIONS_STORAGE_KEY, defaultAssistantConversations);
  return defaultAssistantConversations;
}

function ensureActivity(): ActivityEvent[] {
  const stored = readStoredJson<ActivityEvent[]>(ACTIVITY_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  writeStoredJson(ACTIVITY_STORAGE_KEY, defaultActivityEvents);
  return defaultActivityEvents;
}

function ensureNotifications(): NotificationItem[] {
  const stored = readStoredJson<NotificationItem[]>(NOTIFICATIONS_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  writeStoredJson(NOTIFICATIONS_STORAGE_KEY, defaultNotifications);
  return defaultNotifications;
}

function ensureApprovalRequests(): ApprovalRequest[] {
  const stored = readStoredJson<ApprovalRequest[]>(APPROVAL_REQUESTS_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  writeStoredJson(APPROVAL_REQUESTS_STORAGE_KEY, defaultApprovalRequests);
  return defaultApprovalRequests;
}

function buildAssistantReply(prompt: string): AssistantMessage {
  const lower = prompt.toLowerCase();
  const projectContext = "The current mock roadmap indicates the site inspection and fire safety clearance are the main gating items for this project.";

  let content = "I reviewed the project context and the current mock roadmap. The most important next step is to resolve the blocking inspection and fire safety dependencies before advancing the license workflow.";

  if (lower.includes("document") || lower.includes("file")) {
    content = "Document readiness is mixed: the site layout plan is complete, the utility estimate is verified, and the fire safety layout remains missing or needs review. The next action is to attach the remaining safety checklist and confirm the inspection readiness evidence.";
  }

  if (lower.includes("inspection") || lower.includes("site")) {
    content = "The inspection node remains pending, and the fire safety clearance depends on it. The mock workflow shows that the site inspection and emergency layout review are the current blockers.";
  }

  if (lower.includes("next") || lower.includes("action")) {
    content = "The next recommended actions are: complete the inspection readiness checklist, resolve the fire safety review gaps, and confirm the applicant response workflow before the factory license application proceeds.";
  }

  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: `${content} ${projectContext}`,
    timestamp: new Date().toISOString(),
    sourceTitle: "Project roadmap summary",
    verificationStatus: "illustrative",
    toolName: "File Search",
    feedback: null
  };
}

export const mockDocumentApi = {
  async getDocuments(projectIdValue?: string): Promise<ProjectDocument[]> {
    const docs = ensureDocuments();
    const filtered = projectIdValue ? docs.filter((doc) => doc.projectId === projectIdValue) : docs;
    return waitForDemo(filtered);
  },
  async uploadDocument(input: UploadDocumentInput): Promise<ProjectDocument[]> {
    const docs = ensureDocuments();
    const nextDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: input.name,
      type: input.type,
      category: input.category,
      projectId: input.projectId,
      projectName: input.projectName,
      uploadedAt: new Date().toISOString(),
      expiryAt: input.expiryAt ?? null,
      verificationStatus: "pending",
      sizeLabel: input.sizeLabel,
      description: input.description ?? "Simulated upload captured through the browser-side demo workflow.",
      relatedTaskIds: input.relatedTaskIds,
      requirementStatus: input.relatedTaskIds.length > 0 ? "satisfied" : "missing",
      sourceVerificationStatus: "illustrative"
    };

    const nextDocs = [nextDoc, ...docs];
    writeStoredJson(DOCUMENTS_STORAGE_KEY, nextDocs);
    return waitForDemo(nextDocs.filter((doc) => doc.projectId === input.projectId));
  },
  async updateDocumentStatus(documentId: string, status: ProjectDocument["verificationStatus"], reason?: string): Promise<ProjectDocument[]> {
    const documents: ProjectDocument[] = ensureDocuments().map((document) => document.id === documentId ? { ...document, verificationStatus: status, requirementStatus: status === "verified" ? "satisfied" as const : "needs_review" as const } : document);
    writeStoredJson(DOCUMENTS_STORAGE_KEY, documents);

    const relatedApplications = ensureApplications().filter((application) => application.documents.includes(documentId));
    if (relatedApplications.length > 0) {
      const now = new Date().toISOString();
      const applications = ensureApplications().map((application) => {
        if (!application.documents.includes(documentId) || status !== "needs_review") return application;
        return {
          ...application,
          status: "changes_requested" as const,
          pendingAction: reason ?? "Review the requested document correction",
          lastUpdatedAt: now,
          history: [...application.history, { id: `hist-${Date.now()}-${application.id}`, timestamp: now, status: "changes_requested" as const, message: reason ?? "Officer requested a document correction." }]
        };
      });
      writeStoredJson(APPLICATIONS_STORAGE_KEY, applications);
      const notifications = ensureNotifications();
      writeStoredJson(NOTIFICATIONS_STORAGE_KEY, [...relatedApplications.map((application) => ({ id: `notification-${Date.now()}-${application.id}`, type: "application" as const, title: "Document correction requested", description: reason ?? "An officer requested a correction to a submitted document.", timestamp: now, projectId: application.projectId, taskId: application.relatedTaskIds[0], unread: true })), ...notifications]);
    }
    return waitForDemo(documents);
  }
};

export const mockApplicationsApi = {
  async getApplications(projectIdValue?: string): Promise<ApplicationRecord[]> {
    const apps = ensureApplications();
    const filtered = projectIdValue ? apps.filter((app) => app.projectId === projectIdValue) : apps;
    return waitForDemo(filtered);
  },
  async createDraftApplication(projectIdValue: string, name: string): Promise<ApplicationRecord[]> {
    const apps = ensureApplications();
    const selectedProject = ensureProjects().find((project) => project.id === projectIdValue);
    const draft: ApplicationRecord = {
      id: `app-${Date.now()}`,
      projectId: projectIdValue,
      projectName: selectedProject?.name ?? "Selected project",
      name,
      authority: "Applicant desk",
      referenceNumber: null,
      status: "draft",
      submittedAt: null,
      lastUpdatedAt: new Date().toISOString(),
      pendingAction: "Complete draft details and attach required evidence",
      relatedTaskIds: [],
      documents: [],
      history: [
        { id: `hist-${Date.now()}`, timestamp: new Date().toISOString(), status: "draft", message: "Draft application created in the mock workflow." }
      ]
    };

    const next = [draft, ...apps];
    writeStoredJson(APPLICATIONS_STORAGE_KEY, next);
    return waitForDemo(next.filter((app) => app.projectId === projectIdValue));
  },
  async updateApplicationStatus(
    projectIdValue: string,
    applicationId: string,
    status: ApplicationRecord["status"],
    message?: string
  ): Promise<ApplicationRecord[]> {
    const apps = ensureApplications().map((app) => {
      if (app.id !== applicationId || app.projectId !== projectIdValue) {
        return app;
      }

      return {
        ...app,
        status,
        lastUpdatedAt: new Date().toISOString(),
        pendingAction:
          status === "submitted"
            ? "Submission is simulated and awaits review"
            : status === "approved"
              ? null
              : status === "changes_requested"
                ? "Revise documents or clarifications"
                : app.pendingAction,
        history: [
          ...app.history,
          {
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status,
            message: message ?? `Status updated to ${status} in the mock workflow.`
          }
        ]
      };
    });

    writeStoredJson(APPLICATIONS_STORAGE_KEY, apps);
    return waitForDemo(apps.filter((app) => app.projectId === projectIdValue));
  }
};

export const mockAssistantApi = {
  async getConversations(projectIdValue: string): Promise<AssistantConversation[]> {
    const convos = ensureConversations().filter((item) => item.projectId === projectIdValue);
    return waitForDemo(convos);
  },
  async createConversation(projectIdValue: string): Promise<AssistantConversation> {
    const conversation: AssistantConversation = {
      id: `conv-${Date.now()}`,
      projectId: projectIdValue,
      title: "New project review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      suggestedFollowUps: ["What is the current blocker?", "Which tasks are ready to proceed?"],
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "I am ready to help review the project context. Ask about dependencies, required documents, or the next approvals to complete.",
          timestamp: new Date().toISOString(),
          sourceTitle: "Project context",
          verificationStatus: "illustrative",
          toolName: "Web Search"
        }
      ]
    };

    const next = [conversation, ...ensureConversations()];
    writeStoredJson(CONVERSATIONS_STORAGE_KEY, next);
    return waitForDemo(conversation);
  },
  async addMessage(projectIdValue: string, conversationId: string, prompt: string): Promise<AssistantConversation> {
    const convos = ensureConversations();
    const conversation = convos.find((item) => item.projectId === projectIdValue && item.id === conversationId) ?? convos[0];
    if (!conversation) {
      throw new Error("Conversation not found.");
    }

    const userMessage: AssistantMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString()
    };

    const assistantMessage = buildAssistantReply(prompt);
    const updated = {
      ...conversation,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, userMessage, assistantMessage],
      suggestedFollowUps: [
        "What is the current blocker?",
        "Which task should we prioritize next?",
        "Which documents still need review?"
      ]
    };

    const next = convos.map((item) => (item.id === conversation.id ? updated : item));
    writeStoredJson(CONVERSATIONS_STORAGE_KEY, next);
    return waitForDemo(updated);
  },
  async retryAssistantTurn(projectIdValue: string, conversationId: string): Promise<AssistantConversation> {
    const convos = ensureConversations();
    const conversation = convos.find((item) => item.projectId === projectIdValue && item.id === conversationId);
    if (!conversation) {
      throw new Error("Conversation not found.");
    }

    const feedbackPrompt = conversation.messages[conversation.messages.length - 1]?.content ?? "Provide the next useful action.";
    const updated = {
      ...conversation,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, buildAssistantReply(feedbackPrompt)]
    };

    const next = convos.map((item) => (item.id === conversation.id ? updated : item));
    writeStoredJson(CONVERSATIONS_STORAGE_KEY, next);
    return waitForDemo(updated);
  },
  async getTools(): Promise<AssistantTool[]> {
    return waitForDemo(defaultAssistantTools);
  }
};

export const mockNotificationApi = {
  async getActivity(projectIdValue: string): Promise<ActivityEvent[]> {
    const activity = ensureActivity().filter((item) => item.projectId === projectIdValue);
    return waitForDemo(activity);
  },
  async getNotifications(projectIdValue: string): Promise<NotificationItem[]> {
    const notifications = ensureNotifications().filter((item) => item.projectId === projectIdValue);
    return waitForDemo(notifications);
  },
  async markAllRead(projectIdValue: string): Promise<void> {
    const nextEvents = ensureActivity().map((item) =>
      item.projectId === projectIdValue ? { ...item, read: true } : item
    );
    const nextNotifications = ensureNotifications().map((item) =>
      item.projectId === projectIdValue ? { ...item, unread: false } : item
    );
    writeStoredJson(ACTIVITY_STORAGE_KEY, nextEvents);
    writeStoredJson(NOTIFICATIONS_STORAGE_KEY, nextNotifications);
  }
};

export const mockApprovalRequestsApi = {
  async list(projectIdValue: string): Promise<ApprovalRequest[]> {
    const requests = ensureApprovalRequests().filter((item) => item.projectId === projectIdValue);
    return waitForDemo(requests);
  },
  async respond(projectIdValue: string, requestId: string, decision: "approved" | "rejected"): Promise<ApprovalRequest[]> {
    const requests = ensureApprovalRequests().map((request) => {
      if (request.id !== requestId || request.projectId !== projectIdValue) {
        return request;
      }

      return {
        ...request,
        status: decision === "approved" ? "approved" : "rejected"
      } satisfies ApprovalRequest;
    });

    writeStoredJson(APPROVAL_REQUESTS_STORAGE_KEY, requests);
    return waitForDemo(requests.filter((request) => request.projectId === projectIdValue));
  }
};

const defaultProjects: MockProject[] = [
  { id: 'proj-vasavi-food-processing', name: 'Vasavi Food Processing Unit', sector: 'Food processing', stage: 'construction', status: 'active', location: 'Vadodara, Gujarat', organization: 'Gujarat Industrial Growth Cell', description: 'Large-scale food processing facility for packaged goods and ingredients.', investmentAmount: '₹12.5 Cr', siteStatus: 'owned', createdAt: '2026-08-15T00:00:00Z', updatedAt: '2026-10-03T09:40:00Z', progress: 78, approvalCount: 9, completedApprovals: 3 },
  { id: 'proj-apex-textile', name: 'Apex Textile Expansion', sector: 'Textiles', stage: 'pre_operational', status: 'active', location: 'Surat, Gujarat', organization: 'Apex Textiles Ltd', description: 'Expansion of dyeing and finishing capacity for export-quality fabrics.', investmentAmount: '₹8.2 Cr', siteStatus: 'leased', createdAt: '2026-07-20T00:00:00Z', updatedAt: '2026-09-28T00:00:00Z', progress: 59, approvalCount: 6, completedApprovals: 2 },
  { id: 'proj-mehta-metalworks', name: 'Mehta Metalworks', sector: 'Metals', stage: 'land_acquisition', status: 'active', location: 'Rajkot, Gujarat', organization: 'Mehta Industries', description: 'New steel re-rolling mill with integrated scrap processing.', investmentAmount: '₹22 Cr', siteStatus: 'identified', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z', progress: 34, approvalCount: 8, completedApprovals: 1 }
];

function createProjectRoadmap(project: MockProject): RoadmapWorkspace {
  const predefinedSeed: Record<
    string,
    { approval: string; document: string; authority: string; license: string }
  > = {
    "proj-apex-textile": {
      approval: "Dyeing and effluent consent",
      document: "Textile process and chemical plan",
      authority: "Pollution control board",
      license: "Textile factory license"
    },
    "proj-mehta-metalworks": {
      approval: "Metal process environmental consent",
      document: "Metal process and emissions plan",
      authority: "Pollution control board",
      license: "Metalworks operating license"
    }
  };

  const seed = predefinedSeed[project.id] ?? {
    approval: `${project.sector} sector consent`,
    document: `${project.name} process and compliance plan`,
    authority: "Pollution control board",
    license: `${project.name} operating license`
  };

  const prefix = project.id;
  const ids = {
    site: `${prefix}-site-plan`,
    sector: `${prefix}-sector-approval`,
    inspection: `${prefix}-inspection`,
    license: `${prefix}-operating-license`
  };
  const now = new Date().toISOString();

  const task = (templateId: string, overrides: Partial<RoadmapTask>): RoadmapTask => {
    const template = roadmapBase.tasks.find((entry) => entry.id === templateId);
    if (!template) {
      throw new Error(`Roadmap template ${templateId} not found.`);
    }
    return makeRoadmapTask({
      ...template,
      id: `${prefix}-${templateId}`,
      status: "not_started",
      readiness: "needs_review",
      source_verification_status: "illustrative",
      source_refs: [],
      prerequisites: [],
      dependents: [],
      notes: [],
      activity: [],
      last_updated_at: now,
      ...overrides
    });
  };

  const tasks = [
    task("site-layout-plan", {
      id: ids.site,
      title: `${project.name} site plan`,
      description: `Illustrative site and infrastructure planning for ${project.name}.`,
      required_documents: [`${project.name} site plan.pdf`],
      status: "in_progress",
      readiness: "at_risk",
      available_actions: ["mark_complete", "add_note"]
    }),
    task("effluent-treatment-review", {
      id: ids.sector,
      title: seed.approval,
      description: `Review the ${seed.approval.toLowerCase()} requirements for ${project.name}.`,
      authority: seed.authority,
      required_documents: [`${seed.document}.pdf`],
      prerequisites: [ids.site],
      status: "pending",
      readiness: "needs_review",
      available_actions: ["submit_for_review", "mark_in_progress", "add_note"]
    }),
    task("inspection-site", {
      id: ids.inspection,
      title: `${project.name} site inspection`,
      description: `Coordinate an illustrative readiness inspection for ${project.name}.`,
      prerequisites: [ids.site],
      status: "pending",
      readiness: "at_risk",
      required_documents: ["Inspection readiness checklist.pdf"],
      available_actions: ["mark_in_progress", "add_note"]
    }),
    task("factory-license", {
      id: ids.license,
      title: seed.license,
      description: `Downstream operating approval after the project-specific review and inspection.`,
      authority: seed.authority,
      prerequisites: [ids.sector, ids.inspection],
      status: "blocked",
      readiness: "blocked",
      blocked_reason: `Awaiting ${seed.approval.toLowerCase()} and site inspection.`,
      required_documents: [`${project.name} license application.pdf`],
      available_actions: ["mark_in_progress", "submit_for_review", "add_note"]
    })
  ];

  tasks[0].dependents = [ids.sector, ids.inspection];
  tasks[1].dependents = [ids.license];
  tasks[2].dependents = [ids.license];

  const edges: RoadmapEdge[] = [
    { id: `${prefix}-edge-site-sector`, source: ids.site, target: ids.sector, edge_type: "depends_on" },
    { id: `${prefix}-edge-site-inspection`, source: ids.site, target: ids.inspection, edge_type: "depends_on" },
    { id: `${prefix}-edge-sector-license`, source: ids.sector, target: ids.license, edge_type: "depends_on" },
    { id: `${prefix}-edge-inspection-license`, source: ids.inspection, target: ids.license, edge_type: "depends_on" }
  ];

  return computeRoadmapSummary({
    project_id: project.id,
    project_name: project.name,
    location: project.location,
    last_updated_at: now,
    summary: {
      ...roadmapBase.summary,
      project_name: project.name,
      location: project.location,
      last_updated_at: now
    },
    graph: {
      project_id: project.id,
      version: 1,
      generated_at: now,
      nodes: tasks,
      edges
    },
    tasks
  });
}

const defaultRegulatoryUpdates: RegulatoryUpdate[] = [
  { id: 'ru-1', title: 'Revised Emission Standards', source: 'Central Pollution Control Board', publishedAt: '2026-09-15', summary: 'New limits on SO2 and NOx emissions for industrial zones.', affectedAreas: ['Emissions', 'Environment'], status: 'reviewed', sourceVerificationStatus: 'verified' },
  { id: 'ru-2', title: 'Export Licensing Simplification', source: 'Ministry of Commerce', publishedAt: '2026-09-18', summary: 'Streamlined online application process for textile exports.', affectedAreas: ['Exports', 'Textiles'], status: 'reviewed', sourceVerificationStatus: 'verified' },
  { id: 'ru-3', title: 'Fire Safety Checklist Revision', source: 'State Fire Services', publishedAt: '2026-09-22', summary: 'Updated mandatory inspection checklist for high-risk manufacturing.', affectedAreas: ['Safety', 'Manufacturing'], status: 'pending', sourceVerificationStatus: 'verified' },
  { id: 'ru-4', title: 'Food Processing Licensing Amendment', source: 'FSSAI', publishedAt: '2026-09-25', summary: 'Extended validity of central licenses to 5 years.', affectedAreas: ['Food', 'Licensing'], status: 'pending', sourceVerificationStatus: 'verified' },
  { id: 'ru-5', title: 'Quality Certification Update', source: 'Bureau of Indian Standards', publishedAt: '2026-09-28', summary: 'Mandatory BIS certification for structural steel imports.', affectedAreas: ['Imports', 'Quality'], status: 'reviewed', sourceVerificationStatus: 'verified' },
  { id: 'ru-6', title: 'EIA Notification Amendment', source: 'Ministry of Environment', publishedAt: '2026-10-01', summary: 'Exemption from prior clearance for minor capacity expansions.', affectedAreas: ['Environment', 'Clearance'], status: 'flagged', sourceVerificationStatus: 'verified' }
];

const defaultOfficerReviews: OfficerReviewItem[] = [
  { id: 'or-1', projectId: 'proj-vasavi-food-processing', projectName: 'Vasavi Food Processing Unit', applicantName: 'Gujarat Industrial Growth Cell', taskName: 'Environmental Clearance Plan', status: 'assigned', priority: 'High', submittedAt: '2026-10-01', lastUpdatedAt: '2026-10-01', summary: 'Review environmental clearance documentation.', hasDocuments: true },
  { id: 'or-2', projectId: 'proj-apex-textile', projectName: 'Apex Textile Expansion', applicantName: 'Apex Textiles Ltd', taskName: 'Consent to Establish (CTE)', status: 'assigned', priority: 'Medium', submittedAt: '2026-10-02', lastUpdatedAt: '2026-10-02', summary: 'Review CTE application.', hasDocuments: true },
  { id: 'or-3', projectId: 'proj-mehta-metalworks', projectName: 'Mehta Metalworks', applicantName: 'Mehta Industries', taskName: 'Site Acquisition Proof', status: 'assigned', priority: 'Low', submittedAt: '2026-10-03', lastUpdatedAt: '2026-10-03', summary: 'Verify land ownership.', hasDocuments: true }
];

function ensureProjects(): MockProject[] {
  return readStoredJson(PROJECTS_STORAGE_KEY) || defaultProjects;
}

function ensureRegulatoryUpdates(): RegulatoryUpdate[] {
  return readStoredJson(REGULATORY_UPDATES_STORAGE_KEY) || defaultRegulatoryUpdates;
}

function ensureOfficerReviews(): OfficerReviewItem[] {
  return readStoredJson(OFFICER_REVIEWS_STORAGE_KEY) || defaultOfficerReviews;
}

export const mockProjectsApi = {
  async getProjects(): Promise<MockProject[]> {
    return waitForDemo(ensureProjects());
  },
  async getProject(id: string): Promise<MockProject | null> {
    const projects = ensureProjects();
    return waitForDemo(projects.find(p => p.id === id) || null);
  },
  async createProject(input: CreateProjectInput): Promise<MockProject> {
    const projects = ensureProjects();
    const newProject: MockProject = {
      id: `proj-${Date.now()}`,
      name: input.name,
      sector: input.sector,
      stage: input.stage,
      status: 'active',
      location: input.location,
      organization: input.organization,
      description: input.description,
      investmentAmount: input.investmentAmount,
      siteStatus: input.siteStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      approvalCount: 5,
      completedApprovals: 0
    };
    const next = [...projects, newProject];
    writeStoredJson(PROJECTS_STORAGE_KEY, next);
    return waitForDemo(newProject);
  }
};

export const mockRegulatoryUpdatesApi = {
  async getUpdates(): Promise<RegulatoryUpdate[]> {
    return waitForDemo(ensureRegulatoryUpdates());
  }
};

export const mockOfficerReviewApi = {
  async getReviews(): Promise<OfficerReviewItem[]> {
    return waitForDemo(ensureOfficerReviews());
  },
  async updateReview(id: string, status: 'approved' | 'rejected' | 'changes_requested', note?: string): Promise<OfficerReviewItem[]> {
    const reviews = ensureOfficerReviews().map(r => {
      if (r.id === id) {
        return { ...r, status };
      }
      return r;
    });
    writeStoredJson(OFFICER_REVIEWS_STORAGE_KEY, reviews);
    return waitForDemo(reviews);
  }
};

export const mockAdminApi = {
  async getOverview(): Promise<AdminOverviewSummary> {
    const projects = ensureProjects();
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalInvestmentStr = '₹' + projects.reduce((acc, p) => {
      const match = p.investmentAmount.match(/([\d.]+)/);
      if (match) return acc + parseFloat(match[1]);
      return acc;
    }, 0).toFixed(1) + ' Cr';
    
    return waitForDemo({
      totalUsers: 145, // Demo data
      totalProjects: projects.length,
      openReviews: ensureOfficerReviews().filter(r => r.status === 'assigned' || r.status === 'in_review').length,
      pendingRegulatoryUpdates: ensureRegulatoryUpdates().filter(u => u.status === 'pending').length
    });
  }
};

export async function resetMockData(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
    window.localStorage.removeItem(APPLICATIONS_STORAGE_KEY);
    window.localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
    window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    window.localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    window.localStorage.removeItem(APPROVAL_REQUESTS_STORAGE_KEY);
    window.localStorage.removeItem(PROJECTS_STORAGE_KEY);
    window.localStorage.removeItem(REGULATORY_UPDATES_STORAGE_KEY);
    window.localStorage.removeItem(OFFICER_REVIEWS_STORAGE_KEY);
  }
}
```

---

## `tailwind.config.ts`

**File:** `tailwind.config.ts`

```text
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indus: {
          ink: "#172b3a",
          blue: "#27628a",
          mist: "#edf5fa"
        }
      }
    }
  },
  plugins: []
};

export default config;
```

---

## `tsconfig.json`

**File:** `tsconfig.json`

```text
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

