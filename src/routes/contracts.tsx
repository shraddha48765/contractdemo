import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { sourceArtifacts } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { SourceChip } from "@/components/SourceChip";
import { Search, Filter } from "lucide-react";

export const Route = createFileRoute("/contracts")({
  head: () => ({ meta: [{ title: "Contract & Document Intelligence" }] }),
  component: ContractDocIntel,
});

const categories = [
  "SOWs", "Rate Cards", "Invoices", "Purchase Orders", "SLA Logs",
  "Change Orders", "Compliance Documents", "Vendor Redlines", "Certifications", "Renewal Records",
];

function ContractDocIntel() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const all = Object.values(sourceArtifacts);

  const filtered = useMemo(() => all.filter((a) => {
    if (cat && a.category !== cat) return false;
    if (q && !(`${a.name} ${a.category} ${a.linkedVendor ?? ""}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, cat, all]);

  return (
    <AppLayout title="Contract & Document Intelligence" subtitle="From flat contract documents to structured sourcing intelligence.">
      <div className="rounded-xl border bg-card p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search contracts, vendors, artifacts…"
              className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Filters:</div>
          <select onChange={(e) => setCat(e.target.value || null)} className="rounded-md border bg-background px-2 py-1.5 text-xs">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="rounded-md border bg-background px-2 py-1.5 text-xs">
            <option>All vendors</option>
            <option>Apex Industrial Services</option>
            <option>Northstar Maintenance Group</option>
          </select>
          <select className="rounded-md border bg-background px-2 py-1.5 text-xs">
            <option>All statuses</option>
            <option>Approved</option>
            <option>Pending Legal Review</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-muted-foreground uppercase tracking-wide">Try:</span>
          {[
            "Show rate escalation clauses for maintenance services",
            "Which contracts have change-order exposure?",
            "Find WRBS/tax cap reconciliation terms",
            "Show supplier redline history for service credits",
          ].map((s) => (
            <button key={s} onClick={() => setQ(s)} className="rounded border px-2 py-0.5 hover:bg-accent">{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        {categories.map((c) => {
          const count = all.filter((a) => a.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCat(cat === c ? null : c)}
              className={`rounded-lg border p-3 text-left transition ${cat === c ? "border-accent2 bg-accent2/5" : "bg-card hover:border-accent2/40"}`}
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{c}</div>
              <div className="text-lg font-semibold mt-0.5">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-semibold">Records ({filtered.length})</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Artifact</th>
                <th className="text-left px-4 py-2.5 font-medium">Category</th>
                <th className="text-left px-4 py-2.5 font-medium">Vendor</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2.5"><SourceChip id={a.id} /></td>
                  <td className="px-4 py-2.5 text-xs">{a.category}</td>
                  <td className="px-4 py-2.5 text-xs">{a.linkedVendor ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs">{a.governanceStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <RelationshipMap />
      </div>
    </AppLayout>
  );
}

function RelationshipMap() {
  // Simple SVG node-link map centered on Apex SOW
  const center = { x: 200, y: 200, label: "Apex Industrial Maintenance SOW", id: "signed-sow" };
  const nodes = [
    { x: 200, y: 30, label: "Preamble", id: "preamble" },
    { x: 320, y: 55, label: "Exhibit A-1", id: "exhibit-a1" },
    { x: 380, y: 130, label: "Exhibit B-1", id: "exhibit-b1" },
    { x: 385, y: 210, label: "Exhibit C", id: "exhibit-c" },
    { x: 360, y: 290, label: "Exhibit C-1 / WRBS", id: "exhibit-c1" },
    { x: 290, y: 350, label: "Exhibit D", id: "exhibit-d" },
    { x: 200, y: 375, label: "Exhibit E", id: "exhibit-e" },
    { x: 110, y: 350, label: "Exhibit G", id: "exhibit-g" },
    { x: 40, y: 290, label: "Invoice INV-1842", id: "invoice-1842" },
    { x: 15, y: 210, label: "SLA Logs", id: "sla-logs" },
    { x: 20, y: 130, label: "Prior CO", id: "prior-change-order" },
    { x: 80, y: 55, label: "Renewal Record", id: "renewal-record" },
  ];

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-semibold mb-2">Relationship map</h3>
      <p className="text-xs text-muted-foreground mb-3">How the Apex SOW connects to governed artifacts.</p>
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        {nodes.map((n) => (
          <line key={`l-${n.id}`} x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke="currentColor" className="text-border" strokeWidth={1} />
        ))}
        <g>
          <circle cx={center.x} cy={center.y} r={36} className="fill-accent2/15 stroke-accent2" strokeWidth={1.5} />
          <text x={center.x} y={center.y - 2} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">Apex SOW</text>
          <text x={center.x} y={center.y + 10} textAnchor="middle" className="fill-muted-foreground text-[8px]">2026–2029</text>
        </g>
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={6} className="fill-card stroke-accent2" strokeWidth={1.5} />
            <text x={n.x} y={n.y - 10} textAnchor="middle" className="fill-foreground text-[9px]">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
