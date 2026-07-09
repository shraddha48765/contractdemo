import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/control-tower")({
  head: () => ({ meta: [{ title: "Control Tower — Contract Intelligence" }] }),
  component: ControlTower,
});

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

const VALUE_PROTECTION: { area: string; amount: string; status: string }[] = [
  { area: "Source-to-procure avoided exposure", amount: "$122K", status: "Modeled" },
  { area: "Procure-to-pay exceptions", amount: "$30.6K", status: "In Review" },
  { area: "SLA/service credit opportunity", amount: "$42K", status: "Review Triggered" },
  { area: "Total modeled value under control", amount: "$194.6K", status: "Portfolio Rollup" },
];

const WORKLOAD: { metric: string; count: string; notes: string }[] = [
  { metric: "Contracts under review this quarter", count: "100+", notes: "Demo workload context" },
  { metric: "RFXs / sourcing events under review this quarter", count: "250", notes: "Demo workload context" },
  { metric: "Renewal windows under 120 days", count: "6", notes: "Needs review" },
  { metric: "High-risk service packages", count: "4", notes: "Requires governance attention" },
];

const ALERTS: { alert: string; owner: string; status: string }[] = [
  { alert: "Apex invoice-rate variance requires Finance review", owner: "Finance / Cost Control", status: "Open" },
  { alert: "SLA service credit review triggered", owner: "Contract Owner", status: "Review Required" },
  { alert: "Renewal risk window approaching for 4 contracts", owner: "Vendor Manager", status: "In Progress" },
  { alert: "RFP trigger review pending for 6 sourcing events", owner: "Procurement Manager", status: "Pending" },
];

function ControlTower() {
  return (
    <AppLayout
      title="Control Tower"
      subtitle="Portfolio visibility across source-to-contract decisions, execution exceptions, value protection, and renewal risk."
    >
      <div className="mb-4">
        <span className="inline-block text-[11px] font-medium rounded-full border border-accent2/40 bg-accent2/10 text-accent2 px-2 py-0.5">
          Modeled demo metrics
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="text-lg font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <Section title="Portfolio Value Protection">
        <SimpleTable
          headers={["Value Area", "Amount", "Status"]}
          rows={VALUE_PROTECTION.map((r) => [r.area, r.amount, r.status])}
        />
      </Section>

      <Section title="Portfolio Workload">
        <SimpleTable
          headers={["Metric", "Count", "Notes"]}
          rows={WORKLOAD.map((r) => [r.metric, r.count, r.notes])}
        />
      </Section>

      <Section title="Top Portfolio Alerts">
        <SimpleTable
          headers={["Alert", "Owner", "Status"]}
          rows={ALERTS.map((r) => [r.alert, r.owner, r.status])}
        />
      </Section>

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
