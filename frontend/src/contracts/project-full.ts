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
