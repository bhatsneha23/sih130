"use client";

import { useEffect, useState } from "react";

import type { DashboardSummary } from "@/contracts/dashboard";
import { Button, EmptyState, Panel, StatusBadge } from "@/components/ui";
import { getDashboardSummary } from "@/lib/api";

export function DashboardContent() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (loadError) {
        if (isMounted) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "The dashboard data could not be loaded.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <EmptyState
        title="Dashboard is unavailable"
        description={error ?? "The dashboard could not be loaded from the current data source."}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold text-[#172b3a]">{metric.value}</p>
              <StatusBadge
                tone={
                  metric.tone === "positive"
                    ? "positive"
                    : metric.tone === "warning"
                      ? "warning"
                      : "neutral"
                }
              >
                {metric.change}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Panel
          title="Continue working"
          action={<StatusBadge tone="info">Illustrative data</StatusBadge>}
        >
          <div className="space-y-4">
            {summary.projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#172b3a]">{project.name}</h3>
                      {project.illustrative ? (
                        <StatusBadge tone="info">Demo</StatusBadge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {project.sector} · {project.stage}
                    </p>
                  </div>
                  <StatusBadge
                    tone={project.status.toLowerCase().includes("review") ? "warning" : "neutral"}
                  >
                    {project.status}
                  </StatusBadge>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Next due</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{project.due}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Approval</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{project.approval}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Progress</p>
                    <p className="mt-1 text-sm font-medium text-[#172b3a]">{project.progress}%</p>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#27628a]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent activity" action={<Button variant="ghost">View all</Button>}>
          <ul className="space-y-4">
            {summary.activity.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div
                  className={
                    item.tone === "success"
                      ? "mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"
                      : item.tone === "warning"
                        ? "mt-1 h-2.5 w-2.5 rounded-full bg-amber-500"
                        : "mt-1 h-2.5 w-2.5 rounded-full bg-[#27628a]"
                  }
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#172b3a]">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
