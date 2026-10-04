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

const TASK_ASSISTANT_STORAGE_KEY = "indusai-demo-task-assistant";

function taskAssistantKey(projectIdValue: string): string {
  return `${TASK_ASSISTANT_STORAGE_KEY}:${projectIdValue}`;
}

type TaskAssistantMessage = { id: string; role: "user" | "assistant"; content: string };

function readTaskAssistantHistory(projectIdValue: string): TaskAssistantMessage[] {
  return readStoredJson<TaskAssistantMessage[]>(taskAssistantKey(projectIdValue)) ?? [];
}

function writeTaskAssistantHistory(projectIdValue: string, messages: TaskAssistantMessage[]): void {
  writeStoredJson(taskAssistantKey(projectIdValue), messages);
}

function buildTaskAssistantReply(task: RoadmapTask, prompt: string): string {
  const lower = prompt.toLowerCase();
  const prereq = task.prerequisites.length
    ? `Prerequisites: ${task.prerequisites.join(", ")}.`
    : "This task has no prerequisites.";
  const docs = task.required_documents.length
    ? `Required documents: ${task.required_documents.join(", ")}.`
    : "No required documents listed.";
  const estimate =
    typeof task.estimated_sla_days === "number"
      ? `Estimated maximum duration: ${task.estimated_sla_days} day(s) (illustrative).`
      : "No duration estimate is set.";

  if (lower.includes("why") || lower.includes("required")) {
    return `${task.title} is listed because: ${task.applicability_rationale || task.description} ${estimate} This is illustrative demo guidance, not legal advice.`;
  }
  if (lower.includes("block") || lower.includes("depend")) {
    return `${
      task.status === "blocked" || task.readiness === "blocked"
        ? task.blocked_reason || "This task is marked blocked."
        : "This task is not currently blocked."
    } ${prereq} Downstream: ${task.dependents.length ? task.dependents.join(", ") : "none"}.`;
  }
  if (lower.includes("document") || lower.includes("cannot") || lower.includes("missing")) {
    return `${docs} If a document cannot be obtained, use Adjust roadmap to propose an alternative path, or upload evidence and note the gap for the officer. Suggestions here are illustrative only.`;
  }
  if (lower.includes("first") || lower.includes("next") || lower.includes("should i")) {
    return `Current status: ${task.status}. ${prereq} ${docs} ${estimate} Prefer completing prerequisites and required uploads before marking this step complete.`;
  }
  return `For “${task.title}” (${task.node_type}, status ${task.status}): ${task.description} ${prereq} ${docs} ${estimate}`;
}

