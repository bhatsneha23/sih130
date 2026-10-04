"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type {
  ApprovalTaskStatus,
  RoadmapNodeType,
  RoadmapTask,
  RoadmapTaskActionId,
  RoadmapWorkspace,
  SourceVerificationStatus
} from "@/contracts/roadmap";
import { mockRoadmapApi } from "@/lib/mock-services";
import { getProjects } from "@/lib/api";
import type { MockProject } from "@/contracts/project-full";

const statusMeta: Record<
  ApprovalTaskStatus,
  { label: string; tone: "positive" | "warning" | "neutral" | "info" }
> = {
  not_started: { label: "Not started", tone: "neutral" },
  blocked: { label: "Blocked", tone: "warning" },
  pending: { label: "Pending", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "warning" },
  changes_requested: { label: "Changes requested", tone: "warning" },
  completed: { label: "Completed", tone: "positive" },
  rejected: { label: "Rejected", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" }
};

const readinessMeta: Record<
  NonNullable<RoadmapTask["readiness"]>,
  { label: string; tone: "positive" | "warning" | "neutral" | "info" }
> = {
  ready: { label: "Ready", tone: "positive" },
  at_risk: { label: "At risk", tone: "warning" },
  blocked: { label: "Blocked", tone: "warning" },
  needs_review: { label: "Needs review", tone: "warning" },
  not_applicable: { label: "Not applicable", tone: "neutral" }
};

const typeMeta: Record<RoadmapNodeType, { label: string; color: string }> = {
  approval: { label: "Approval", color: "#2563eb" },
  document: { label: "Document", color: "#0ea5e9" },
  inspection: { label: "Inspection", color: "#f59e0b" },
  applicant_action: { label: "Applicant action", color: "#10b981" }
};

const verificationMeta: Record<SourceVerificationStatus, string> = {
  verified: "Verified",
  unverified: "Unverified",
  illustrative: "Illustrative",
  needs_review: "Needs review"
};

const statusOrder: Record<ApprovalTaskStatus, number> = {
  not_started: 0,
  pending: 1,
  in_progress: 2,
  submitted: 3,
  under_review: 4,
  changes_requested: 5,
  blocked: 6,
  completed: 7,
  rejected: 8,
  cancelled: 9
};

function getStatusTone(value: ApprovalTaskStatus) {
  return statusMeta[value]?.tone ?? "neutral";
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function sortTasks(tasks: RoadmapTask[], sortBy: string) {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "status":
        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99) || a.title.localeCompare(b.title);
      case "type":
        return a.node_type.localeCompare(b.node_type) || a.title.localeCompare(b.title);
      case "last_updated":
        return new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime();
      case "due_date":
      default:
        if (!a.due_at && !b.due_at) return a.title.localeCompare(b.title);
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    }
  });

  return sorted;
}

function getNodeVisual(status: ApprovalTaskStatus, readiness?: RoadmapTask["readiness"]) {
  // Blocked only when the task is explicitly blocked by status or readiness.
  // Having prerequisites alone does not make a node blocked.
  const isBlocked =
    status === "blocked" || readiness === "blocked";

  if (isBlocked) {
    return {
      fill: "#e2e8f0",
      text: "#475569",
      border: "#94a3b8",
      muted: true,
      label: "Blocked"
    };
  }

  switch (status) {
    case "completed":
      return {
        fill: "#10b981",
        text: "#ffffff",
        border: "#059669",
        muted: false,
        label: "Completed"
      };
    case "in_progress":
      return {
        fill: "#f97316",
        text: "#ffffff",
        border: "#ea580c",
        muted: false,
        label: "In progress"
      };
    case "not_started":
    case "pending":
      return {
        fill: "#3b82f6",
        text: "#ffffff",
        border: "#2563eb",
        muted: false,
        label: status === "not_started" ? "Not started" : "Pending"
      };
    case "submitted":
    case "under_review":
      return {
        fill: "#8b5cf6",
        text: "#ffffff",
        border: "#7c3aed",
        muted: false,
        label: status === "submitted" ? "Submitted" : "Under review"
      };
    case "changes_requested":
      return {
        fill: "#f59e0b",
        text: "#ffffff",
        border: "#d97706",
        muted: false,
        label: "Changes requested"
      };
    case "rejected":
      return {
        fill: "#ef4444",
        text: "#ffffff",
        border: "#dc2626",
        muted: false,
        label: "Rejected"
      };
    case "cancelled":
      return {
        fill: "#64748b",
        text: "#ffffff",
        border: "#475569",
        muted: false,
        label: "Cancelled"
      };
    default: {
      // Fallback for any future status values
      const meta = statusMeta[status as ApprovalTaskStatus];
      return {
        fill: "#64748b",
        text: "#ffffff",
        border: "#475569",
        muted: false,
        label: meta?.label ?? String(status)
      };
    }
  }
}

