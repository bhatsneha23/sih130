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