function proposeEditFromPrompt(
  workspace: RoadmapWorkspace,
  prompt: string
): { message: string; summary: string | null; proposal: RoadmapWorkspace | null } {
  const lower = prompt.toLowerCase();
  const tasks = workspace.tasks.map((t) => makeRoadmapTask(t));
  const now = new Date().toISOString();

  const completeMatch = tasks.find(
    (t) =>
      lower.includes(t.title.toLowerCase().slice(0, 12)) &&
      (lower.includes("complete") || lower.includes("already done") || lower.includes("finished"))
  );
  if (completeMatch || (lower.includes("mark") && lower.includes("complete"))) {
    const target = completeMatch ?? tasks.find((t) => t.status !== "completed") ?? tasks[0];
    const nextTasks = tasks.map((t) =>
      t.id === target.id
        ? {
            ...t,
            status: "completed" as const,
            readiness: "ready" as const,
            blocked_reason: null,
            last_updated_at: now,
            activity: [
              ...t.activity,
              {
                id: `a-ai-${Date.now()}`,
                actor: "Roadmap assistant",
                message: "Marked complete via illustrative AI edit proposal.",
                timestamp: now,
                type: "status" as const
              }
            ]
          }
        : t
    );
    const proposal = computeRoadmapSummary({
      ...workspace,
      tasks: nextTasks,
      graph: { ...workspace.graph, nodes: nextTasks, edges: workspace.graph.edges }
    });
    return {
      message: `Proposed: mark “${target.title}” as completed. Other completed progress is preserved. Illustrative edit only.`,
      summary: `Set status of “${target.title}” to completed.`,
      proposal
    };
  }

  if (lower.includes("no longer required") || lower.includes("remove") || lower.includes("not required")) {
    const target =
      tasks.find((t) => lower.includes(t.title.toLowerCase().slice(0, 10))) ??
      tasks.find((t) => t.status === "blocked" || t.status === "not_started") ??
      tasks[tasks.length - 1];
    if (!target) {
      return { message: "I could not identify which task to remove. Name the task explicitly.", summary: null, proposal: null };
    }
    const removeId = target.id;
    const nextTasks = tasks
      .filter((t) => t.id !== removeId)
      .map((t) => ({
        ...t,
        prerequisites: t.prerequisites.filter((id) => id !== removeId),
        dependents: t.dependents.filter((id) => id !== removeId)
      }));
    const nextEdges = workspace.graph.edges.filter((e) => e.source !== removeId && e.target !== removeId);
    const proposal = computeRoadmapSummary({
      ...workspace,
      tasks: nextTasks,
      graph: { ...workspace.graph, nodes: nextTasks, edges: nextEdges }
    });
    return {
      message: `Proposed: remove “${target.title}” and clean related dependencies. Illustrative path change only.`,
      summary: `Remove task “${target.title}” and update dependency edges.`,
      proposal
    };
  }

  if (lower.includes("add") && (lower.includes("inspection") || lower.includes("step") || lower.includes("policy"))) {
    const newId = `${workspace.project_id}-extra-step-${Date.now()}`;
    const newTask: RoadmapTask = makeRoadmapTask({
      id: newId,
      node_type: lower.includes("inspection") ? "inspection" : "approval",
      title: lower.includes("inspection") ? "Additional site inspection" : "Additional compliance review",
      description: "Illustrative step added from an AI roadmap edit request (demo only).",
      status: "not_started",
      readiness: "needs_review",
      authority: "Illustrative authority",
      responsible_party: "Applicant coordinator",
      applicability_rationale: "Added from user-requested roadmap adjustment in the mock environment.",
      source_verification_status: "illustrative",
      source_refs: [],
      required_documents: ["Supporting evidence.pdf"],
      prerequisites: tasks[0] ? [tasks[0].id] : [],
      dependents: [],
      document_requirement_ids: [],
      estimated_sla_days: 10,
      due_at: null,
      last_updated_at: now,
      blocked_reason: null,
      notes: [],
      activity: [
        {
          id: `a-new-${Date.now()}`,
          actor: "Roadmap assistant",
          message: "Task proposed via Adjust roadmap.",
          timestamp: now,
          type: "action"
        }
      ],
      permitted_status_updates: ["not_started", "pending", "in_progress", "completed"],
      available_actions: ["mark_in_progress", "mark_complete", "add_note"]
    });
    const nextTasks = [...tasks, newTask];
    if (tasks[0]) {
      nextTasks[0] = { ...nextTasks[0], dependents: [...new Set([...nextTasks[0].dependents, newId])] };
    }
    const nextEdges = [
      ...workspace.graph.edges,
      ...(tasks[0]
        ? [{ id: `edge-ai-${Date.now()}`, source: tasks[0].id, target: newId, edge_type: "depends_on" as const }]
        : [])
    ];
    const proposal = computeRoadmapSummary({
      ...workspace,
      tasks: nextTasks,
      graph: { ...workspace.graph, nodes: nextTasks, edges: nextEdges }
    });
    return {
      message: `Proposed: add “${newTask.title}” (~${newTask.estimated_sla_days} days est.). Illustrative addition only.`,
      summary: `Add task “${newTask.title}” with dependency from the first existing task.`,
      proposal
    };
  }

  if (lower.includes("cannot") || lower.includes("alternative") || lower.includes("document")) {
    const target = tasks.find((t) => t.required_documents.length > 0 && t.status !== "completed") ?? tasks[0];
    if (!target) {
      return { message: "No document-bearing task found to adjust.", summary: null, proposal: null };
    }
    const nextTasks = tasks.map((t) =>
      t.id === target.id
        ? {
            ...t,
            notes: [
              ...t.notes,
              {
                id: `n-ai-${Date.now()}`,
                author: "Roadmap assistant",
                created_at: now,
                text: "Illustrative note: applicant reported difficulty obtaining a listed document; consider alternate evidence."
              }
            ],
            last_updated_at: now
          }
        : t
    );
    const proposal = computeRoadmapSummary({
      ...workspace,
      tasks: nextTasks,
      graph: { ...workspace.graph, nodes: nextTasks, edges: workspace.graph.edges }
    });
    return {
      message: `Proposed: annotate “${target.title}” regarding document difficulty. Status unchanged.`,
      summary: `Annotate “${target.title}” (no status change).`,
      proposal
    };
  }

  return {
    message:
      "I can propose: mark a task complete, remove a step, add an inspection/compliance step, or note document alternatives. Name the task when possible.",
    summary: null,
    proposal: null
  };
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
    async proposeRoadmapEdit(
    projectId: string,
    prompt: string
  ): Promise<{ message: string; summary: string | null; proposal: RoadmapWorkspace | null }> {
    const workspace = ensureRoadmapData(projectId);
    await waitForDemo(null);
    return proposeEditFromPrompt(workspace, prompt);
  },

  async applyRoadmapEdit(projectId: string, proposal: RoadmapWorkspace): Promise<RoadmapWorkspace> {
    if (proposal.project_id !== projectId) {
      throw new Error("Proposal project mismatch.");
    }
    const syncedTasks = syncTaskDependents(proposal.tasks.map((t) => makeRoadmapTask(t)));
    const next = computeRoadmapSummary({
      ...proposal,
      tasks: syncedTasks,
      graph: { ...proposal.graph, nodes: syncedTasks, edges: proposal.graph.edges },
      last_updated_at: new Date().toISOString()
    });
    writeStoredRoadmap(next);
    return waitForDemo(next);
  },

  async getTaskAssistantHistory(projectId: string): Promise<TaskAssistantMessage[]> {
    return waitForDemo(readTaskAssistantHistory(projectId));
  },

  async sendTaskAssistantMessage(
    projectId: string,
    taskId: string,
    prompt: string
  ): Promise<TaskAssistantMessage[]> {
    const workspace = ensureRoadmapData(projectId);
    const task = workspace.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error("Task not found.");
    }
    const history = readTaskAssistantHistory(projectId);
    const userMsg: TaskAssistantMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: `[${task.title}] ${prompt}`
    };
    const assistantMsg: TaskAssistantMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: buildTaskAssistantReply(task, prompt)
    };
    const next = [...history, userMsg, assistantMsg];
    writeTaskAssistantHistory(projectId, next);
    return waitForDemo(next);
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
