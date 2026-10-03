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
