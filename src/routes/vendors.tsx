import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { vendors } from "@/lib/mock-data";
import { SourceChip } from "@/components/SourceChip";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Supplier / Vendor Intelligence" }] }),
  component: VendorIntel,
});

function VendorIntel() {
  return (
    <AppLayout title="Vendor 360 + Governed Market Discovery" subtitle="Vendor 360 · Market Discovery · Competitive Benchmarking">
      <div className="rounded-xl border border-accent2/30 bg-accent2/5 p-3 mb-3 text-[11px] text-foreground">
        <span className="font-semibold text-accent2">Governance:</span> Market references are sourced from approved internal/external sources and require buyer validation before use in sourcing decisions.
      </div>
      <div className="rounded-xl border bg-card p-4 mb-4">
        <input
          placeholder="Search vendors, categories, certifications, benchmark references, rate signals, and market intelligence"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
          {["Internal supplier history","Prior contract benchmark","Approved market benchmark","HSSE / ISNetworld status","Insurance record","Public supplier profile","Buyer-approved reference"].map((c) => (
            <span key={c} className="rounded bg-muted px-1.5 py-0.5">{c}</span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">External / vendor-published data is not internally verified until buyer validation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {vendors.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent2/15 grid place-items-center text-accent2"><Building2 className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-semibold">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.category} · {v.contractsServed} contracts</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Risk score</div>
                <div className={`text-lg font-semibold ${v.riskScore < 35 ? "text-success" : v.riskScore < 65 ? "text-warning" : "text-risk"}`}>{v.riskScore}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <KV label="Emergency response" value={v.emergencyResponse} />
              <KV label="Completion" value={v.completionRate} />
              <KV label="Compliance" value={v.compliance} />
              <KV label="Transition risk" value={v.transitionRisk} />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{v.benchmarkPosition}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {v.sources.map((s) => <SourceChip key={s} id={s} />)}
            </div>
            {v.id === "elevate" && (
              <div className="mt-2 text-[10px] rounded bg-muted px-1.5 py-0.5 inline-block text-muted-foreground">External / Vendor-Published data — not internally verified</div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button className="text-[11px] rounded-md border px-2 py-1 hover:bg-accent">Add to Supplier Shortlist</button>
              <button className="text-[11px] rounded-md border px-2 py-1 hover:bg-accent">Compare Against Incumbent</button>
              <button className="text-[11px] rounded-md border px-2 py-1 hover:bg-accent">Request Sourcing Validation</button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">External market references are governed by approved data sources and buyer validation.</p>
    </AppLayout>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium mt-0.5">{value}</div>
    </div>
  );
}
