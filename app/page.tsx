"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GanttChartSquare,
  Gauge,
  Landmark,
  MessageSquareText,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Role = "applicant" | "officer" | "admin";
type AppPage =
  | "overview"
  | "projects"
  | "roadmap"
  | "applications"
  | "documents"
  | "assistant"
  | "inspections"
  | "incentives"
  | "grievances"
  | "renewals"
  | "regulatory"
  | "notifications"
  | "settings"
  | "queue"
  | "review"
  | "reports"
  | "users"
  | "departments"
  | "knowledge"
  | "audit";

type TimelineEvent = { id: string; label: string; detail: string; time: string; actor: string };
type AuditEvent = { id: string; time: string; actor: string; role: string; action: string; entity: string; outcome: string };
type ReadinessIssue = { id: string; label: string; detail: string; resolved: boolean };

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

type Project = {
  id: string;
  name: string;
  sector: string;
  location: string;
  stage: string;
  investment: string;
  status: string;
  approvalsCompleted: number;
  approvalsTotal: number;
};

type ApprovalNode = {
  id: string;
  name: string;
  department: string;
  status: "completed" | "in-progress" | "not-started" | "blocked" | "awaiting-action" | "awaiting-department";
  deadline: string;
  sla: string;
};

type Application = {
  id: string;
  ref: string;
  project: string;
  approval: string;
  department: string;
  submitted: string;
  status: string;
  deadline: string;
  risk: string;
  query?: string;
  response?: string;
  timeline?: TimelineEvent[];
};

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  status: string;
  project: string;
  approval: string;
  expiry: string;
  reuseCount?: number;
  extracted?: string[];
};

type Question = {
  id: string;
  sender: "assistant" | "user";
  text: string;
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  category: string;
};

type Grievance = {
  id: string;
  project: string;
  category: string;
  subject: string;
  status: string;
  ref: string;
  escalationEligible: boolean;
  timeline?: TimelineEvent[];
  response?: string;
};

type Inspection = {
  id: string;
  type: string;
  department: string;
  date: string;
  status: string;
  location: string;
  officer?: string;
  availability?: string;
};

type RegulatoryUpdate = {
  id: string;
  title: string;
  source: string;
  date: string;
  impact: string;
  review: string;
  affected: string[];
  summary?: string;
  detected?: string;
};

type Scheme = {
  id: string;
  name: string;
  department: string;
  status: string;
  deadline: string;
  eligibility: string;
  saved?: boolean;
  applicationStatus?: string;
};

const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Sahyadri Precision Components",
    sector: "Manufacturing",
    location: "Pune district, Maharashtra",
    stage: "Pre-establishment",
    investment: "₹18 crore",
    status: "Roadmap active",
    approvalsCompleted: 2,
    approvalsTotal: 9,
  },
  {
    id: "p2",
    name: "Indore Auto Structures",
    sector: "Auto components",
    location: "Nagpur",
    stage: "Expansion",
    investment: "₹11 crore",
    status: "Awaiting query",
    approvalsCompleted: 4,
    approvalsTotal: 8,
  },
];

const roadmapNodes: ApprovalNode[] = [
  { id: "a1", name: "Business incorporation", department: "MSME Support", status: "completed", deadline: "Completed", sla: "2 days" },
  { id: "a2", name: "Land lease verification", department: "District Industrial Centre", status: "in-progress", deadline: "12 Aug", sla: "7 days" },
  { id: "a3", name: "Factory building plan", department: "Town Planning", status: "awaiting-action", deadline: "18 Aug", sla: "10 days" },
  { id: "a4", name: "Factory registration", department: "Labour & Factories", status: "not-started", deadline: "24 Aug", sla: "14 days" },
  { id: "a5", name: "Pollution consent", department: "MPCB", status: "blocked", deadline: "20 Aug", sla: "21 days" },
  { id: "a6", name: "Power connection", department: "MSEDCL", status: "awaiting-department", deadline: "27 Aug", sla: "9 days" },
  { id: "a7", name: "Fire safety clearance", department: "Fire Dept.", status: "not-started", deadline: "29 Aug", sla: "12 days" },
  { id: "a8", name: "Water permission", department: "Irrigation Dept.", status: "not-started", deadline: "30 Aug", sla: "8 days" },
];

const initialApplications: Application[] = [
  { id: "app-1", ref: "IND-2026-041", project: "Sahyadri Precision Components", approval: "Factory Registration", department: "Labour & Factories", submitted: "05 Aug", status: "Under review", deadline: "18 Aug", risk: "Attention needed" },
  { id: "app-2", ref: "IND-2026-056", project: "Sahyadri Precision Components", approval: "Pollution Consent", department: "MPCB", submitted: "09 Aug", status: "Awaiting documents", deadline: "16 Aug", risk: "Potential delay" },
  { id: "app-3", ref: "IND-2026-064", project: "Indore Auto Structures", approval: "Power Connection", department: "MSEDCL", submitted: "12 Aug", status: "Approved", deadline: "Completed", risk: "Low" },
];

const initialDocuments: DocumentItem[] = [
  { id: "doc-1", name: "Lease deed", type: "Land record", status: "Verified", project: "Sahyadri Precision Components", approval: "Land lease verification", expiry: "2034-12-31" },
  { id: "doc-2", name: "Project report", type: "Technical summary", status: "Pending verification", project: "Sahyadri Precision Components", approval: "Factory registration", expiry: "2026-10-15" },
  { id: "doc-3", name: "Site plan", type: "Layout", status: "Needs correction", project: "Sahyadri Precision Components", approval: "Building plan approval", expiry: "2026-09-28" },
  { id: "doc-4", name: "Environmental checklist", type: "Compliance", status: "Reused", project: "Sahyadri Precision Components", approval: "Pollution consent", expiry: "2026-11-01" },
];

const initialNotifications: NotificationItem[] = [
  { id: "n1", title: "Query from Labour Department", detail: "Additional proof of land lease ownership is required.", time: "12 mins ago", unread: true, category: "Application" },
  { id: "n2", title: "Roadmap reassessment complete", detail: "Updated based on revised investment estimate.", time: "1 hr ago", unread: false, category: "Project" },
  { id: "n3", title: "Inspection slot proposed", detail: "Common inspection coordinated with MPCB and Fire Office.", time: "2 hrs ago", unread: true, category: "Inspection" },
  { id: "n4", title: "Regulatory update pending review", detail: "Air emissions reporting rule may affect the project plan.", time: "1 day ago", unread: false, category: "Regulatory" },
];

