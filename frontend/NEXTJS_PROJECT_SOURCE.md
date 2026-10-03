# Next.js Project Source

This document contains source files from selected Next.js project directories and configuration files.

**Project root:** `C:\Users\parth\Desktop\Projects\sih130\frontend`

**Files included:** 32

---

## `app\applications\page.tsx`

**File:** `app\applications\page.tsx`

```text
import { AppShell } from "@/components/app-shell";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function ApplicationsPage() {
  return (
    <AppShell>
      <RoutePlaceholder
        title="Applications"
        description="Track application submissions, review statuses, and follow-up tasks across authorities."
      />
    </AppShell>
  );
}
```

---

## `app\assistant\page.tsx`

**File:** `app\assistant\page.tsx`

```text
import { AppShell } from "@/components/app-shell";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function AssistantPage() {
  return (
    <AppShell>
      <RoutePlaceholder
        title="AI Assistant"
        description="Ask contextual questions about project approvals, dependency sequencing, and likely next actions."
      />
    </AppShell>
  );
}
```

---

## `app\documents\page.tsx`

**File:** `app\documents\page.tsx`

```text
import { AppShell } from "@/components/app-shell";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function DocumentsPage() {
  return (
    <AppShell>
      <RoutePlaceholder
        title="Documents"
        description="Manage reusable project documents, compliance evidence, and required supporting artifacts."
      />
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

## `app\page.tsx`

**File:** `app\page.tsx`

```text
import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard";
import { Button, PageHeader } from "@/components/ui";

