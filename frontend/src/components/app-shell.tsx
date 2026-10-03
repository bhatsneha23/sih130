"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { getStoredDemoRole, setStoredDemoRole, getRoleLabel, getRoleUser, DEMO_ROLE_OPTIONS, type DemoRole } from "@/lib/demo-role";
import { getVisibleNavItems } from "@/lib/mock-permissions";

function Sidebar({
  isMobileOpen,
  onClose,
  currentRole,
  onRoleChange
}: {
  isMobileOpen: boolean;
  onClose: () => void;
  currentRole: DemoRole;
  onRoleChange: (role: DemoRole) => void;
}) {
  const pathname = usePathname();
  const navItems = getVisibleNavItems(currentRole);

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-[#172b3a] text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
            IndusAI
          </p>
          <h2 className="mt-1 text-lg font-semibold">Operations</h2>
        </div>
        <Button variant="ghost" className="text-slate-200 lg:hidden" onClick={onClose}>
          Close
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#edf5fa] text-[#172b3a] shadow-sm"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              ].join(" ")}
              onClick={onClose}
            >
              <span>{item.label}</span>
              <span className="rounded-full border border-current/30 px-1.5 text-[10px] uppercase tracking-[0.14em] opacity-70">
                {item.href === "/" ? "home" : "nav"}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-sky-200">Current role</p>
          <div className="flex flex-col gap-1">
            {DEMO_ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  onClose();
                }}
                className={[
                  "text-left rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  currentRole === role
                    ? "bg-[#edf5fa] text-[#172b3a]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {getRoleLabel(role)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<DemoRole>("Applicant");

  useEffect(() => {
    setCurrentRole(getStoredDemoRole());
  }, []);

  const handleRoleChange = (role: DemoRole) => {
    setCurrentRole(role);
    setStoredDemoRole(role);
  };

  const user = getRoleUser(currentRole);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#172b3a]">
      <div className="flex min-h-screen">
        <Sidebar 
          isMobileOpen={mobileNavOpen} 
          onClose={() => setMobileNavOpen(false)} 
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="rounded-xl p-2 lg:hidden"
                  aria-label="Open navigation menu"
                  onClick={() => setMobileNavOpen(true)}
                >
                  ☰
                </Button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#27628a]">
                    Industrial approvals
                  </p>
                  <p className="text-sm text-slate-600">Compliance intelligence workspace</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-full border border-slate-200 bg-slate-50 p-2 text-sm font-medium text-[#172b3a]"
                >
                  🔔
                  <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#27628a]" />
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf5fa] text-xs font-semibold text-[#27628a]">
                    {user.avatar}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium text-[#172b3a]">{user.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{currentRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/45 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
    </div>
  );
}
