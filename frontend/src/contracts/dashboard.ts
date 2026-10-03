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