export default function HomePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title="Approval dashboard"
        description="Monitor approvals, project milestones, and outstanding regulatory actions for your active industrial portfolio."
        actions={
          <>
            <Button variant="secondary">Export status</Button>
            <Button>New project</Button>
          </>
        }
      />
      <DashboardContent />
    </AppShell>
  );
}
```

---

## `app\projects\page.tsx`

**File:** `app\projects\page.tsx`

```text
import { AppShell } from "@/components/app-shell";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function ProjectsPage() {
  return (
    <AppShell>
      <RoutePlaceholder
        title="Projects"
        description="Review active industrial projects, their milestones, and readiness across the approval lifecycle."
      />
    </AppShell>
  );
}
```

---

## `app\regulatory-updates\page.tsx`

**File:** `app\regulatory-updates\page.tsx`

```text
import { AppShell } from "@/components/app-shell";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function RegulatoryUpdatesPage() {
  return (
    <AppShell>
      <RoutePlaceholder
        title="Regulatory Updates"
        description="Review policy changes, guidance updates, and source references relevant to your projects."
      />
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
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/roadmap", label: "Approval Roadmap" },
  { href: "/documents", label: "Documents" },
  { href: "/applications", label: "Applications" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/regulatory-updates", label: "Regulatory Updates" }
];

function Sidebar({
  isMobileOpen,
  onClose
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-[#172b3a] text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0",
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
          <p className="text-xs uppercase tracking-[0.18em] text-sky-200">Current role</p>
          <p className="mt-2 text-sm font-medium text-white">Applicant workspace</p>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const user = useMemo(
    () => ({
      name: "Asha Nair",
      role: "Applicant",
      avatar: "AN"
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#172b3a]">
      <div className="flex min-h-screen">
        <Sidebar isMobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
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
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
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

import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type { ApplicationRecord, ApplicationStatus } from "@/contracts/workflows";
import { createApplication, getApplications, updateApplicationStatus } from "@/lib/api";

const PROJECT_ID = "proj-vasavi-food-processing";
const PROJECT_NAME = "Vasavi Food Processing Unit";

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
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await getApplications(PROJECT_ID);
        if (active) {
          setApplications(result);
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
  }, []);

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
      const next = await createApplication(PROJECT_ID, name);
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
        eyebrow="Applications"
        title="Application tracker"
        description="Track mock submissions, review status, and stay aligned with the next required actions."
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

import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type { ProjectDocument } from "@/contracts/workflows";
import { getDocuments, uploadDocument } from "@/lib/api";

const PROJECT_ID = "proj-vasavi-food-processing";
const PROJECT_NAME = "Vasavi Food Processing Unit";

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
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
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

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getDocuments(PROJECT_ID);
        if (active) {
          setDocuments(data);
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
  }, []);

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
      const nextDocuments = await uploadDocument({
        projectId: PROJECT_ID,
        projectName: PROJECT_NAME,
        name: form.name,
        category: form.category,
        type: form.type,
        sizeLabel: form.sizeLabel,
        relatedTaskIds: form.relatedTaskIds ? [form.relatedTaskIds] : [],
        expiryAt: form.expiryAt ? new Date(form.expiryAt).toISOString() : null,
        description: "Simulated upload captured through the browser-side demo workflow."
      });
      setDocuments(nextDocuments);
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
        eyebrow="Projects"
        title="Document library"
        description="Browse uploaded project artifacts, review requirement coverage, and simulate the next evidence updates."
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

## `src\components\roadmap.tsx`

**File:** `src\components\roadmap.tsx`

```text
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const ROADMAP_PROJECT_ID = "proj-vasavi-food-processing";

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

function NodeShape({
  type,
  text,
  selected,
  status,
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
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}) {
  const fill = typeMeta[type].color;
  const border = selected ? "#111827" : "#dbeafe";
  const statusColor = {
    not_started: "#94a3b8",
    blocked: "#f59e0b",
    pending: "#64748b",
    in_progress: "#3b82f6",
    submitted: "#0ea5e9",
    under_review: "#8b5cf6",
    changes_requested: "#f97316",
    completed: "#10b981",
    rejected: "#ef4444",
    cancelled: "#64748b"
  }[status];

  const shape =
    type === "document"
      ? { shape: "circle", cx: x + width / 2, cy: y + height / 2, rx: width / 2 }
      : type === "inspection"
        ? { shape: "diamond", points: `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}` }
        : { shape: "rect", x, y, width, height };

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {shape.shape === "circle" ? (
        <circle cx={shape.cx} cy={shape.cy} r={Math.max(width / 2, 34)} fill={fill} opacity={selected ? 1 : 0.85} stroke={border} strokeWidth={selected ? 2.5 : 1.5} />
      ) : shape.shape === "diamond" ? (
        <polygon points={shape.points} fill={fill} opacity={selected ? 1 : 0.85} stroke={border} strokeWidth={selected ? 2.5 : 1.5} />
      ) : (
        <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={14} fill={fill} opacity={selected ? 1 : 0.9} stroke={border} strokeWidth={selected ? 2.5 : 1.5} />
      )}
      <circle cx={x + width - 10} cy={y + 10} r={6} fill={statusColor} stroke="#fff" strokeWidth={2} />
      <text x={x + 12} y={y + 26} fill="#fff" fontSize={12} fontWeight={700} style={{ userSelect: "none" }}>
        {text.length > 16 ? `${text.slice(0, 16)}…` : text}
      </text>
      <text x={x + 12} y={y + 44} fill="rgba(255,255,255,0.9)" fontSize={10} style={{ userSelect: "none" }}>
        {statusMeta[status].label}
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
      return { nodes: [], edges: [] };
    }

    const incomingCounts = new Map<string, number>();
    workspace.graph.edges.forEach((edge) => {
      incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1);
    });

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
    const graphWidth = Math.max(800, (maxLayer + 1) * 220);
    const availableWidth = Math.max(640, graphWidth);
    const maxItemsInLayer = Math.max(...[...layerGroups.values()].map((items) => items.length), 1);
    const totalHeight = maxItemsInLayer * 110 + 100;

    const nodeMap = new Map<string, RoadmapTask>();
    workspace.graph.nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    const nodes = workspace.graph.nodes.map((node) => {
      const layer = layerMap.get(node.id) ?? 0;
      const itemsInLayer = layerGroups.get(layer) ?? [];
      const index = itemsInLayer.indexOf(node.id);
      const x = 30 + layer * 200 + (layer % 2) * 30;
      const y = 40 + (index * 120) + (index % 2 ? 20 : 0);
      return {
        ...node,
        layoutX: x,
        layoutY: y,
        width: 170,
        height: 80
      };
    });

    const edgeData = workspace.graph.edges.map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source)!;
      const targetNode = nodes.find((node) => node.id === edge.target)!;
      return {
        ...edge,
        sourceX: sourceNode.layoutX + sourceNode.width,
        sourceY: sourceNode.layoutY + sourceNode.height / 2,
        targetX: targetNode.layoutX,
        targetY: targetNode.layoutY + targetNode.height / 2
      };
    });

    return { nodes, edges: edgeData, width: availableWidth, height: totalHeight };
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
                d={`M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX + 70},${edge.sourceY} ${edge.targetX - 70},${edge.targetY} ${edge.targetX},${edge.targetY}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray={edge.source === edge.target ? "4 4" : undefined}
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
                x={node.layoutX}
                y={node.layoutY}
                width={node.width}
                height={node.height}
                onClick={() => onSelectTask(node.id)}
              />
            ))}
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Legend</p>
          <div className="mt-3 space-y-2">
            {Object.entries(typeMeta).map(([type, details]) => (
              <div key={type} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: details.color }} />
                {details.label}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status legend</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(statusMeta).map(([status, details]) => (
              <span key={status} className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ring-1 ${status === "positive" ? "" : ""}`}>
                {details.label}
              </span>
            ))}
          </div>
        </div>
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
  const [workspace, setWorkspace] = useState<RoadmapWorkspace | null>(null);
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
        const roadmap = await mockRoadmapApi.getProjectRoadmap(ROADMAP_PROJECT_ID);
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
  }, []);

  const selectedTask = useMemo(() => {
    if (!workspace) return null;
    return workspace.tasks.find((task) => task.id === selectedTaskId) ?? workspace.tasks[0] ?? null;
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
      const nextWorkspace = await mockRoadmapApi.updateTask(ROADMAP_PROJECT_ID, selectedTask.id, { status: nextStatus });
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
      const nextWorkspace = await mockRoadmapApi.addTaskNote(ROADMAP_PROJECT_ID, selectedTask.id, noteDraft.trim());
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
  children: ReactNode;
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
  children: ReactNode;
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
  UploadDocumentInput
} from "@/contracts/workflows";

import { apiBaseUrl, isMockMode } from "@/lib/config";
import {
  mockApprovalRequestsApi,
  mockApplicationsApi,
  mockAssistantApi,
  mockDashboardApi,
  mockDocumentApi,
  mockNotificationApi
} from "@/lib/mock-services";

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

export async function getDocuments(projectId: string): Promise<ProjectDocument[]> {
  if (isMockMode) {
    return mockDocumentApi.getDocuments(projectId);
  }

  return apiGet<ProjectDocument[]>(`/projects/${projectId}/documents`);
}

export async function uploadDocument(input: UploadDocumentInput): Promise<ProjectDocument[]> {
  if (isMockMode) {
    return mockDocumentApi.uploadDocument(input);
  }

  return apiGet<ProjectDocument[]>(`/projects/${input.projectId}/documents`);
}

export async function getApplications(projectId: string): Promise<ApplicationRecord[]> {
  if (isMockMode) {
    return mockApplicationsApi.getApplications(projectId);
  }

  return apiGet<ApplicationRecord[]>(`/projects/${projectId}/applications`);
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
    { href: "/roadmap", label: "Approval Roadmap" },
    { href: "/documents", label: "Documents" },
    { href: "/applications", label: "Applications" },
    { href: "/assistant", label: "AI Assistant" },
    { href: "/regulatory-updates", label: "Regulatory Updates" }
  ],
  Officer: [
    { href: "/", label: "Dashboard" },
    { href: "/officer", label: "Review Queue" },
    { href: "/applications", label: "Applications" },
    { href: "/roadmap", label: "Approval Roadmap" },
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
  UploadDocumentInput
} from "@/contracts/workflows";
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

function ensureRoadmapData(): RoadmapWorkspace {
  const stored = readStoredRoadmap();
  if (stored) {
    return stored;
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

function readStoredRoadmap(): RoadmapWorkspace | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(ROADMAP_STORAGE_KEY);
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

  window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmap));
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

function ensureGraphMatchesTasks(tasks: RoadmapTask[]): RoadmapWorkspace["graph"] {
  const graph = ensureRoadmapData().graph;
  const nextGraph = {
    ...graph,
    nodes: tasks.map((task) => ({ ...task }))
  };

  nextGraph.edges = graph.edges.filter((edge) => tasks.some((task) => task.id === edge.source) && tasks.some((task) => task.id === edge.target));
  return nextGraph;
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
    const workspace = ensureRoadmapData();
    if (projectId !== workspace.project_id) {
      throw new Error(`Project ${projectId} not found in mock roadmap data.`);
    }
    const nextWorkspace = computeRoadmapSummary(workspace);
    writeStoredRoadmap(nextWorkspace);
    return waitForDemo(nextWorkspace);
  },

  async getTask(projectId: string, taskId: string): Promise<RoadmapTask> {
    const workspace = ensureRoadmapData();
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
    const workspace = ensureRoadmapData();
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
    const workspace = ensureRoadmapData();
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
    const workspace = ensureRoadmapData();
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
      window.localStorage.removeItem(ROADMAP_STORAGE_KEY);
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
  }
];

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
    return stored;
  }
  writeStoredJson(DOCUMENTS_STORAGE_KEY, defaultDocuments);
  return defaultDocuments;
}

function ensureApplications(): ApplicationRecord[] {
  const stored = readStoredJson<ApplicationRecord[]>(APPLICATIONS_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  writeStoredJson(APPLICATIONS_STORAGE_KEY, defaultApplications);
  return defaultApplications;
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
  async getDocuments(projectIdValue: string): Promise<ProjectDocument[]> {
    const docs = ensureDocuments().filter((doc) => doc.projectId === projectIdValue);
    return waitForDemo(docs);
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
  }
};

export const mockApplicationsApi = {
  async getApplications(projectIdValue: string): Promise<ApplicationRecord[]> {
    const apps = ensureApplications().filter((app) => app.projectId === projectIdValue);
    return waitForDemo(apps);
  },
  async createDraftApplication(projectIdValue: string, name: string): Promise<ApplicationRecord[]> {
    const apps = ensureApplications();
    const draft: ApplicationRecord = {
      id: `app-${Date.now()}`,
      projectId: projectIdValue,
      projectName,
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

export async function resetMockData(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
    window.localStorage.removeItem(APPLICATIONS_STORAGE_KEY);
    window.localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
    window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    window.localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    window.localStorage.removeItem(APPROVAL_REQUESTS_STORAGE_KEY);
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

