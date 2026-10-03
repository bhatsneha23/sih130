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
