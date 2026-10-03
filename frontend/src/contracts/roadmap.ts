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