function NodeShape({
  type,
  text,
  selected,
  status,
  readiness,
  x,
  y,
  width,
  height,
  onClick
}: {
  type: RoadmapNodeType;
  text: string;
  selected: boolean;
  status: ApprovalTaskStatus;
  readiness?: RoadmapTask["readiness"];
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}) {
  const visual = getNodeVisual(status, readiness);
  const border = selected ? "#0f172a" : visual.border;
  const strokeWidth = selected ? 3.5 : 1.75;

  // Split long titles into up to 2 lines for readability
  const words = text.split(" ");
  let line1 = text;
  let line2 = "";
  if (text.length > 18 && words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(" ");
    line2 = words.slice(mid).join(" ");
  }

  const shape =
    type === "document"
      ? { shape: "circle" as const, cx: x + width / 2, cy: y + height / 2, r: Math.max(width / 2, 42) }
      : type === "inspection"
        ? {
            shape: "diamond" as const,
            points: `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`
          }
        : { shape: "rect" as const, x, y, width, height };

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {shape.shape === "circle" ? (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={visual.fill}
          opacity={visual.muted ? 0.55 : selected ? 1 : 0.95}
          stroke={border}
          strokeWidth={strokeWidth}
        />
      ) : shape.shape === "diamond" ? (
        <polygon
          points={shape.points}
          fill={visual.fill}
          opacity={visual.muted ? 0.55 : selected ? 1 : 0.95}
          stroke={border}
          strokeWidth={strokeWidth}
        />
      ) : (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={16}
          fill={visual.fill}
          opacity={visual.muted ? 0.55 : selected ? 1 : 0.95}
          stroke={border}
          strokeWidth={strokeWidth}
        />
      )}

      {/* Title – multiline when needed */}
      <text
        x={x + width / 2}
        y={line2 ? y + height / 2 - 10 : y + height / 2 - 4}
        fill={visual.text}
        fontSize={13}
        fontWeight={700}
        textAnchor="middle"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {line1.length > 22 ? `${line1.slice(0, 20)}…` : line1}
      </text>
      {line2 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          fill={visual.text}
          fontSize={13}
          fontWeight={700}
          textAnchor="middle"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {line2.length > 22 ? `${line2.slice(0, 20)}…` : line2}
        </text>
      ) : null}

      {/* Status label under title */}
      <text
        x={x + width / 2}
        y={line2 ? y + height / 2 + 26 : y + height / 2 + 16}
        fill={visual.muted ? "#64748b" : "rgba(255,255,255,0.92)"}
        fontSize={11}
        fontWeight={500}
        textAnchor="middle"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {visual.label}
      </text>
    </g>
  );
}

