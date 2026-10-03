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
