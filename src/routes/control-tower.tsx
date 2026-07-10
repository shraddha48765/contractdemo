import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/control-tower")({
  head: () => ({ meta: [{ title: "Value Protection Command Center — Contract Intelligence" }] }),
  component: ControlTower,
});

type FilterKey =
  | "all"
  | "active-requests"
  | "active-contracts"
  | "renewal-risk"
  | "exceptions"
  | "closed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Portfolio" },
  { key: "active-requests", label: "Active Requests" },
  { key: "active-contracts", label: "Active Contracts" },
  { key: "renewal-risk", label: "Renewal Risk" },
  { key: "exceptions", label: "Exceptions" },
  { key: "closed", label: "Closed / Completed" },
];

const FILTER_SUMMARY: Record<FilterKey, string> = {
  "all": "Showing all portfolio items across requests, active contracts, renewal risks, exceptions, and completed records.",
  "active-requests": "Showing pre-signature sourcing and contract package work requiring buyer or manager action.",
  "active-contracts": "Showing signed contracts under execution monitoring.",
  "renewal-risk": "Showing contracts approaching renewal review windows or requiring commercial reassessment.",
  "exceptions": "Showing contracts with invoice, SLA, reconciliation, or governance exceptions.",
  "closed": "Showing completed or closed records available for reference and benchmarking.",
};

const KPIS: { label: string; value: string }[] = [
  { label: "Active Contract Value", value: "$18.7M" },
  { label: "Value Under Control", value: "$194.6K Modeled" },
  { label: "Source-to-Contract Cycle Opportunity", value: "100 days → 60-day target" },
  { label: "Active Sourcing Decisions", value: "18" },
  { label: "RFP Trigger Reviews", value: "6" },
  { label: "Contract Packages Generated", value: "12" },
  { label: "Invoice Exceptions Flagged", value: "$18.6K" },
  { label: "Reconciliation Exposure", value: "$42K" },
  { label: "Renewal Risk Contracts", value: "4" },
  { label: "Overdue Klydo Actions", value: "7" },
];

const VALUE_PROTECTION = [
  { area: "Source-to-procure avoided exposure", amount: "$122K", status: "Modeled" },
  { area: "Procure-to-pay exceptions", amount: "$30.6K", status: "In Review" },
  { area: "SLA/service credit opportunity", amount: "$42K", status: "Review Triggered" },
  { area: "Total modeled value under control", amount: "$194.6K", status: "Portfolio Rollup" },
];

const WORKLOAD = [
  { metric: "Contracts under review this quarter", count: "100+", notes: "Demo workload context" },
  { metric: "RFXs / sourcing events under review this quarter", count: "250", notes: "Demo workload context" },
  { metric: "Renewal windows under 120 days", count: "6", notes: "Needs review" },
  { metric: "High-risk service packages", count: "4", notes: "Requires governance attention" },
];

const ALERTS: { alert: string; owner: string; status: string; action: string }[] = [
  { alert: "Apex invoice-rate variance requires Finance review", owner: "Finance / Cost Control", status: "Open", action: "View Monitoring" },
  { alert: "SLA service credit review triggered", owner: "Contract Owner", status: "Review Required", action: "Review SLA" },
  { alert: "Renewal risk window approaching for 4 contracts", owner: "Vendor Manager", status: "In Progress", action: "Review Renewal" },
  { alert: "RFP trigger review pending for 6 sourcing events", owner: "Procurement Manager", status: "Pending", action: "View Requests" },
];

type Status = "Active Request" | "Active Contract" | "Renewal Risk" | "Exception" | "Closed / Completed";
type Risk = "High" | "Medium" | "Low";

const PORTFOLIO: {
  name: string;
  vendor: string;
  status: Status;
  category: string;
  value: string;
  risk: Risk;
  vuc: string;
  action: string;
  href?: string;
}[] = [
  { name: "Industrial Maintenance Services Renewal – 2026", vendor: "Apex Industrial Services", status: "Active Request", category: "Industrial Maintenance Services", value: "$2.4M", risk: "Medium", vuc: "$194.6K", action: "Open Request", href: "/requests/ind-maint-sow" },
  { name: "Boiler Inspection Services SOW", vendor: "Northstar Maintenance Group", status: "Active Contract", category: "High-Risk Services", value: "$1.1M", risk: "High", vuc: "$62K", action: "View Monitoring", href: "/monitoring" },
  { name: "Pump Repair Materials Agreement", vendor: "Elevate Field Services", status: "Renewal Risk", category: "Material Supply", value: "$850K", risk: "Medium", vuc: "$21K", action: "Review Renewal" },
  { name: "Tank Cleaning Services SOW", vendor: "Apex Industrial Services", status: "Exception", category: "Industrial Services", value: "$1.8M", risk: "High", vuc: "$38K", action: "View Exception" },
  { name: "Compressor Maintenance MSA", vendor: "Premier Mechanical Partners", status: "Active Contract", category: "Industrial Maintenance Services", value: "$3.2M", risk: "Medium", vuc: "$44K", action: "View Monitoring", href: "/monitoring" },
  { name: "Safety Equipment Supply Agreement", vendor: "Gulf Materials Supply", status: "Closed / Completed", category: "Material Supply", value: "$620K", risk: "Low", vuc: "$9K", action: "View Record" },
];

