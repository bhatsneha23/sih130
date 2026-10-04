"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel, StatusBadge, EmptyState } from "@/components/ui";
import { getProject } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  
  const [project, setProject] = useState<MockProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  return (
    <AppShell>
      <PageHeader
        title={project?.name || "Project Details"}
        description={project ? "Detailed view of the project and its current status." : ""}
        actions={
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl p-6">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <Panel className="h-48"></Panel>
            <Panel className="h-32"></Panel>
          </div>
        ) : !project ? (
          <EmptyState
            title="Project not found"
            description="The project you are looking for does not exist or you do not have access."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Overview Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Panel>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-[#172b3a]">Project Overview</h3>
                  <StatusBadge status={project.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Organization</div>
                    <div className="font-medium text-[#172b3a]">{project.organization || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Sector</div>
                    <div className="font-medium text-[#172b3a]">{project.sector}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Location</div>
                    <div className="font-medium text-[#172b3a]">{project.location}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Stage</div>
                    <div className="font-medium text-[#172b3a]">{project.stage.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Investment</div>
                    <div className="font-medium text-[#172b3a]">{project.investmentAmount || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Site Status</div>
                    <div className="font-medium text-[#172b3a]">{project.siteStatus.replace('_', ' ')}</div>
                  </div>
                </div>

                {project.description && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-2">Description</div>
                    <p className="text-sm text-slate-700">{project.description}</p>
                  </div>
                )}
              </Panel>

              <Panel>
                <h3 className="text-lg font-bold text-[#172b3a] mb-4">Approval Progress</h3>
                <div className="mb-2 flex justify-between text-sm text-[#172b3a]">
                  <span>Overall Completion</span>
                  <span className="font-bold">{project.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden mb-4">
                  <div className="h-full bg-[#27628a]" style={{ width: `${project.progress}%` }} />
                </div>
                <p className="text-sm text-slate-500">
                  {project.completedApprovals} of {project.approvalCount} required approvals have been completed.
                </p>
              </Panel>
            </div>

            {/* Quick Links Sidebar */}
            <div className="space-y-6">
              <Panel className="bg-[#f8fafc]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#172b3a] mb-4">Quick Links</h3>
                <div className="space-y-3 flex flex-col">
                  <Link href={`/roadmap?projectId=${encodeURIComponent(project.id)}`}>
                    <Button variant="outline" className="w-full justify-start text-left bg-white">
                      View Roadmap
                    </Button>
                  </Link>
                  <Link href={`/documents?projectId=${encodeURIComponent(project.id)}`}>
                    <Button variant="outline" className="w-full justify-start text-left bg-white">
                      View Documents
                    </Button>
                  </Link>
                  <Link href={`/applications?projectId=${encodeURIComponent(project.id)}`}>
                    <Button variant="outline" className="w-full justify-start text-left bg-white">
                      View Applications
                    </Button>
                  </Link>
                </div>
              </Panel>
              
              <Panel>
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Created At</div>
                <div className="text-sm text-[#172b3a] mb-4">{new Date(project.createdAt).toLocaleDateString()}</div>
                
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Last Updated</div>
                <div className="text-sm text-[#172b3a]">{new Date(project.updatedAt).toLocaleDateString()}</div>
              </Panel>
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}
