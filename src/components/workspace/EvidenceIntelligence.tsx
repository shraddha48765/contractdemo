import { useMemo, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace/WorkspaceProvider";
import type { Authority, DocType, EvidenceDocument } from "@/lib/workspace/types";
import { CheckCircle2, Filter, Search, Upload, FileText, AlertTriangle, ShieldCheck } from "lucide-react";

const ALL_AUTHORITIES: Authority[] = [
  "Authoritative", "Prior drafting reference", "Commercial evidence",
  "Operational evidence", "Compliance evidence", "External intelligence",
];
const ALL_TYPES: DocType[] = [
  "SOW", "Contract", "Exhibit", "Redline", "RateCard", "WageSchedule", "PO",
  "Invoice", "SLA", "ServiceReport", "ChangeOrder", "Certification", "Insurance",
  "Safety", "ClauseLibrary", "FallbackPlaybook", "Benchmark", "VendorProposal",
];

export function EvidenceIntelligence() {
  const { state, dispatch, filteredDocs, audit } = useWorkspace();
  const [view, setView] = useState<"set" | "intel">("set");
  const filters = state.evidenceSet.filters;
  const fileRef = useRef<HTMLInputElement>(null);

  const includedDocs = filteredDocs.filter((d) => d.included);
  const summary = useMemo(() => {
    const gaps: string[] = [];
    const conflicts: string[] = [];
    if (includedDocs.some((d) => d.id === "prior-change-order")) gaps.push("Weekend coverage repeatedly added via change order");
    if (includedDocs.some((d) => d.id === "apex-redline-v3")) conflicts.push("Vendor redline weakens SLA & removes service credits");
    if (includedDocs.some((d) => d.id === "invoice-1842")) conflicts.push("Invoice handling exceeds approved cap");
    return { coverage: Math.min(100, Math.round((includedDocs.length / 15) * 100)), gaps, conflicts };
  }, [includedDocs]);

  const toggleMulti = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const onUpload = (files: FileList | null) => {
    if (!files) return;
    const now = new Date().toISOString();
    Array.from(files).forEach(async (f) => {
      const id = `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      let body: string | undefined;
      if (f.type.startsWith("text/") || f.name.endsWith(".txt") || f.name.endsWith(".md")) {
        try { body = (await f.text()).slice(0, 200_000); } catch {}
      }
      const doc: EvidenceDocument = {
        id, title: f.name, source: "Uploaded", type: guessType(f.name),
        authority: "External intelligence", purpose: "user-supplied",
        status: body ? "Ready" : "Uploaded / Intake Complete",
        included: true, uploadedAt: now, body,
      };
      dispatch({ type: "addDocument", doc });
      audit(`Uploaded "${f.name}"${body ? " (text extracted client-side)" : " (intake only — deep extraction requires document intelligence pipeline)"}`, "Uploaded Document");
    });
  };

  return (
    <div className="space-y-3">
      {/* Sub-view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex rounded-md border bg-card p-0.5">
          <button onClick={() => setView("set")} className={`text-xs px-3 py-1.5 rounded ${view === "set" ? "bg-accent2 text-white" : "text-muted-foreground hover:text-foreground"}`}>Evidence Set</button>
          <button onClick={() => setView("intel")} className={`text-xs px-3 py-1.5 rounded ${view === "intel" ? "bg-accent2 text-white" : "text-muted-foreground hover:text-foreground"}`}>Extracted Intelligence</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted">
            <Upload className="h-3.5 w-3.5" /> Upload evidence
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { onUpload(e.target.files); e.target.value = ""; }} />
          {!state.evidenceSet.confirmed ? (
            <button
              onClick={() => { dispatch({ type: "confirmEvidence" }); audit(`Evidence Set confirmed (${includedDocs.length} docs).`, "Human"); }}
              className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent2 text-white hover:opacity-90"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm evidence set
            </button>
          ) : (
            <span className="text-[11px] rounded bg-emerald-100 text-emerald-800 px-2 py-1 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Evidence confirmed</span>
          )}
        </div>
      </div>

      {view === "set" ? (
        <div className="grid grid-cols-12 gap-3">
          {/* Filter rail */}
          <aside className="col-span-12 lg:col-span-3 rounded-xl border bg-card p-3 space-y-3 text-[11px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Filter className="h-3 w-3" /> Filters</div>
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={filters.search} onChange={(e) => dispatch({ type: "setFilters", filters: { search: e.target.value } })} placeholder="Search…" className="w-full pl-7 pr-2 py-1.5 rounded border bg-background text-[11px]" />
            </div>

            <FilterGroup label="Source" options={["Seeded", "Uploaded", "External"] as const} selected={filters.sources} onToggle={(v) => dispatch({ type: "setFilters", filters: { sources: toggleMulti(filters.sources, v) as typeof filters.sources } })} />
            <FilterGroup label="Authority" options={ALL_AUTHORITIES} selected={filters.authorities} onToggle={(v) => dispatch({ type: "setFilters", filters: { authorities: toggleMulti(filters.authorities, v) } })} />
            <FilterGroup label="Type" options={ALL_TYPES} selected={filters.types} onToggle={(v) => dispatch({ type: "setFilters", filters: { types: toggleMulti(filters.types, v) } })} compact />

            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Vendor</div>
              <input value={filters.vendors.join(", ")} onChange={(e) => dispatch({ type: "setFilters", filters: { vendors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })} className="w-full px-2 py-1 rounded border bg-background text-[11px]" placeholder="Any" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Region</div>
              <input value={filters.regions.join(", ")} onChange={(e) => dispatch({ type: "setFilters", filters: { regions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })} className="w-full px-2 py-1 rounded border bg-background text-[11px]" placeholder="Any" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Topic</div>
              <input value={filters.topics.join(", ")} onChange={(e) => dispatch({ type: "setFilters", filters: { topics: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })} className="w-full px-2 py-1 rounded border bg-background text-[11px]" placeholder="Any" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Date range</div>
              <div className="flex gap-1">
                <input type="date" value={filters.dateFrom ?? ""} onChange={(e) => dispatch({ type: "setFilters", filters: { dateFrom: e.target.value } })} className="flex-1 px-1.5 py-1 rounded border bg-background text-[11px]" />
                <input type="date" value={filters.dateTo ?? ""} onChange={(e) => dispatch({ type: "setFilters", filters: { dateTo: e.target.value } })} className="flex-1 px-1.5 py-1 rounded border bg-background text-[11px]" />
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: "setFilters", filters: { search: "", sources: ["Seeded","Uploaded","External"], authorities: [], purposes: [], types: [], regions: [], topics: [], vendors: [], dateFrom: undefined, dateTo: undefined } })}
              className="text-[10px] text-accent2 hover:underline"
            >Clear all filters</button>
          </aside>

          {/* Doc list */}
          <div className="col-span-12 lg:col-span-9 rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold flex items-center justify-between">
              <span>Evidence Set · {filteredDocs.length} docs · {includedDocs.length} included</span>
              <span className="text-[10px] text-muted-foreground">Coverage {summary.coverage}%</span>
            </div>
            <div className="divide-y">
              {filteredDocs.map((d) => (
                <div key={d.id} className="p-3 flex items-start gap-3 hover:bg-muted/30">
                  <input type="checkbox" checked={d.included} onChange={() => dispatch({ type: "toggleInclude", docId: d.id })} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{d.title}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${d.source === "Seeded" ? "bg-slate-100 text-slate-700" : "bg-accent2/15 text-accent2"}`}>{d.source}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-700">{d.type}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-800">{d.authority}</span>
                      <span className="text-[9px] text-muted-foreground">{d.purpose}</span>
                    </div>
                    {d.body && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{d.body}</p>}
                    <div className="text-[10px] text-muted-foreground mt-1 flex gap-2 flex-wrap">
                      {d.vendor && <span>Vendor: {d.vendor}</span>}
                      {d.region && <span>Region: {d.region}</span>}
                      {d.date && <span>Date: {d.date}</span>}
                      {(d.topic ?? []).map((t) => <span key={t} className="rounded bg-muted px-1">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
              {!filteredDocs.length && <div className="p-6 text-xs text-muted-foreground text-center">No documents match current filters.</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <IntelCard title="Coverage" tone="ok" icon={<ShieldCheck className="h-4 w-4" />}>
            <div className="text-2xl font-semibold">{summary.coverage}%</div>
            <p className="text-[11px] text-muted-foreground">Included evidence coverage across expected artifact types.</p>
          </IntelCard>
          <IntelCard title="Gaps" tone="warn" icon={<AlertTriangle className="h-4 w-4" />}>
            {summary.gaps.length ? <ul className="text-[11px] space-y-1 list-disc pl-4">{summary.gaps.map((g) => <li key={g}>{g}</li>)}</ul> : <p className="text-[11px] text-muted-foreground">No gaps detected.</p>}
          </IntelCard>
          <IntelCard title="Conflicts" tone="danger" icon={<AlertTriangle className="h-4 w-4" />}>
            {summary.conflicts.length ? <ul className="text-[11px] space-y-1 list-disc pl-4">{summary.conflicts.map((g) => <li key={g}>{g}</li>)}</ul> : <p className="text-[11px] text-muted-foreground">No conflicts detected.</p>}
          </IntelCard>
        </div>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({ label, options, selected, onToggle, compact }: { label: string; options: readonly T[]; selected: T[]; onToggle: (v: T) => void; compact?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`flex flex-wrap gap-1 ${compact ? "max-h-24 overflow-auto" : ""}`}>
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button key={o} onClick={() => onToggle(o)} className={`text-[10px] px-1.5 py-0.5 rounded border ${on ? "bg-accent2 text-white border-accent2" : "bg-background hover:bg-muted"}`}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}
function IntelCard({ title, tone, icon, children }: { title: string; tone: "ok" | "warn" | "danger"; icon: React.ReactNode; children: React.ReactNode }) {
  const cls = tone === "ok" ? "border-emerald-200 bg-emerald-50" : tone === "warn" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50";
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold">{icon}{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function guessType(name: string): DocType {
  const n = name.toLowerCase();
  if (n.includes("redline")) return "Redline";
  if (n.includes("invoice")) return "Invoice";
  if (n.includes("rate")) return "RateCard";
  if (n.includes("sla")) return "SLA";
  if (n.includes("sow")) return "SOW";
  if (n.includes("insurance") || n.includes("coi")) return "Insurance";
  return "Contract";
}
