export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">IndusAI</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The route you requested does not exist in this demo prototype.</p>
      </div>
    </div>
  );
}
