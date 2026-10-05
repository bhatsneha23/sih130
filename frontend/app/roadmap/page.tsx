import { Suspense } from "react";
import { RoadmapWorkspaceView } from "@/components/roadmap";

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoadmapWorkspaceView />
    </Suspense>
  );
}