import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { KlydoTaskCard } from "@/components/KlydoTaskCard";
import { ArrowRight, CheckCircle2, AlertCircle, Clock3, Inbox } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home / My Work — Contract Intelligence" },
      { name: "description", content: "Personalized procurement work queue for the Contract Intelligence workspace." },
    ],
  }),
  component: Home,
});

function Home() {
  const { state } = useDemo();
  const myTasks = state.klydoTasks.filter((t) => t.owner === "Procurement Buyer");
  const actionsWaiting = myTasks.filter((t) => t.status === "Open");
  const approvalsWaiting = state.klydoTasks.filter((t) => t.type === "Approval" && t.status === "Pending");
  const exceptions = state.klydoTasks.filter((t) => t.type === "Exception");
  const overdue = state.klydoTasks.filter((t) => t.status === "Overdue");
  const waitingOnOthers = state.klydoTasks.filter((t) => t.owner !== "Procurement Buyer" && t.status !== "Completed" && t.status !== "Resolved" && t.status !== "Approved");

  return (
    <AppLayout title="Home / My Work" subtitle="Source-to-Contract Intelligence Workspace — your governed procurement queue.">
      <NewRequestReceived />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Inbox className="h-4 w-4" />} label="Actions waiting on me" value={actionsWaiting.length} tone="brand" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Approvals waiting on me" value={approvalsWaiting.length} tone="warning" />
        <StatCard icon={<AlertCircle className="h-4 w-4" />} label="Exceptions waiting on me" value={exceptions.length} tone="risk" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="My Priority Actions" count={actionsWaiting.length}>
          <div className="space-y-2">
            {actionsWaiting.length === 0 && <Empty text="No open actions." />}
            {actionsWaiting.map((t) => <KlydoTaskCard key={t.id} task={t} />)}
          </div>
        </Section>

        <Section title="My Exception Queue" count={exceptions.length}>
          <div className="space-y-2">
            {exceptions.length === 0 && <Empty text="No exceptions assigned." />}
            {exceptions.map((t) => <KlydoTaskCard key={t.id} task={t} compact />)}
          </div>
        </Section>

        <Section title="Overdue Items" count={overdue.length}>
          <div className="space-y-2">
            {overdue.length === 0 && <Empty text="Nothing overdue." />}
            {overdue.map((t) => <KlydoTaskCard key={t.id} task={t} compact />)}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <Section title="Requests I'm Involved In" count={1}>
          <Link to="/requests/$id" params={{ id: "ind-maint-sow" }} className="block rounded-lg border bg-card p-4 hover:border-accent2/50 transition group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Sourcing · SOW · 3-year</div>
                <div className="text-sm font-semibold mt-0.5">Industrial Maintenance Services SOW</div>
                <div className="text-xs text-muted-foreground mt-1">$2.4M est. · Operations Manager (requester) · Stage: Supplier Review</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent2 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </Section>

        <Section title="Requests I Own Waiting on Others" count={waitingOnOthers.length}>
          <div className="space-y-2">
            {waitingOnOthers.slice(0, 4).map((t) => <KlydoTaskCard key={t.id} task={t} compact />)}
          </div>
        </Section>
      </div>

      <Section title="Recent Activity" className="mt-5">
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex items-center gap-2"><Clock3 className="h-3 w-3" /> System opened renewal review window for Emergency Generator Maintenance SOW</li>
          <li className="flex items-center gap-2"><Clock3 className="h-3 w-3" /> Klydo created supplier-confirmation task on Industrial Maintenance Services SOW</li>
          <li className="flex items-center gap-2"><Clock3 className="h-3 w-3" /> Apex submitted Materials Pass-Through Confirmation</li>
        </ul>
      </Section>
    </AppLayout>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "brand" | "warning" | "risk" }) {
  const toneCls = tone === "brand" ? "bg-accent2/15 text-accent2" : tone === "warning" ? "bg-warning/15 text-warning" : "bg-risk/15 text-risk";
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg grid place-items-center ${toneCls}`}>{icon}</div>
      <div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Section({ title, count, children, className = "" }: { title: string; count?: number; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{count}</span>}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground py-2">{text}</div>;
}

function NewRequestReceived() {
  return (
    <div className="rounded-xl border border-accent2/40 bg-accent2/5 p-4 mb-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider rounded-full bg-accent2/20 text-accent2 px-2 py-0.5 font-semibold">New Request Received</span>
            <span className="text-[11px] text-muted-foreground">REQ-IMS-2026-014</span>
          </div>
          <h2 className="text-base font-semibold mt-1.5">Industrial Maintenance Services Renewal – 2026</h2>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 mt-3 text-xs">
            <div><dt className="text-muted-foreground">Requester</dt><dd>Operations Manager</dd></div>
            <div><dt className="text-muted-foreground">Category</dt><dd>Industrial Maintenance Services</dd></div>
            <div><dt className="text-muted-foreground">Procurement Type</dt><dd>Service + Materials Pass-through</dd></div>
            <div><dt className="text-muted-foreground">Estimated Value</dt><dd>$2.4M / 3 years</dd></div>
            <div><dt className="text-muted-foreground">Incumbent Vendor</dt><dd>Apex Industrial Services</dd></div>
            <div><dt className="text-muted-foreground">Trigger</dt><dd>120-day renewal review window</dd></div>
          </dl>
          <p className="text-[11px] text-muted-foreground mt-2">Initial Klydo action: Apply sourcing blueprint</p>
        </div>
        <Link
          to="/requests/$id"
          params={{ id: "ind-maint-sow" }}
          className="inline-flex items-center gap-1 rounded-md bg-accent2 text-white text-xs font-medium px-3 py-2 hover:opacity-90 transition self-start"
        >
          Open Active Request <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