const initialGrievances: Grievance[] = [
  { id: "g1", project: "Sahyadri Precision Components", category: "Document delay", subject: "Pending queries on site inspection schedule", status: "In review", ref: "GRV-2401", escalationEligible: true },
  { id: "g2", project: "Indore Auto Structures", category: "Processing delay", subject: "Approval queue delay", status: "Escalated", ref: "GRV-2412", escalationEligible: true },
];

const initialInspections: Inspection[] = [
  { id: "i1", type: "Factory site inspection", department: "Labour & Factories", date: "14 Aug 2026", status: "Pending confirmation", location: "Pune district" },
  { id: "i2", type: "Environmental compliance check", department: "MPCB", date: "17 Aug 2026", status: "Proposed", location: "Sahyadri site" },
  { id: "i3", type: "Fire safety walkthrough", department: "Fire Dept.", date: "19 Aug 2026", status: "Scheduled", location: "Industrial park" },
];

const initialRegulatoryUpdates: RegulatoryUpdate[] = [
  { id: "r1", title: "Updated stack emission reporting format", source: "Maharashtra Pollution Control Board", date: "09 Aug 2026", impact: "High", review: "Pending review", affected: ["Pollution consent", "Annual compliance"] },
  { id: "r2", title: "Water usage intensity guideline revision", source: "State Water Resources Department", date: "07 Aug 2026", impact: "Medium", review: "Verified", affected: ["Water permission"] },
];

const initialSchemes: Scheme[] = [
  { id: "s1", name: "MSME Cluster Development Scheme", department: "MSME Dept.", status: "Eligible", deadline: "30 Sep", eligibility: "Manufacturing projects < ₹50 crore" },
  { id: "s2", name: "Green Manufacturing Incentive", department: "Maharashtra Industry Dept.", status: "Reviewing", deadline: "18 Sep", eligibility: "Low-emission and process efficiency proposals" },
];

const roleLabels = {
  applicant: "Applicant",
  officer: "Government Officer",
  admin: "Administrator",
} as const;

const applicantNav: { key: AppPage; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "My Projects" },
  { key: "roadmap", label: "Approval Roadmap" },
  { key: "applications", label: "Applications" },
  { key: "documents", label: "Documents" },
  { key: "assistant", label: "AI Assistant" },
  { key: "inspections", label: "Inspections" },
  { key: "incentives", label: "Incentives" },
  { key: "grievances", label: "Grievances" },
  { key: "renewals", label: "Compliance & Renewals" },
  { key: "regulatory", label: "Regulatory Updates" },
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Profile & Settings" },
];

const officerNav: { key: AppPage; label: string }[] = [
  { key: "overview", label: "Officer Overview" },
  { key: "queue", label: "Application Queue" },
  { key: "review", label: "Assigned Applications" },
  { key: "documents", label: "Document Review" },
  { key: "inspections", label: "Inspections" },
  { key: "grievances", label: "Grievances" },
  { key: "reports", label: "SLA Monitoring" },
];

const adminNav: { key: AppPage; label: string }[] = [
  { key: "overview", label: "Admin Overview" },
  { key: "users", label: "User & Role Management" },
  { key: "departments", label: "Departments" },
  { key: "projects", label: "Workflow Configuration" },
  { key: "knowledge", label: "Regulatory Knowledge Base" },
  { key: "regulatory", label: "Policy Update Review" },
  { key: "reports", label: "System Analytics" },
  { key: "audit", label: "Audit Logs" },
  { key: "settings", label: "Grievance Configuration" },
];

const statusToneMap: Record<string, StatusTone> = {
  success: "success",
  completed: "success",
  approved: "success",
  verified: "success",
  "under review": "info",
  "in progress": "info",
  "in-progress": "info",
  scheduled: "info",
  high: "danger",
  medium: "warning",
  low: "success",
  "awaiting-action": "warning",
  "attention needed": "warning",
  blocked: "danger",
  rejected: "danger",
  overdue: "danger",
  "needs correction": "warning",
  "pending review": "warning",
  "pending verification": "warning",
  "proposed": "warning",
  "not-started": "neutral",
  "awaiting documents": "warning",
  "awaiting-department": "warning",
  "pending confirmation": "warning",
  reviewing: "warning",
  eligible: "success",
  "in review": "info",
  escalated: "danger",
};

function getToneClass(tone: StatusTone) {
  const map = {
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-slate-200 text-slate-700",
  } as const;
  return map[tone];
}

