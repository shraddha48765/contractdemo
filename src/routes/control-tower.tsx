import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { portfolioContracts } from "@/lib/mock-data";
import { TrendingDown, AlertCircle, Clock, Activity, DollarSign, Wrench, FileWarning } from "lucide-react";

export const Route = createFileRoute("/control-tower")({
  head: () => ({ meta: [{ title: "Control Tower — Contract Intelligence" }] }),
  component: ControlTower,
});

function ControlTower() {
  const { state } = useDemo();
  const k = state.kpis;
  return (
    <AppLayout title="Control Tower" subtitle="Portfolio-level command center across contracts.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi icon={<DollarSign className="h-4 w-4" />} label="Active contract value" value={k.totalActiveValue} />
        <Kpi icon={<TrendingDown className="h-4 w-4" />} label="Leakage exposure" value={`$${(k.leakageExposure/1000).toFixed(0)}K`} tone="risk" />
        <Kpi icon={<AlertCircle className="h-4 w-4" />} label="Open exceptions" value={k.openExceptions} tone="warning" />
        <Kpi icon={<Clock className="h-4 w-4" />} label="Renewals <120 days" value={k.renewals120} />
        <Kpi icon={<Activity className="h-4 w-4" />} label="SLA-risk contracts" value={k.slaRiskContracts} tone="warning" />
        <Kpi icon={<FileWarning className="h-4 w-4" />} label="Invoice overbilling flags" value={k.invoiceFlags} tone="risk" />
        <Kpi icon={<Wrench className="h-4 w-4" />} label="Change orders pending" value={k.changeOrdersPending} />
        <Kpi icon={<AlertCircle className="h-4 w-4" />} label="Overdue Klydo actions" value={k.overdueKlydo} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <BarCard title="Leakage by category" data={[
          { label: "Industrial Maintenance", v: 95 },
          { label: "Electrical", v: 72 },
          { label: "HVAC / Facilities", v: 54 },
          { label: "Inspection", v: 38 },
          { label: "Other", v: 26 },
        ]} />
        <BarCard title="Exceptions by status" data={[
          { label: "Open", v: 70 },
          { label: "In Review", v: 45 },
          { label: "Overdue", v: 30 },
          { label: "Resolved", v: 22 },
        ]} />
        <BarCard title="Vendor risk ranking" data={[
          { label: "VoltLine Services", v: 88 },
          { label: "Elevate Field Services", v: 71 },
          { label: "Northstar", v: 58 },
          { label: "EcoHandling", v: 49 },
          { label: "Apex", v: 22 },
        ]} />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Portfolio contracts</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Contract</th>
              <th className="text-left px-4 py-2.5 font-medium">Vendor</th>
              <th className="text-left px-4 py-2.5 font-medium">Category</th>
              <th className="text-left px-4 py-2.5 font-medium">Value</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {portfolioContracts.map((c) => (
              <tr key={c.id} className={`border-t ${c.id === "apex-sow" && state.invoiceUploaded ? "bg-risk/5" : ""}`}>
                <td className="px-4 py-3">
                  <div className="font-medium">{c.name}</div>
                  {c.id === "apex-sow" && state.invoiceUploaded && (
                    <div className="text-[11px] text-risk mt-0.5">Includes $12,480 leakage exception from INV-1842</div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{c.vendor}</td>
                <td className="px-4 py-3 text-xs">{c.category}</td>
                <td className="px-4 py-3 text-xs">{c.value}</td>
                <td className="px-4 py-3 text-xs">{c.status}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${
                    c.risk === "High" ? "bg-risk/15 text-risk" : c.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                  }`}>{c.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone?: "warning" | "risk" }) {
  const cls = tone === "risk" ? "text-risk" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">{icon} {label}</div>
      <div className={`text-2xl font-semibold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}

function BarCard({ title, data }: { title: string; data: { label: string; v: number }[] }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="text-xs">
            <div className="flex justify-between mb-0.5"><span>{d.label}</span><span className="text-muted-foreground">{d.v}</span></div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-accent2 rounded-full" style={{ width: `${(d.v / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