const STATUS_FOR_FILTER: Record<Exclude<FilterKey, "all">, Status> = {
  "active-requests": "Active Request",
  "active-contracts": "Active Contract",
  "renewal-risk": "Renewal Risk",
  "exceptions": "Exception",
  "closed": "Closed / Completed",
};

function statusChip(status: Status) {
  const map: Record<Status, string> = {
    "Active Request": "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    "Active Contract": "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    "Renewal Risk": "bg-amber-500/15 text-amber-600 border border-amber-500/30",
    "Exception": "bg-red-500/15 text-red-600 border border-red-500/30",
    "Closed / Completed": "bg-muted text-muted-foreground border border-border",
  };
  return `inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status]}`;
}

function riskChip(risk: Risk) {
  const map: Record<Risk, string> = {
    High: "bg-red-500/15 text-red-600 border border-red-500/30",
    Medium: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
    Low: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  };
  return `inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${map[risk]}`;
}

function ControlTower() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows =
    filter === "all"
      ? PORTFOLIO
      : PORTFOLIO.filter((r) => r.status === STATUS_FOR_FILTER[filter]);

  return (
    <AppLayout
      title="Value Protection Command Center"
      subtitle="Portfolio visibility across source-to-contract decisions, execution exceptions, value protection, and renewal risk. Target: 7% modeled value protection per contract."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-block text-[11px] font-medium rounded-full border border-accent2/40 bg-accent2/10 text-accent2 px-2 py-0.5">
          Modeled demo metrics
        </span>
        <span className="inline-block text-[11px] font-medium rounded-full border border-success/40 bg-success/10 text-success px-2 py-0.5">
          7% modeled value protection target per contract
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="text-lg font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Portfolio View filter */}
      <div className="rounded-xl border bg-card p-4 mb-5">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold">Portfolio View</div>
            <div className="text-xs text-muted-foreground">Filter the portfolio detail table below.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  active
                    ? "bg-accent2 text-white border-accent2"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <Section title="Portfolio Value Protection">
        <SimpleTable
          headers={["Value Area", "Amount", "Status"]}
          rows={VALUE_PROTECTION.map((r) => [r.area, r.amount, r.status])}
        />
      </Section>

      {/* Filter summary strip */}
      <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-2.5 mb-3 text-xs text-muted-foreground">
        {FILTER_SUMMARY[filter]}
      </div>

      {/* Portfolio Detail */}
      <div className="rounded-xl border bg-card overflow-hidden mb-5">
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Portfolio Detail</div>
          <div className="text-xs text-muted-foreground">Drill into active requests, signed contracts, renewal risks, and execution exceptions.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                {["Request / Contract", "Vendor", "Status", "Category", "Value", "Risk", "Value Under Control", "Next Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-xs text-muted-foreground">No items in this view.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.name} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-xs">{r.vendor}</td>
                  <td className="px-4 py-3"><span className={statusChip(r.status)}>{r.status}</span></td>
                  <td className="px-4 py-3 text-xs">{r.category}</td>
                  <td className="px-4 py-3 text-xs">{r.value}</td>
                  <td className="px-4 py-3"><span className={riskChip(r.risk)}>{r.risk}</span></td>
                  <td className="px-4 py-3 text-xs">{r.vuc}</td>
                  <td className="px-4 py-3">
                    {r.href ? (
                      <Link to={r.href} className="text-xs font-medium px-2.5 py-1 rounded-md border border-accent2/40 bg-accent2/10 text-accent2 hover:bg-accent2/20">
                        {r.action}
                      </Link>
                    ) : (
                      <button className="text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-foreground">
                        {r.action}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Section title="Portfolio Workload">
        <SimpleTable
          headers={["Metric", "Count", "Notes"]}
          rows={WORKLOAD.map((r) => [r.metric, r.count, r.notes])}
        />
      </Section>

      {/* Top Portfolio Alerts */}
      <div className="rounded-xl border bg-card overflow-hidden mb-5">
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Top Portfolio Alerts</div>
          <div className="text-xs text-muted-foreground">Highest-priority items requiring owner attention.</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              {["Alert", "Owner", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALERTS.map((a) => {
              const href =
                a.action === "View Monitoring" ? "/monitoring" :
                a.action === "View Requests" ? "/requests" : undefined;
              return (
                <tr key={a.alert} className="border-t">
                  <td className="px-4 py-3 text-xs">{a.alert}</td>
                  <td className="px-4 py-3 text-xs">{a.owner}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="inline-block rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium">{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {href ? (
                      <Link to={href} className="text-xs font-medium px-2.5 py-1 rounded-md border border-accent2/40 bg-accent2/10 text-accent2 hover:bg-accent2/20">
                        {a.action}
                      </Link>
                    ) : (
                      <button className="text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted">
                        {a.action}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground mt-6">
        Portfolio metrics are modeled for demo purposes. Production values would calculate from approved contract terms,
        sourcing events, invoices, supplier performance records, and governed benchmark sources.
      </p>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden mb-5">
      <div className="px-4 py-3 border-b text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/60 text-xs text-muted-foreground">
        <tr>
          {headers.map((h) => (
            <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-xs">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
