"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard";
import { OfficerWorkspace } from "@/components/officer-workspace";
import { Button, PageHeader } from "@/components/ui";
import { getStoredDemoRole, type DemoRole } from "@/lib/demo-role";

export default function HomePage() {
  const [role, setRole] = useState<DemoRole>("Applicant");

  useEffect(() => setRole(getStoredDemoRole()), []);

  if (role === "Officer") {
    return <OfficerWorkspace mode="dashboard" />;
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title="Approval dashboard"
        description="Monitor approvals, project milestones, and outstanding regulatory actions for your active industrial portfolio."
        actions={
          <>
            <Link href="/projects">
              <Button variant="secondary">View projects</Button>
            </Link>
            <Link href="/projects/new">
              <Button>New project</Button>
            </Link>
          </>
        }
      />
      <DashboardContent />
    </AppShell>
  );
}
