import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileSearch, Library, Building2, Activity, Gauge, ShieldCheck, Sparkles, RotateCcw, ChevronLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDemo } from "@/lib/store";
import { AIAssistant } from "./AIAssistant";
import { Button } from "@/components/ui/button";


const nav = [
  { to: "/", label: "Home / My Work", icon: Home },
  { to: "/requests", label: "Active Requests", icon: FileSearch },
  { to: "/contracts", label: "Contract & Document Intelligence", icon: Library },
  { to: "/vendors", label: "Supplier / Vendor Intelligence", icon: Building2 },
  { to: "/monitoring", label: "Execution Monitoring", icon: Activity },
  { to: "/control-tower", label: "Value Protection Command Center", icon: Gauge },
  { to: "/governance", label: "Knowledge & Governance", icon: ShieldCheck },
];

function readCollapsed() {
  try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
}

function writeCollapsed(value: boolean) {
  try { localStorage.setItem("sidebar-collapsed", String(value)); } catch { }
}

export function AppLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state, resetDemo } = useDemo();
  const [aiOpen, setAiOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const openTasks = state.klydoTasks.filter((t) => t.status === "Open" || t.status === "In Review").length;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      writeCollapsed(!prev);
      return !prev;
    });
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      {/* Collapse toggle — outside aside so overflow-x-hidden doesn't cap its z-index */}
      <button
        onClick={toggleCollapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`hidden md:flex absolute top-[73px] z-50 h-6 w-6 rounded-full border border-border shadow-sm items-center justify-center text-muted-foreground hover:text-foreground transition-[left] duration-200 ${collapsed ? "left-[44px]" : "left-[244px]"}`}
        style={{ backgroundColor: 'white' }}
      >
        <ChevronLeft className={`h-3 w-3 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
      </button>

      <aside className={`hidden md:flex shrink-0 flex-col bg-sidebar text-sidebar-foreground overflow-x-hidden transition-[width] duration-200 ${collapsed ? "w-14" : "w-64"}`}>

        {/* Logo / brand */}
        <div className="px-3 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-accent2 grid place-items-center text-sidebar font-bold shrink-0">CI</div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-sm font-semibold leading-tight whitespace-nowrap">Source-to-Contract Intelligence</div>
                <div className="text-[10px] text-sidebar-foreground/60 whitespace-nowrap">Source-to-Procure workspace</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                title={collapsed ? n.label : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition ${active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-accent2"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/85"
                  }`}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="leading-tight truncate">{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 text-[11px] text-sidebar-foreground/60">
          {collapsed ? (
            <button onClick={resetDemo} title="Reset demo state" className="flex justify-center w-full hover:text-sidebar-foreground">
              <RotateCcw className="h-3 w-3" />
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Klydo open</span>
                <span className="rounded bg-accent2/20 text-accent2 px-1.5 py-0.5 font-medium">{openTasks}</span>
              </div>
              <button onClick={resetDemo} className="flex items-center gap-1 hover:text-sidebar-foreground">
                <RotateCcw className="h-3 w-3" /> Reset demo state
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {logoError ? (
                <div className="h-10 px-3 rounded-sm border border-border bg-white shrink-0 grid place-items-center text-sm font-bold tracking-tight text-foreground">
                  CITGO
                </div>
              ) : (
                <img
                  src="/citgo-logo.png"
                  alt="CITGO"
                  onError={() => setLogoError(true)}
                  className="h-10 w-auto rounded-sm shrink-0 border border-border bg-white p-1"
                />
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex text-[10px] uppercase tracking-wider rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
                Source-to-Contract Intelligence · Klydo Workflow · Governance · AI Assistant
              </span>
              <Button onClick={() => setAiOpen((v) => !v)} variant={aiOpen ? "default" : "outline"} size="sm" className="gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Assistant
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6 max-w-[1400px] w-full">{children}</main>
      </div>

      <AIAssistant open={aiOpen} onClose={() => setAiOpen(false)} screenPath={path} />
    </div>
  );
}