function DependencyGraph({
  workspace,
  selectedTaskId,
  onSelectTask
}: {
  workspace: RoadmapWorkspace | null;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ x: number; y: number } | null>(null);

    const layout = useMemo(() => {
    if (!workspace || workspace.graph.nodes.length === 0) {
      return { nodes: [], edges: [], width: 900, height: 560 };
    }

    const layerMap = new Map<string, number>();
    const queue: string[] = [];

    workspace.graph.nodes.forEach((node) => {
      const incoming = workspace.graph.edges.filter((edge) => edge.target === node.id).length;
      if (incoming === 0) {
        layerMap.set(node.id, 0);
        queue.push(node.id);
      }
    });

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLayer = layerMap.get(currentId) ?? 0;
      workspace.graph.edges
        .filter((edge) => edge.source === currentId)
        .forEach((edge) => {
          const nextLayer = currentLayer + 1;
          const prior = layerMap.get(edge.target) ?? Number.NEGATIVE_INFINITY;
          if (nextLayer > prior) {
            layerMap.set(edge.target, nextLayer);
            queue.push(edge.target);
          }
        });
    }

    const layerGroups = new Map<number, string[]>();
    workspace.graph.nodes.forEach((node) => {
      const layer = layerMap.get(node.id) ?? 0;
      const existing = layerGroups.get(layer) ?? [];
      existing.push(node.id);
      layerGroups.set(layer, existing);
    });

    const maxLayer = Math.max(...[...layerGroups.keys()], 0);
    const maxItemsInLayer = Math.max(...[...layerGroups.values()].map((items) => items.length), 1);

    // Increased spacing for larger, more readable nodes
    const nodeWidth = 200;
    const nodeHeight = 96;
    const layerGap = 260;
    const rowGap = 140;

    const graphWidth = Math.max(900, (maxLayer + 1) * layerGap + 80);
    const totalHeight = Math.max(560, maxItemsInLayer * rowGap + 120);

    const nodes = workspace.graph.nodes.map((node) => {
      const layer = layerMap.get(node.id) ?? 0;
      const itemsInLayer = layerGroups.get(layer) ?? [];
      const index = itemsInLayer.indexOf(node.id);
      const x = 40 + layer * layerGap + (layer % 2) * 24;
      const y = 48 + index * rowGap + (index % 2 ? 16 : 0);
      return {
        ...node,
        layoutX: x,
        layoutY: y,
        width: nodeWidth,
        height: nodeHeight
      };
    });

    const edgeData = workspace.graph.edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)!;
      const targetNode = nodes.find((n) => n.id === edge.target)!;
      return {
        ...edge,
        sourceX: sourceNode.layoutX + sourceNode.width,
        sourceY: sourceNode.layoutY + sourceNode.height / 2,
        targetX: targetNode.layoutX,
        targetY: targetNode.layoutY + targetNode.height / 2
      };
    });

    return { nodes, edges: edgeData, width: graphWidth, height: totalHeight };
  }, [workspace]);

  useEffect(() => {
    if (!workspace || layout.nodes.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const contentWidth = layout.width ?? 900;
    const contentHeight = layout.height ?? 560;
    const svgWidth = 900;
    const svgHeight = 560;
    const nextZoom = Math.min(svgWidth / (contentWidth + 80), svgHeight / (contentHeight + 60), 1.1);
    setZoom(nextZoom);
    setPan({ x: 18, y: 10 });
  }, [layout, workspace]);

  if (!workspace || workspace.graph.nodes.length === 0) {
    return (
      <EmptyState
        title="No roadmap available"
        description="This project does not yet have any approval tasks or dependencies in the illustrative mock data."
      />
    );
  }

  const fitGraph = () => {
    const width = Math.max(900, layout.width ?? 900);
    const height = Math.max(520, layout.height ?? 520);
    const nextZoom = Math.min(900 / (width + 60), 520 / (height + 50), 1.1);
    setZoom(nextZoom);
    setPan({ x: 20, y: 20 });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-1">{workspace.graph.nodes.length} tasks</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">{workspace.graph.edges.length} dependencies</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => setZoom((current) => Math.max(0.6, Number((current * 0.85).toFixed(2))))}>
            −
          </Button>
          <Button variant="secondary" type="button" onClick={() => setZoom((current) => Math.min(1.8, Number((current * 1.15).toFixed(2))))}>
            +
          </Button>
          <Button variant="secondary" type="button" onClick={fitGraph}>
            Fit view
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <svg
          role="img"
          aria-label="Roadmap dependency graph"
          className="block h-[560px] w-full cursor-grab bg-[radial-gradient(circle_at_top,_#f8fbff,_#f8fafc_35%,_#eef4f7)]"
          onWheel={(event) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 0.9 : 1.1;
            setZoom((current) => Math.min(1.8, Math.max(0.5, Number((current * delta).toFixed(2)))));
          }}
          onPointerDown={(event) => {
            dragState.current = { x: event.clientX, y: event.clientY };
            setIsDragging(true);
          }}
          onPointerMove={(event) => {
            if (!isDragging || !dragState.current) return;
            const dx = event.clientX - dragState.current.x;
            const dy = event.clientY - dragState.current.y;
            dragState.current = { x: event.clientX, y: event.clientY };
            setPan((current) => ({ x: current.x + dx / zoom, y: current.y + dy / zoom }));
          }}
          onPointerUp={() => {
            dragState.current = null;
            setIsDragging(false);
          }}
          onPointerLeave={() => {
            dragState.current = null;
            setIsDragging(false);
          }}
        >
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                        {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={`M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX + 90},${edge.sourceY} ${edge.targetX - 90},${edge.targetY} ${edge.targetX},${edge.targetY}`}
                fill="none"
                stroke="#64748b"
                strokeWidth={2.25}
                strokeOpacity={0.85}
                markerEnd="url(#arrowhead)"
              />
            ))}
            {layout.nodes.map((node) => (
              <NodeShape
                key={node.id}
                type={node.node_type}
                text={node.title}
                selected={selectedTaskId === node.id}
                status={node.status}
                readiness={node.readiness}
                x={node.layoutX}
                y={node.layoutY}
                width={node.width}
                height={node.height}
                onClick={() => onSelectTask(node.id)}
              />
            ))}
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill="#64748b" />
            </marker>
          </defs>
        </svg>
      </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Node background colors
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-emerald-500 shadow-sm" />
            <span>Completed / approved</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-orange-500 shadow-sm" />
            <span>In progress</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-blue-500 shadow-sm" />
            <span>Available to start</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-slate-300 shadow-sm opacity-70" />
            <span>Blocked (prerequisites incomplete)</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-violet-500 shadow-sm" />
            <span>Submitted / under review</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-amber-500 shadow-sm" />
            <span>Changes requested</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-red-500 shadow-sm" />
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-4 w-4 rounded-md bg-slate-500 shadow-sm" />
            <span>Cancelled</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Node shape still indicates type (rectangle = approval / action, circle = document, diamond = inspection). Selected nodes have a stronger dark border.
        </p>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  isSelected,
  onSelect
}: {
  task: RoadmapTask;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border p-4 text-left transition-colors",
        isSelected ? "border-[#27628a] bg-[#eef8ff]" : "border-slate-200 bg-white hover:bg-slate-50"
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
              style={{ backgroundColor: typeMeta[task.node_type].color }}
            >
              {typeMeta[task.node_type].label}
            </span>
            <h3 className="truncate text-base font-semibold text-[#172b3a]">{task.title}</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">{task.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={getStatusTone(task.status)}>{statusMeta[task.status].label}</StatusBadge>
          {task.readiness ? (
            <StatusBadge tone={readinessMeta[task.readiness].tone}>
              {readinessMeta[task.readiness].label}
            </StatusBadge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Due</p>
          <p className="mt-1 font-medium text-slate-800">{formatDate(task.due_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Owner</p>
          <p className="mt-1 font-medium text-slate-800">{task.responsible_party ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Dependencies</p>
          <p className="mt-1 font-medium text-slate-800">{task.prerequisites.length ? task.prerequisites.length : "None"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Updated</p>
          <p className="mt-1 font-medium text-slate-800">{formatDate(task.last_updated_at)}</p>
        </div>
      </div>
    </button>
  );
}

function RoadmapListView({
  workspace,
  selectedTaskId,
  onSelectTask,
  search,
  statusFilter,
  typeFilter,
  sortBy,
  setSearch,
  setStatusFilter,
  setTypeFilter,
  setSortBy,
  groupBy,
  setGroupBy,
  clearFilters
}: {
  workspace: RoadmapWorkspace | null;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  search: string;
  statusFilter: "all" | ApprovalTaskStatus;
  typeFilter: "all" | RoadmapNodeType;
  sortBy: string;
  setSearch: (value: string) => void;
  setStatusFilter: (value: "all" | ApprovalTaskStatus) => void;
  setTypeFilter: (value: "all" | RoadmapNodeType) => void;
  setSortBy: (value: string) => void;
  groupBy: "none" | "status" | "type";
  setGroupBy: (value: "none" | "status" | "type") => void;
  clearFilters: () => void;
}) {
  const tasks = useMemo(() => {
    if (!workspace) return [];

    const filtered = workspace.tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesType = typeFilter === "all" || task.node_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    return sortTasks(filtered, sortBy);
  }, [workspace, search, statusFilter, typeFilter, sortBy]);

  const groupedTasks = useMemo(() => {
    if (groupBy === "none") {
      return { All: tasks };
    }

    const collection = new Map<string, RoadmapTask[]>();
    tasks.forEach((task) => {
      const key = groupBy === "status" ? statusMeta[task.status].label : typeMeta[task.node_type].label;
      const current = collection.get(key) ?? [];
      current.push(task);
      collection.set(key, current);
    });

    return Object.fromEntries(collection.entries());
  }, [tasks, groupBy]);

  if (!workspace) {
    return <div className="text-sm text-slate-500">Loading roadmap…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,1fr,1.2fr]">
          <input
            aria-label="Search approval tasks"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task name"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-[#27628a]"
          />
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | ApprovalTaskStatus)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(statusMeta).map(([status]) => (
              <option key={status} value={status}>
                {statusMeta[status as ApprovalTaskStatus].label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as "all" | RoadmapNodeType)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="all">All types</option>
            {Object.entries(typeMeta).map(([type, details]) => (
              <option key={type} value={type}>
                {details.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort tasks"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="due_date">Due date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="type">Type</option>
            <option value="last_updated">Last updated</option>
          </select>
          <div className="flex items-center gap-2">
            <select
              aria-label="Group tasks"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as "none" | "status" | "type")}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="none">No grouping</option>
              <option value="status">Group by status</option>
              <option value="type">Group by type</option>
            </select>
            <Button variant="secondary" type="button" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your filters"
          description="Adjust your search or clear the current filters to see the full roadmap."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([groupName, groupItems]) => (
            <div key={groupName} className="space-y-3">
              {groupBy !== "none" ? (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{groupName}</span>
                  <span className="text-xs text-slate-400">({groupItems.length})</span>
                </div>
              ) : null}
              <div className="space-y-3">
                {groupItems.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={() => onSelectTask(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskDetailDrawer({
  task,
  projectName,
  workspace,
  onClose,
  onTaskSelection,
  onUpdateTaskStatus,
  onAddNote,
  noteDraft,
  setNoteDraft,
  isSaving
}: {
  task: RoadmapTask | null;
  projectName: string;
  workspace: RoadmapWorkspace | null;
  onClose: () => void;
  onTaskSelection: (taskId: string) => void;
  onUpdateTaskStatus: (nextStatus: ApprovalTaskStatus) => Promise<void>;
  onAddNote: () => Promise<void>;
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  isSaving: boolean;
}) {
  if (!task || !workspace) {
    return null;
  }

  const prerequisites = task.prerequisites
    .map((id) => workspace.tasks.find((entry) => entry.id === id))
    .filter(Boolean) as RoadmapTask[];
  const dependents = task.dependents
    .map((id) => workspace.tasks.find((entry) => entry.id === id))
    .filter(Boolean) as RoadmapTask[];

  return (
    <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#27628a]">{projectName}</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#172b3a]">{task.title}</h2>
          </div>
          <Button variant="ghost" type="button" onClick={onClose} aria-label="Close task details">
            Close
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={getStatusTone(task.status)}>{statusMeta[task.status].label}</StatusBadge>
          {task.readiness ? (
            <StatusBadge tone={readinessMeta[task.readiness].tone}>{readinessMeta[task.readiness].label}</StatusBadge>
          ) : null}
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
            {typeMeta[task.node_type].label}
          </span>
        </div>

        <Panel title="Overview">
          <dl className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Authority</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{task.authority ?? "Illustrative authority"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Source verification</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{verificationMeta[task.source_verification_status]}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Responsible party</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{task.responsible_party ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Due date</dt>
              <dd className="mt-1 font-medium text-[#172b3a]">{formatDate(task.due_at)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-700">{task.description}</p>
        </Panel>

        {task.blocked_reason ? (
          <Panel title="Blocked reason">
            <p className="text-sm text-slate-700">{task.blocked_reason}</p>
            {prerequisites.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {prerequisites.map((dependency) => (
                  <Button key={dependency.id} variant="secondary" type="button" onClick={() => onTaskSelection(dependency.id)}>
                    View prerequisite: {dependency.title}
                  </Button>
                ))}
              </div>
            ) : null}
          </Panel>
        ) : null}

        <Panel title="Readiness and source references">
          <div className="space-y-3">
            {task.readiness ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">Readiness</span>
                <StatusBadge tone={readinessMeta[task.readiness].tone}>{readinessMeta[task.readiness].label}</StatusBadge>
              </div>
            ) : null}
            {task.applicability_rationale ? (
              <p className="text-sm text-slate-700">{task.applicability_rationale}</p>
            ) : null}
            {task.source_refs.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {task.source_refs.map((reference) => (
                  <li key={reference.source_id} className="rounded-xl border border-slate-200 p-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{reference.label}</span>
                      <StatusBadge tone={reference.verification_status === "verified" ? "positive" : reference.verification_status === "illustrative" ? "info" : "warning"}>
                        {verificationMeta[reference.verification_status]}
                      </StatusBadge>
                    </div>
                    {reference.url ? (
                      <a href={reference.url} className="mt-2 inline-block text-xs text-[#27628a] underline" target="_blank" rel="noreferrer">
                        View reference
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>

        <Panel title="Dependencies">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Prerequisites</p>
              {prerequisites.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {prerequisites.map((dependency) => (
                    <li key={dependency.id}>
                      <button type="button" className="text-left text-sm text-[#27628a] underline" onClick={() => onTaskSelection(dependency.id)}>
                        {dependency.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No prerequisites</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Dependents</p>
              {dependents.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {dependents.map((dependent) => (
                    <li key={dependent.id}>
                      <button type="button" className="text-left text-sm text-[#27628a] underline" onClick={() => onTaskSelection(dependent.id)}>
                        {dependent.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No downstream tasks</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Documents and activity">
          <div className="space-y-3">
            {task.required_documents.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Required documents</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {task.required_documents.map((doc) => (
                    <li key={doc} className="rounded-lg border border-slate-200 px-2 py-1.5">
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {task.activity.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Recent activity</p>
                <ul className="mt-2 space-y-2">
                  {task.activity.slice(0, 4).map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-slate-200 p-2 text-sm text-slate-700">
                      <p className="font-medium text-[#172b3a]">{entry.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.actor} · {formatDate(entry.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Actions">
          <div className="flex flex-wrap gap-2">
            {task.available_actions.map((action) => (
              <Button
                key={action}
                variant={action === "mark_complete" ? "primary" : "secondary"}
                type="button"
                onClick={() => {
                  if (action === "add_note") {
                    return void onAddNote();
                  }
                  const nextStatusMap: Partial<Record<RoadmapTaskActionId, ApprovalTaskStatus>> = {
                    mark_complete: "completed",
                    mark_in_progress: "in_progress",
                    submit_for_review: "under_review",
                    request_changes: "changes_requested"
                  };
                  const nextStatus = nextStatusMap[action as keyof typeof nextStatusMap];
                  if (nextStatus) {
                    void onUpdateTaskStatus(nextStatus);
                  }
                }}
                disabled={isSaving}
              >
                {action === "mark_complete"
                  ? "Mark complete"
                  : action === "mark_in_progress"
                    ? "Resume task"
                    : action === "submit_for_review"
                      ? "Submit for review"
                      : action === "request_changes"
                        ? "Request changes"
                        : "Add note"}
              </Button>
            ))}
          </div>

          <div className="mt-4">
            <label htmlFor="task-note" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Add note
            </label>
            <textarea
              id="task-note"
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
              placeholder="Capture follow-up actions, clarifications, or contextual notes."
            />
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="primary" onClick={() => void onAddNote()} disabled={isSaving || !noteDraft.trim()}>
                Save note
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </aside>
  );
}

export function RoadmapWorkspaceView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedProjectId = searchParams.get("projectId");
  const [workspace, setWorkspace] = useState<RoadmapWorkspace | null>(null);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(requestedProjectId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApprovalTaskStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | RoadmapNodeType>("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [groupBy, setGroupBy] = useState<"none" | "status" | "type">("status");
  const [noteDraft, setNoteDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const projectData = await getProjects();
        const projectId = requestedProjectId && projectData.some((project) => project.id === requestedProjectId)
          ? requestedProjectId
          : projectData[0]?.id;
        if (!projectId) throw new Error("No projects are available for the roadmap.");
        if (!cancelled) {
          setProjects(projectData);
          setSelectedProjectId(projectId);
        }
        const roadmap = await mockRoadmapApi.getProjectRoadmap(projectId);
        if (!cancelled) {
          setWorkspace(roadmap);
          setSelectedTaskId(roadmap.tasks[0]?.id ?? null);
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError("Unable to load the roadmap workspace. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [requestedProjectId]);

  const selectedTask = useMemo(() => {
    if (!workspace || !selectedTaskId) return null;
    return workspace.tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [workspace, selectedTaskId]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setGroupBy("status");
    setSortBy("due_date");
  };

  const handleTaskUpdate = async (nextStatus: ApprovalTaskStatus) => {
    if (!workspace || !selectedTask) return;
    const shouldContinue = window.confirm(`Update “${selectedTask.title}” to ${statusMeta[nextStatus].label}?`);
    if (!shouldContinue) return;

    try {
      setIsSaving(true);
      if (!selectedProjectId) return;
      const nextWorkspace = await mockRoadmapApi.updateTask(selectedProjectId, selectedTask.id, { status: nextStatus });
      setWorkspace(nextWorkspace);
      setSelectedTaskId(selectedTask.id);
      setNotice(`Task status updated to ${statusMeta[nextStatus].label}.`);
    } catch (updateError) {
      console.error(updateError);
      setNotice("This status change is not permitted for the current task workflow.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!workspace || !selectedTask || !noteDraft.trim()) return;

    try {
      setIsSaving(true);
      if (!selectedProjectId) return;
      const nextWorkspace = await mockRoadmapApi.addTaskNote(selectedProjectId, selectedTask.id, noteDraft.trim());
      setWorkspace(nextWorkspace);
      setNoteDraft("");
      setNotice("Note saved to the roadmap timeline.");
    } catch (addError) {
      console.error(addError);
      setNotice("Unable to save the note right now.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Approval Roadmap" description="Loading the project roadmap and active dependencies…" />
        <Panel>
          <div className="py-10 text-center text-sm text-slate-500">Loading illustrative roadmap data…</div>
        </Panel>
      </AppShell>
    );
  }

  if (error || !workspace) {
    return (
      <AppShell>
        <PageHeader title="Approval Roadmap" description="Illustrative roadmap data for planning and mock workflow testing." />
        <EmptyState
          title="Roadmap unavailable"
          description={error ?? "The roadmap is not available right now."}
          action={<Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Illustrative roadmap data"
          title={workspace.project_name}
          description={`${workspace.location} · The mock service represents illustrative approval activities and dependency relationships only.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Select roadmap project"
                value={selectedProjectId ?? ""}
                onChange={(event) => router.push(`/roadmap?projectId=${encodeURIComponent(event.target.value)}`)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <Button variant={view === "graph" ? "primary" : "secondary"} type="button" onClick={() => setView("graph")}>
                Graph view
              </Button>
              <Button variant={view === "list" ? "primary" : "secondary"} type="button" onClick={() => setView("list")}>
                List view
              </Button>
            </div>
          }
        />

        {notice ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total tasks", value: workspace.summary.total_tasks },
            { label: "Completed", value: workspace.summary.completed_tasks },
            { label: "Pending", value: workspace.summary.pending_tasks },
            { label: "Blocked", value: workspace.summary.blocked_tasks },
            { label: "In progress", value: workspace.summary.in_progress_tasks }
          ].map((metric) => (
            <Panel key={metric.label} className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#172b3a]">{metric.value}</p>
            </Panel>
          ))}
        </div>

        <Panel title="Roadmap summary" action={<span className="text-xs text-slate-500">Updated {formatDate(workspace.summary.last_updated_at)}</span>}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-600">Overall roadmap progress</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-3 w-64 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[#27628a]" style={{ width: `${workspace.summary.overall_progress}%` }} />
                </div>
                <span className="text-lg font-semibold text-[#172b3a]">{workspace.summary.overall_progress}%</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {workspace.summary.next_recommended_actions.map((action) => (
                <StatusBadge key={action} tone="info">
                  {action}
                </StatusBadge>
              ))}
            </div>
          </div>
        </Panel>

        {view === "graph" ? (
          <DependencyGraph workspace={workspace} selectedTaskId={selectedTaskId} onSelectTask={(taskId) => setSelectedTaskId(taskId)} />
        ) : (
          <RoadmapListView
            workspace={workspace}
            selectedTaskId={selectedTaskId}
            onSelectTask={(taskId) => setSelectedTaskId(taskId)}
            search={search}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            sortBy={sortBy}
            setSearch={setSearch}
            setStatusFilter={setStatusFilter}
            setTypeFilter={setTypeFilter}
            setSortBy={setSortBy}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            clearFilters={clearFilters}
          />
        )}
      </div>

      {selectedTask ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30"
            onClick={() => setSelectedTaskId(null)}
            onKeyDown={(e) => { if (e.key === 'Escape') setSelectedTaskId(null); }}
            role="button"
            tabIndex={-1}
            aria-label="Close task details"
          />
          <TaskDetailDrawer
            task={selectedTask}
            projectName={workspace.project_name}
            workspace={workspace}
            onClose={() => setSelectedTaskId(null)}
            onTaskSelection={(taskId) => setSelectedTaskId(taskId)}
            onUpdateTaskStatus={handleTaskUpdate}
            onAddNote={handleAddNote}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            isSaving={isSaving}
          />
        </>
      ) : null}
    </AppShell>
  );
}
