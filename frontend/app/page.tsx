import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard";
import { Button, PageHeader } from "@/components/ui";

export default function HomePage() {
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
