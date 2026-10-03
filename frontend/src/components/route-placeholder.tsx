import { Button, PageHeader, Panel } from "@/components/ui";

export function RoutePlaceholder({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeader
        eyebrow="IndusAI workspace"
        title={title}
        description={description}
        actions={<Button variant="secondary">Open quick actions</Button>}
      />

      <Panel title="Illustrative workspace view" className="max-w-3xl">
        <p className="text-sm leading-7 text-slate-600">
          This section is intentionally kept minimal as a route placeholder for the next
          feature phase. The shell, design tokens, responsive layout, and mock service layer
          are in place so future product surfaces can be added without rewriting the base UI.
        </p>
        <div className="mt-5 flex gap-3">
          <Button>Review backlog</Button>
          <Button variant="secondary">View guidance</Button>
        </div>
      </Panel>
    </>
  );
}
