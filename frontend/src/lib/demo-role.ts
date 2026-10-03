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
