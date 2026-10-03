"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel, StatusBadge, EmptyState } from "@/components/ui";
import { getProjects } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sector.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
  });

  return (
    <AppShell>
      <PageHeader
        title="Projects"
        description="Review active industrial projects, their milestones, and readiness across the approval lifecycle."
        actions={
          <Link href="/projects/new">
            <Button variant="primary">New project</Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl p-6">
        <Panel className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by project name, sector, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#172b3a] focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
          />
        </Panel>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <Panel key={i} className="h-48"></Panel>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Adjust your search or create a new project."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <Panel className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#172b3a] text-lg group-hover:text-[#27628a] transition-colors">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-sm text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded">{project.sector}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{project.location}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                      <span>{project.stage.replace('_', ' ')}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#27628a]" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 items-center">
                    <span>{project.completedApprovals}/{project.approvalCount} approvals completed</span>
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
