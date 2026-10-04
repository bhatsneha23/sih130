import { OfficerWorkspace } from "@/components/officer-workspace";
import { Suspense } from "react";

export default function OfficerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfficerWorkspace mode="queue" />
    </Suspense>
  );
}