function Badge({ text, tone = "neutral" }: { text: string; tone?: StatusTone }) {
  return <span className={`badge ${getToneClass(tone)}`}>{text}</span>;
}

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: any }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function DashboardApp() {
  const [selectedRole, setSelectedRole] = useState<Role>("applicant");
  const [selectedPage, setSelectedPage] = useState<AppPage>("overview");
  const [started, setStarted] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances);
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>(initialRegulatoryUpdates);
  const [schemes, setSchemes] = useState<Scheme[]>(initialSchemes);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalNode | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [toast, setToast] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("All statuses");
  const [documentModal, setDocumentModal] = useState(false);
  const [readinessChecked, setReadinessChecked] = useState(false);
  const [readinessIssues, setReadinessIssues] = useState<ReadinessIssue[]>([
    { id: "lease", label: "Lease ownership proof", detail: "Upload the signed ownership annexure for land lease verification.", resolved: false },
    { id: "site", label: "Site plan correction", detail: "Correct the north-arrow and plot boundary fields in the site plan.", resolved: false },
  ]);
  const [assistantMessages, setAssistantMessages] = useState<Question[]>([
    { id: "m1", sender: "assistant", text: "I can help you map the approvals for Sahyadri Precision Components. Which question would you like answered?" },
    { id: "m2", sender: "user", text: "Why is pollution consent required for this project?" },
    { id: "m3", sender: "assistant", text: "Because your manufacturing process involves metal finishing and heat treatment, the project falls under a category where MPCB consent is required before operations begin. The current bottleneck is the environmental impact assessment and document validation." },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("indusai-demo-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role) setSelectedRole(parsed.role);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.applications) setApplications(parsed.applications);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.grievances) setGrievances(parsed.grievances);
        if (parsed.inspections) setInspections(parsed.inspections);
        if (parsed.updates) setUpdates(parsed.updates);
        if (parsed.schemes) setSchemes(parsed.schemes);
        if (parsed.auditLog) setAuditLog(parsed.auditLog);
        setStarted(true);
      } catch {
        setStarted(false);
      }
    } else {
      setStarted(false);
    }
  }, []);

  useEffect(() => {
    if (started) {
      localStorage.setItem(
        "indusai-demo-state",
        JSON.stringify({
          role: selectedRole,
          projects,
          applications,
          documents,
          notifications,
          grievances,
          inspections,
          updates,
          schemes,
          auditLog,
        }),
      );
    }
  }, [selectedRole, started, projects, applications, documents, notifications, grievances, inspections, updates, schemes, auditLog]);

  const saveState = () => {
    localStorage.setItem(
      "indusai-demo-state",
      JSON.stringify({
        role: selectedRole,
        projects,
        applications,
        documents,
        notifications,
        grievances,
        inspections,
        updates,
        schemes,
        auditLog,
      }),
    );
  };

  const activeProject = useMemo(() => projects[0] ?? initialProjects[0], [projects]);
  const navigation = selectedRole === "applicant" ? applicantNav : selectedRole === "officer" ? officerNav : adminNav;
  const readinessScore = 76;

  const handleSubmit = () => {
    setApplications((current) => [
      {
        id: "app-new",
        ref: "IND-2026-092",
        project: activeProject.name,
        approval: "Factory Registration",
        department: "Labour & Factories",
        submitted: "Today",
        status: "Submitted",
        deadline: "18 Aug",
        risk: "Low",
        timeline: [{ id: `t-${Date.now()}`, label: "Submitted", detail: "Application submitted through the simulated demo flow.", time: "Just now", actor: "Applicant" }],
      },
      ...current,
    ]);
    setNotifications((current) => [
      { id: `n-${Date.now()}`, title: "Application submitted successfully", detail: `Reference IND-2026-092 has been created for ${activeProject.name}.`, time: "Just now", unread: true, category: "Application" },
      ...current,
    ]);
    setAuditLog((current) => [{ id: `audit-${Date.now()}`, time: "Just now", actor: "Demo Applicant", role: "Applicant", action: "Submitted application", entity: "IND-2026-092", outcome: "Success" }, ...current]);
    setToast("Application submitted. Reference IND-2026-092 is now visible to officers.");
  };

  const handleAddDocument = () => {
    const item: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: "Utility data report",
      type: "Utility document",
      status: "Verified",
      project: activeProject.name,
      approval: "Power connection",
      expiry: "2027-02-20",
      reuseCount: 0,
      extracted: ["Project name: Sahyadri Precision Components", "Location: Pune district", "Document date: 2026-08-14"],
    };
    setDocuments((current) => [item, ...current]);
    setDocumentModal(false);
    setToast("Document processed with simulated OCR and marked Verified.");
  };

  const addAudit = (action: string, entity: string, outcome = "Success") => {
    setAuditLog((current) => [{ id: `audit-${Date.now()}`, time: "Just now", actor: selectedRole === "officer" ? "Demo Officer" : selectedRole === "admin" ? "Demo Administrator" : "Demo Applicant", role: roleLabels[selectedRole], action, entity, outcome }, ...current]);
  };

  const updateApplication = (id: string, status: string, detail: string, query?: string) => {
    setApplications((current) => current.map((item) => item.id === id ? { ...item, status, query, timeline: [{ id: `t-${Date.now()}`, label: status, detail, time: "Just now", actor: roleLabels[selectedRole] }, ...(item.timeline ?? [])] } : item));
    const target = applications.find((item) => item.id === id);
    if (target) setNotifications((current) => [{ id: `n-${Date.now()}`, title: query ? "Query from Government Officer" : `Application ${status.toLowerCase()}`, detail: query ?? detail, time: "Just now", unread: true, category: "Application" }, ...current]);
    addAudit(`Application ${status.toLowerCase()}`, id);
    setToast(detail);
  };

  const runReadiness = () => {
    setBusyAction("readiness");
    window.setTimeout(() => { setReadinessChecked(true); setBusyAction(""); setToast("Readiness check completed using the mock checklist."); }, 500);
  };

  const resolveIssue = (id: string) => {
    setReadinessIssues((current) => current.map((issue) => issue.id === id ? { ...issue, resolved: true } : issue));
    setDocuments((current) => current.map((doc) => doc.id === "doc-3" && id === "site" ? { ...doc, status: "Verified" } : doc));
    setToast("Issue resolved in demo state. Run the readiness check again.");
  };

  const sendApplicantResponse = (application: Application) => {
    updateApplication(application.id, "Response submitted", "Applicant response submitted with the requested correction.", undefined);
    setApplications((current) => current.map((item) => item.id === application.id ? { ...item, response: "Corrected document attached and ready for review." } : item));
  };

  const runMonitoring = () => {
    setBusyAction("monitoring");
    window.setTimeout(() => {
      const update: RegulatoryUpdate = { id: `r-${Date.now()}`, title: "New air-emissions reporting template detected", source: "Illustrative MPCB bulletin", date: "03 Oct 2026", detected: "03 Oct 2026", impact: "High", review: "Pending review", affected: ["Pollution consent", "Annual compliance"], summary: "Prepared mock update requiring human verification before any roadmap impact is applied." };
      setUpdates((current) => [update, ...current]);
      setNotifications((current) => [{ id: `n-${Date.now()}`, title: "Policy update pending review", detail: update.title, time: "Just now", unread: true, category: "Regulatory" }, ...current]);
      setBusyAction(""); setToast("Monitoring check found an illustrative update for administrator review."); addAudit("Ran regulatory monitoring check", update.id);
    }, 700);
  };

  const reviewUpdate = (id: string, decision: "Verified" | "Rejected") => {
    setUpdates((current) => current.map((item) => item.id === id ? { ...item, review: decision } : item));
    setNotifications((current) => [{ id: `n-${Date.now()}`, title: `Regulatory update ${decision.toLowerCase()}`, detail: "Affected project owners can review the proposed roadmap impact.", time: "Just now", unread: true, category: "Regulatory" }, ...current]);
    addAudit(`Regulatory update ${decision.toLowerCase()}`, id);
    setToast(`Policy update ${decision.toLowerCase()} in the simulated knowledge workflow.`);
  };

  const handleMessageSubmit = () => {
    setAssistantMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, sender: "user", text: "What is the next action to unblock the pollution consent track?" },
      { id: `m-${Date.now() + 1}`, sender: "assistant", text: "The main dependency is the environmental statement package. Upload a corrected process flow and confirm the air-emissions estimate, then the application can proceed to internal review within 5 working days." },
    ]);
  };

  const resetDemo = () => {
    setProjects(initialProjects);
    setApplications(initialApplications);
    setDocuments(initialDocuments);
    setNotifications(initialNotifications);
    setGrievances(initialGrievances);
    setInspections(initialInspections);
    setUpdates(initialRegulatoryUpdates);
    setSchemes(initialSchemes);
    setAuditLog([]);
    setReadinessChecked(false);
    setReadinessIssues([{ id: "lease", label: "Lease ownership proof", detail: "Upload the signed ownership annexure for land lease verification.", resolved: false }, { id: "site", label: "Site plan correction", detail: "Correct the north-arrow and plot boundary fields in the site plan.", resolved: false }]);
    setAssistantMessages([
      { id: "m1", sender: "assistant", text: "I can help you map the approvals for Sahyadri Precision Components. Which question would you like answered?" },
      { id: "m2", sender: "user", text: "Why is pollution consent required for this project?" },
      { id: "m3", sender: "assistant", text: "Because your manufacturing process involves metal finishing and heat treatment, the project falls under a category where MPCB consent is required before operations begin. The current bottleneck is the environmental impact assessment and document validation." },
    ]);
    localStorage.removeItem("indusai-demo-state");
    setSelectedRole("applicant");
    setSelectedPage("overview");
    setStarted(true);
  };

  const chartData = [
    { month: "Jan", apps: 32 },
    { month: "Feb", apps: 44 },
    { month: "Mar", apps: 36 },
    { month: "Apr", apps: 49 },
    { month: "May", apps: 58 },
    { month: "Jun", apps: 64 },
  ];

  const donutData = [
    { name: "In progress", value: 45, color: "#0f766e" },
    { name: "Awaiting action", value: 28, color: "#f59e0b" },
    { name: "Delayed", value: 17, color: "#ef4444" },
    { name: "Completed", value: 10, color: "#3b82f6" },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-600">{roleLabels[selectedRole]} workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{selectedRole === "applicant" ? "Applicant dashboard" : selectedRole === "officer" ? "Officer overview" : "Admin overview"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedPage("notifications")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"> <Bell className="h-4 w-4" /> {notifications.filter((n) => n.unread).length} unread</button>
          <button onClick={() => setSelectedPage(selectedRole === "applicant" ? "projects" : selectedRole === "officer" ? "queue" : "regulatory")} className="rounded-xl bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">Continue project setup</button>
        </div>
      </div>

      <div className="grid-3">
        <StatCard label="Active projects" value={String(projects.length)} detail="2 active roadmaps" icon={Building2} />
        <StatCard label="Total approvals" value="17" detail="7 critical dependencies" icon={GanttChartSquare} />
        <StatCard label="Approvals completed" value="4" detail="2 recent certifications" icon={CheckCircle2} />
        <StatCard label="Awaiting action" value="5" detail="2 direct applicant tasks" icon={ClipboardCheck} />
        <StatCard label="Upcoming deadlines" value="3" detail="Next in 3 days" icon={AlertTriangle} />
        <StatCard label="Documents needing attention" value="2" detail="1 lease issue and 1 site plan" icon={FileText} />
      </div>

      <div className="grid-2">
        <div className="card p-5">
          <SectionHeader icon={GanttChartSquare} title="Project progress" description="Current approval roadmap status" />
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm text-slate-600"><span>{activeProject.name}</span><span>{activeProject.approvalsCompleted}/{activeProject.approvalsTotal}</span></div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 w-[45%] rounded-full bg-brand-600" />
              </div>
            </div>
            <div className="grid-2">
              {roadmapNodes.slice(0, 4).map((node) => (
                <div key={node.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{node.name}</span>
                    <Badge text={node.status} tone={statusToneMap[node.status] as StatusTone} />
                  </div>
                  <p className="text-xs text-slate-500">{node.department}</p>
                  <p className="mt-1 text-xs text-slate-500">Due {node.deadline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <SectionHeader icon={Gauge} title="Readiness summary" description="Pre-submission evaluation" />
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-slate-900">{readinessScore}%</p>
              <p className="text-sm text-slate-500">Illustrative readiness score</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {readinessIssues.map((issue) => <li key={issue.id} className="flex items-center justify-between gap-2"><span>{issue.resolved ? "✓" : "•"} {issue.label}</span>{!issue.resolved && <button onClick={() => resolveIssue(issue.id)} className="text-xs font-semibold text-brand-700">Resolve</button>}</li>)}
            <li>• 1 approval is blocked by environmental clearance dependency</li>
          </ul>
          {readinessChecked && <p className="mt-3 text-sm font-medium text-brand-700">Check complete: {readinessIssues.every((issue) => issue.resolved) ? "Ready for simulated submission" : "Action remains before submission"}.</p>}
          <button onClick={runReadiness} disabled={busyAction === "readiness"} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-white disabled:opacity-60">{busyAction === "readiness" ? "Checking..." : "Run readiness check"}</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card p-5">
          <SectionHeader icon={Sparkles} title="Recent activity" description="Latest approvals and workflow updates" />
          <div className="space-y-3">
            {applications.slice(0, 3).map((item) => (
              <button key={item.id} onClick={() => setSelectedApplication(item)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">{item.approval}</p>
                  <p className="text-sm text-slate-500">{item.ref} • {item.department}</p>
                </div>
                <Badge text={item.status} tone={statusToneMap[item.status.toLowerCase()] as StatusTone} />
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <SectionHeader icon={Bell} title="Notifications" description="Latest actions and alerts" />
          <div className="space-y-3">
            {notifications.slice(0, 4).map((item) => (
              <div key={item.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.unread ? "bg-brand-600" : "bg-slate-300"}`} />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.detail}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <SectionHeader icon={Building2} title="My projects" description="Create, review and update project profiles" />
      <div className="grid-2">
        {projects.map((project) => (
          <div key={project.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">{project.name}</h4>
              <Badge text={project.status} tone="info" />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Sector: {project.sector}</p>
              <p>Location: {project.location}</p>
              <p>Investment: {project.investment}</p>
              <p>Stage: {project.stage}</p>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open roadmap <ChevronRight className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h4 className="text-lg font-semibold text-slate-900">Project setup wizard</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-dashed border-slate-300 p-4">
            <p className="font-medium text-slate-800">Basic project information</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>Project name: Sahyadri Precision Components</p>
              <p>Business activity: Precision fabrication and machining</p>
              <p>Pollution category: Medium</p>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 p-4">
            <p className="font-medium text-slate-800">Conversational intake</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>AI assistant: “Do you intend to use process heat treatment or surface finishing?”</p>
              <p>Suggested answer: “Yes, along with metal finishing.”</p>
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white">Generate project profile</button>
      </div>
    </div>
  );

  const renderRoadmap = () => (
    <div className="space-y-6">
      <SectionHeader icon={GanttChartSquare} title="Approval roadmap" description="Dependency-aware and parallel approval view" />
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge text="Completed" tone="success" />
          <Badge text="In progress" tone="info" />
          <Badge text="Awaiting action" tone="warning" />
          <Badge text="Blocked" tone="danger" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roadmapNodes.map((node) => (
            <button key={node.id} onClick={() => setSelectedApproval(node)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-brand-300 hover:bg-brand-50">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-slate-800">{node.name}</p>
                <Badge text={node.status} tone={statusToneMap[node.status] as StatusTone} />
              </div>
              <p className="text-sm text-slate-600">{node.department}</p>
              <p className="mt-2 text-sm text-slate-500">Deadline: {node.deadline}</p>
              <p className="text-sm text-slate-500">SLA: {node.sla}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <SectionHeader icon={ClipboardCheck} title="Application tracker" description="Search, filter and review approvals" />
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap gap-3">
          <input value={applicationSearch} onChange={(event) => setApplicationSearch(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Search applications" aria-label="Search applications" />
          <select value={applicationStatus} onChange={(event) => setApplicationStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" aria-label="Filter application status"><option>All statuses</option><option>Under review</option><option>Awaiting documents</option><option>Approved</option><option>Response submitted</option></select>
          <button onClick={handleSubmit} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">Submit mock application</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {applications.filter((item) => `${item.ref} ${item.approval} ${item.project}`.toLowerCase().includes(applicationSearch.toLowerCase()) && (applicationStatus === "All statuses" || item.status === applicationStatus)).map((item) => (
                <tr key={item.id} onClick={() => setSelectedApplication(item)} className="cursor-pointer border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.ref}</td>
                  <td className="px-4 py-3">{item.approval}</td>
                  <td className="px-4 py-3">{item.department}</td>
                  <td className="px-4 py-3"><Badge text={item.status} tone={statusToneMap[item.status.toLowerCase()] as StatusTone} /></td>
                  <td className="px-4 py-3">{item.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <SectionHeader icon={FileText} title="Document center" description="Upload, validate and reuse project records" />
      <div className="grid-2">
        <div className="card p-5">
          <h4 className="text-lg font-semibold text-slate-900">Document list</h4>
          <div className="mt-4 space-y-3">
            {documents.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No documents match this project yet. Add a prepared sample to continue.</p>}
            {documents.map((doc) => (
              <button key={doc.id} onClick={() => setToast(`${doc.name}: ${doc.extracted?.join("; ") ?? "Simulated extracted fields available."}`)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">{doc.name}</p>
                  <p className="text-sm text-slate-500">{doc.type}</p>
                </div>
                <div className="text-right">
                  <Badge text={doc.status} tone={statusToneMap[doc.status.toLowerCase()] as StatusTone} />
                  <p className="mt-2 text-xs text-slate-500">{doc.expiry}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h4 className="text-lg font-semibold text-slate-900">Upload or connect</h4>
          <div className="mt-4 space-y-3">
            <button onClick={() => setDocumentModal(true)} className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white">Upload or select sample document</button>
            <button onClick={() => { setDocumentModal(true); setToast("Simulated DigiLocker consent: no credentials are requested."); }} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700">Connect DigiLocker (simulated)</button>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              OCR extraction preview: Project report • 4 extracted fields identified • 1 validation concern found.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRenewals = () => (
    <div className="space-y-6">
      <SectionHeader icon={ClipboardCheck} title="Compliance & renewals" description="Illustrative obligations, renewal windows and next actions" />
      <div className="grid-2">
        {[{ name: "Annual environmental statement", approval: "Pollution consent", due: "30 Sep 2026", status: "Due soon" }, { name: "Factory licence renewal", approval: "Factory registration", due: "15 Nov 2026", status: "Ready to prepare" }, { name: "Fire safety certificate", approval: "Fire safety clearance", due: "19 Aug 2027", status: "Active" }].map((item) => (
          <div key={item.name} className="card p-5">
            <div className="flex items-center justify-between"><h4 className="font-semibold text-slate-900">{item.name}</h4><Badge text={item.status} tone={item.status === "Due soon" ? "warning" : "success"} /></div>
            <p className="mt-3 text-sm text-slate-600">Related approval: {item.approval}</p><p className="mt-1 text-sm text-slate-600">Due date: {item.due}</p>
            <p className="mt-3 text-xs text-slate-500">Illustrative reminder only. Confirm official obligations with the relevant department.</p>
            <button onClick={() => setToast(`Renewal preparation opened for ${item.name}.`)} className="mt-4 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Prepare renewal</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssistant = () => (
    <div className="space-y-6">
      <SectionHeader icon={MessageSquareText} title="AI approval assistant" description="Context-aware recommendations for the active project and approval" />
      <div className="card p-5">
        <div className="mb-3 flex gap-2 text-sm">
          <button className="rounded-lg bg-brand-50 px-3 py-1.5 text-brand-700">Project level</button>
          <button className="rounded-lg px-3 py-1.5 text-slate-500">Approval level</button>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {assistantMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${message.sender === "user" ? "bg-brand-600 text-white" : "bg-white text-slate-700"}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <input className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Ask about approval requirements, dependencies or deadlines" />
          <button onClick={handleMessageSubmit} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">Send</button>
        </div>
      </div>
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-6">
      <SectionHeader icon={Microscope} title="Inspection planning" description="Coordinate site visits and schedule approvals" />
      <div className="grid-2">
        {inspections.map((item) => (
            <div key={item.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800">{item.type}</h4>
              <Badge text={item.status} tone={statusToneMap[item.status.toLowerCase()] as StatusTone} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Department: {item.department}</p>
              <p>Date: {item.date}</p>
              <p>Location: {item.location}</p>
            </div>
            <div className="mt-4 flex gap-2"><button onClick={() => { setInspections((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "Proposed by applicant", availability: "Available 18-20 Aug" } : entry)); setToast("Applicant availability proposed for this inspection."); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">Propose availability</button><button onClick={() => { setInspections((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "Confirmed" } : entry)); addAudit("Confirmed inspection slot", item.id); setToast("Mock inspection slot confirmed for demonstration."); }} className="rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">Confirm mock slot</button></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIncentives = () => (
    <div className="space-y-6">
      <SectionHeader icon={Zap} title="Incentives and schemes" description="Discover relevant government support programs" />
      <div className="grid-2">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">{scheme.name}</h4>
              <Badge text={scheme.status} tone="success" />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Department: {scheme.department}</p>
              <p>Deadline: {scheme.deadline}</p>
              <p>Eligibility: {scheme.eligibility}</p>
            </div>
            <button onClick={() => { setSchemes((current) => current.map((entry) => entry.id === scheme.id ? { ...entry, saved: !entry.saved, applicationStatus: entry.applicationStatus ?? "Preparation started" } : entry)); setToast(`${scheme.name} saved and preparation checklist opened.`); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">{scheme.saved ? "Saved" : "Prepare application"} <ArrowRight className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGrievances = () => (
    <div className="space-y-6">
      <SectionHeader icon={BookOpen} title="Grievance center" description="Escalation, timelines and resolution tracking" />
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap gap-2"><button onClick={() => { const grievance: Grievance = { id: `g-${Date.now()}`, project: activeProject.name, category: "Application delay", subject: "Request for review of application timeline", status: "Submitted", ref: `GRV-${Date.now().toString().slice(-4)}`, escalationEligible: true, timeline: [{ id: `t-${Date.now()}`, label: "Submitted", detail: "Grievance created in the simulated center.", time: "Just now", actor: "Applicant" }] }; setGrievances((current) => [grievance, ...current]); setNotifications((current) => [{ id: `n-${Date.now()}`, title: "Grievance submitted", detail: `${grievance.ref} is now assigned for review.`, time: "Just now", unread: true, category: "Grievance" }, ...current]); setToast(`Grievance ${grievance.ref} submitted.`); }} className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white">Create grievance</button><p className="self-center text-xs text-slate-500">Attachment and escalation rules are simulated for this demo.</p></div>
        <div className="space-y-3">
          {grievances.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-800">{item.subject}</p>
                <p className="text-sm text-slate-500">{item.project} • {item.category}</p>
                <p className="mt-1 text-xs text-slate-400">{item.ref}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge text={item.status} tone={statusToneMap[item.status.toLowerCase()] as StatusTone} />
                {item.escalationEligible && <Badge text="Escalation eligible" tone="warning" />}
                <button onClick={() => setSelectedGrievance(item)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Open</button>
                {item.escalationEligible && <button onClick={() => { if (window.confirm("Submit this illustrative escalation?")) { setGrievances((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "Escalated", escalationEligible: false } : entry)); addAudit("Escalated grievance", item.ref); setToast(`${item.ref} escalated under the mock SLA rules.`); } }} className="rounded-lg bg-amber-100 px-2 py-1 text-xs text-amber-800">Escalate</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRegulatory = () => (
    <div className="space-y-6">
      <SectionHeader icon={Landmark} title="Regulatory intelligence" description="Policy monitoring and pending review updates" />
      <button onClick={runMonitoring} disabled={busyAction === "monitoring"} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{busyAction === "monitoring" ? "Checking illustrative sources..." : "Run monitoring check"}</button>
      <div className="grid-2">
        {updates.map((item) => (
          <div key={item.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">{item.title}</h4>
              <Badge text={item.impact} tone={statusToneMap[item.impact.toLowerCase()] as StatusTone} />
            </div>
            <p className="mt-2 text-sm text-slate-500">Source: {item.source}</p>
            <p className="mt-2 text-sm text-slate-600">Review status: {item.review}</p>
            <p className="mt-2 text-sm text-slate-600">Affected: {item.affected.join(", ")}</p>
            <p className="mt-2 text-sm text-slate-600">Summary: {item.summary ?? "Versioned mock reference entry for demonstration."}</p>
            {selectedRole === "admin" && item.review === "Pending review" && <div className="mt-4 flex gap-2"><button onClick={() => reviewUpdate(item.id, "Verified")} className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800">Approve update</button><button onClick={() => reviewUpdate(item.id, "Rejected")} className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">Reject update</button></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <SectionHeader icon={Bell} title="Notifications" description="Inbox for approvals, queries, deadlines and updates" />
      <div className="card p-5">
        <div className="space-y-3">
          {notifications.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No notifications yet.</p>}
          {notifications.map((item) => (
            <button key={item.id} onClick={() => { setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry)); setSelectedPage(item.category === "Regulatory" ? "regulatory" : item.category === "Grievance" ? "grievances" : "applications"); }} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
              <div className="text-right">
                <Badge text={item.category} tone="neutral" />
                <p className="mt-2 text-xs text-slate-400">{item.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQueue = () => (
    <div className="space-y-6">
      <SectionHeader icon={Users} title="Application queue" description="Departmental review and assigned records" />
      <div className="grid-3">
        <StatCard label="Assigned apps" value="18" detail="7 pending verification" icon={Users} />
        <StatCard label="SLA at risk" value="4" detail="2 within 48 hours" icon={AlertTriangle} />
        <StatCard label="Open grievances" value="6" detail="2 new escalations" icon={BookOpen} />
      </div>
      <div className="card p-5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => (
              <tr key={item.id} onClick={() => setSelectedApplication(item)} className="cursor-pointer border-t border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{item.ref}</td>
                <td className="px-4 py-3">{item.project}</td>
                <td className="px-4 py-3"><Badge text={item.status} tone={statusToneMap[item.status.toLowerCase()] as StatusTone} /></td>
                <td className="px-4 py-3">{item.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <SectionHeader icon={Gauge} title="Analytics and reports" description="SLA, workload and bottleneck trends" />
      <div className="grid-2">
        <div className="card p-5">
          <h4 className="text-lg font-semibold text-slate-900">Application volume</h4>
          <div className="h-56 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="apps" stroke="#0f766e" fill="#d9f7f4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h4 className="text-lg font-semibold text-slate-900">Approval stage mix</h4>
          <div className="h-56 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={5}>
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <SectionHeader icon={Users} title="Profile & settings" description="Demo preferences and prototype role information" />
      <div className="card max-w-2xl p-5"><p className="text-sm text-slate-500">Current demo role</p><p className="mt-1 text-xl font-semibold">{roleLabels[selectedRole]}</p><p className="mt-4 text-sm text-slate-600">This role switcher is for presentation only. It is not authentication or production access control.</p><label className="mt-5 flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" defaultChecked /> Receive simulated deadline reminders</label><button onClick={() => setToast("Demo preferences saved locally.")} className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">Save preferences</button></div>
    </div>
  );

  const renderAdminPanels = () => (
    <div className="space-y-6">
      <SectionHeader icon={ShieldCheck} title="Administration" description="Workflow configuration and regulatory knowledge" />
      <div className="grid-3">
        <StatCard label="Users" value="136" detail="12 new this month" icon={Users} />
        <StatCard label="Policy updates" value="3" detail="1 pending approval" icon={Landmark} />
        <StatCard label="SLA compliance" value="91%" detail="Above target" icon={Gauge} />
      </div>
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900">Knowledge base entries</h4>
          <button onClick={() => { const entry: RegulatoryUpdate = { id: `r-${Date.now()}`, title: "Illustrative local water reporting note", source: "Demo knowledge editor", date: "03 Oct 2026", impact: "Medium", review: "Pending review", affected: ["Water permission"], summary: "Administrator-created mock entry awaiting review." }; setUpdates((current) => [entry, ...current]); addAudit("Created knowledge-base entry", entry.id); setToast("Pending knowledge-base entry created."); }} className="rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">Add mock entry</button>
        </div>
        <div className="space-y-3">
          {updates.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.source}</p>
              </div>
              <Badge text={item.review} tone={statusToneMap[item.review.toLowerCase()] as StatusTone} />
            </div>
          ))}
        </div>
      </div>
      {selectedPage === "audit" && <div className="card p-5"><h4 className="text-lg font-semibold text-slate-900">Audit log</h4><div className="mt-4 space-y-2">{auditLog.length === 0 && <p className="text-sm text-slate-500">Actions from the demo journey will appear here.</p>}{auditLog.map((entry) => <div key={entry.id} className="grid gap-1 rounded-xl border border-slate-200 p-3 text-sm sm:grid-cols-[120px_120px_1fr_100px]"><span className="text-slate-500">{entry.time}</span><span>{entry.actor}</span><span>{entry.action} • {entry.entity}</span><Badge text={entry.outcome} tone="success" /></div>)}</div></div>}
    </div>
  );

  const renderContent = () => {
    switch (selectedPage) {
      case "projects":
        return renderProjects();
      case "roadmap":
        return renderRoadmap();
      case "applications":
        return renderApplications();
      case "documents":
        return renderDocuments();
      case "assistant":
        return renderAssistant();
      case "inspections":
        return renderInspections();
      case "incentives":
        return renderIncentives();
      case "grievances":
        return renderGrievances();
      case "regulatory":
        return renderRegulatory();
      case "notifications":
        return renderNotifications();
      case "renewals":
        return renderRenewals();
      case "settings":
        return selectedRole === "admin" ? renderAdminPanels() : renderSettings();
      case "queue":
        return renderQueue();
      case "review":
        return renderQueue();
      case "reports":
        return renderReports();
      case "users":
      case "departments":
      case "knowledge":
      case "audit":
        return renderAdminPanels();
      default:
        return renderOverview();
    }
  };

  return started ? (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-brand-900 p-5 text-white md:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-200">IndusAI</p>
              <h2 className="mt-1 text-xl font-bold">Demo workspace</h2>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em]">Demo</span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-teal-200">Role</p>
            <div className="mt-3 flex gap-2">
              {(["applicant", "officer", "admin"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => { setSelectedRole(role); setSelectedPage("overview"); saveState(); }}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${selectedRole === role ? "bg-white text-brand-900" : "bg-white/5 text-white/70"}`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedPage(item.key)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${selectedPage === item.key ? "bg-white text-brand-900" : "text-slate-200 hover:bg-white/5 hover:text-white"}`}
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Prototype notes</p>
            <p className="mt-2 text-sm text-slate-200">Uses mock data and local browser state to simulate approvals, officer actions and admin review flows.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 md:hidden">
            {(["applicant", "officer", "admin"] as Role[]).map((role) => (
              <button key={role} onClick={() => { setSelectedRole(role); setSelectedPage("overview"); }} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${selectedRole === role ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>{roleLabels[role]}</button>
            ))}
            <select aria-label="Mobile page navigation" value={selectedPage} onChange={(event) => setSelectedPage(event.target.value as AppPage)} className="min-w-40 rounded-lg border border-slate-200 px-2 py-2 text-xs">
              {navigation.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </div>
          <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Government of Maharashtra</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Industrial approvals intelligence</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={resetDemo} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Reset demo</button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Users className="h-5 w-5" /></div>
            </div>
          </header>

          {renderContent()}

          {toast && <div role="status" className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"><div className="flex items-start gap-3"><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast("")}><X className="h-4 w-4" /></button></div></div>}

          {selectedApproval && <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Approval detail</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedApproval.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedApproval.department} • Illustrative project-dependent guidance</p></div><button aria-label="Close approval detail" onClick={() => setSelectedApproval(null)}><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Why it applies</p><p className="mt-1 text-sm text-slate-700">Manufacturing activity and the selected project stage indicate this approval should be reviewed before commencement.</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Current status</p><p className="mt-1"><Badge text={selectedApproval.status} tone={statusToneMap[selectedApproval.status] as StatusTone} /></p><p className="mt-2 text-sm text-slate-600">Deadline {selectedApproval.deadline} • SLA {selectedApproval.sla}</p></div></div><h3 className="mt-5 font-semibold">Requirements and next actions</h3><ul className="mt-2 space-y-2 text-sm text-slate-600"><li>• Project report and site plan are required documents.</li><li>• Dependency: land lease verification must be sufficiently complete.</li><li>• Applicant action: resolve outstanding document issues.</li><li>• Department action: review the submitted package within the illustrative SLA.</li></ul><button onClick={() => { setSelectedApproval(null); setSelectedPage("assistant"); setToast(`Assistant context set to ${selectedApproval.name}.`); }} className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">Ask contextual assistant</button></div></div>}

          {selectedApplication && <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Application detail</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedApplication.ref}</h2><p className="mt-1 text-sm text-slate-500">{selectedApplication.approval} • {selectedApplication.department}</p></div><button aria-label="Close application detail" onClick={() => setSelectedApplication(null)}><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Status</p><Badge text={selectedApplication.status} tone={statusToneMap[selectedApplication.status.toLowerCase()] as StatusTone} /></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">SLA deadline</p><p className="font-semibold">{selectedApplication.deadline}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Risk explanation</p><p className="font-semibold">{selectedApplication.risk}</p></div></div><p className="mt-5 text-sm text-slate-600">Project: {selectedApplication.project}. Submitted {selectedApplication.submitted}. All actions below are illustrative and update shared demo state.</p><h3 className="mt-5 font-semibold">Timeline</h3><div className="mt-2 space-y-2">{(selectedApplication.timeline ?? [{ id: "seed", label: selectedApplication.status, detail: "Seeded mock application record.", time: selectedApplication.submitted, actor: "System" }]).map((event) => <div key={event.id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="font-medium">{event.label} <span className="font-normal text-slate-400">• {event.time}</span></p><p className="text-slate-600">{event.detail}</p><p className="mt-1 text-xs text-slate-400">{event.actor}</p></div>)}</div><div className="mt-5 flex flex-wrap gap-2">{selectedRole === "officer" ? <><button onClick={() => { updateApplication(selectedApplication.id, "Documents correction requested", "Applicant query sent: please correct the site plan and lease proof.", "Please correct the site plan and provide lease ownership proof."); setSelectedApplication(null); }} className="rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900">Request correction + query</button><button onClick={() => { if (window.confirm("Approve this illustrative application?")) { updateApplication(selectedApplication.id, "Approved", "Application approved in the simulated officer workflow."); setSelectedApplication(null); } }} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white">Approve</button><button onClick={() => { const reason = window.prompt("Enter a mock rejection reason:", "Required evidence remains incomplete."); if (reason) { updateApplication(selectedApplication.id, "Rejected", `Application rejected in demo: ${reason}`); setSelectedApplication(null); } }} className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white">Reject</button></> : selectedApplication.query ? <button onClick={() => { sendApplicantResponse(selectedApplication); setSelectedApplication(null); }} className="rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">Submit corrected response</button> : <button onClick={() => { setSelectedApplication(null); setSelectedPage("documents"); }} className="rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">Review documents</button>}</div>{selectedApplication.query && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Officer query</p><p className="mt-1">{selectedApplication.query}</p></div>}</div></div>}

          {selectedGrievance && <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Grievance timeline</p><h2 className="mt-1 text-2xl font-bold">{selectedGrievance.ref}</h2></div><button onClick={() => setSelectedGrievance(null)} aria-label="Close grievance detail"><X className="h-5 w-5" /></button></div><p className="mt-3 text-sm text-slate-600">{selectedGrievance.subject} • {selectedGrievance.status}</p><div className="mt-5 space-y-2">{(selectedGrievance.timeline ?? [{ id: "seed", label: "Submitted", detail: "Seeded mock grievance.", time: "12 Aug", actor: "Applicant" }]).map((event) => <div key={event.id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="font-medium">{event.label}</p><p className="text-slate-600">{event.detail}</p><p className="text-xs text-slate-400">{event.time} • {event.actor}</p></div>)}</div>{selectedRole === "officer" && <button onClick={() => { setGrievances((current) => current.map((item) => item.id === selectedGrievance.id ? { ...item, status: "Officer responded", response: "The department has acknowledged the issue and will review the linked application." } : item)); setSelectedGrievance(null); setToast("Officer response added to the grievance timeline."); }} className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm text-white">Respond to applicant</button>}</div></div>}

          {documentModal && <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Simulated document service</p><h2 className="mt-1 text-2xl font-bold">Add prepared sample</h2></div><button onClick={() => setDocumentModal(false)} aria-label="Close document dialog"><X className="h-5 w-5" /></button></div><p className="mt-3 text-sm text-slate-600">No external upload, OCR, DigiLocker credential, or legal verification occurs. This demo simulates metadata, extraction and validation.</p><label className="mt-5 block text-sm font-medium">Document type<select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"><option>Utility data report</option><option>Project report</option><option>Land lease document</option><option>Environmental information</option></select></label><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Filename: sample-utility-report.pdf<br />OCR: 3 fields extracted<br />Validation: simulated pass</div><button onClick={handleAddDocument} className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white">Process and save document</button></div></div>}
        </main>
      </div>
    </div>
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      <div className="w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">IndusAI</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">AI-powered industrial approvals & compliance intelligence</h1>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">Demo mode</span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(["applicant", "officer", "admin"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => {
                setSelectedRole(role);
                setSelectedPage("overview");
                setStarted(true);
              }}
              className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:border-brand-200 hover:bg-brand-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                {role === "applicant" ? <Building2 className="h-6 w-6" /> : role === "officer" ? <Users className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">{roleLabels[role]}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {role === "applicant"
                  ? "Create projects, review roadmaps, reuse documents and track approvals."
                  : role === "officer"
                    ? "Process applications, review documents and monitor SLA and inspections."
                    : "Manage departments, policy updates and knowledge-base governance."}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                Enter workspace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-brand-100 bg-brand-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">How IndusAI works</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-900">1. Intake</p>
              <p className="mt-2 text-sm text-slate-600">Capture business profile and regulatory context.</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-900">2. Roadmap</p>
              <p className="mt-2 text-sm text-slate-600">Map dependencies, document needs and critical milestones.</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-900">3. Action</p>
              <p className="mt-2 text-sm text-slate-600">Track submissions, queries, inspections and incentives in one flow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <DashboardApp />;
}
