import { useMemo, useState } from "react";
import { applyFilters, useWorkspace } from "@/lib/workspace/WorkspaceProvider";
import type { Authority, DocType, EvidenceDocument } from "@/lib/workspace/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Upload, Search, Filter, ChevronRight, Sparkles } from "lucide-react";

const AUTHORITY_ORDER: Authority[] = [
  "Authoritative", "Prior drafting reference", "Commercial evidence",
  "Operational evidence", "Compliance evidence", "External intelligence",
];

const authorityColor: Record<Authority, string> = {
  "Authoritative": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Prior drafting reference": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Commercial evidence": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  "Operational evidence": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  "Compliance evidence": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "External intelligence": "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30",
};

function useFilterOptions(all: EvidenceDocument[]) {
  return useMemo(() => {
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr)).sort();
    return {
      sources: uniq(all.map((d) => d.source)) as ("Seeded" | "Uploaded" | "External")[],
      authorities: AUTHORITY_ORDER.filter((a) => all.some((d) => d.authority === a)),
      purposes: uniq(all.map((d) => d.purpose)),
      types: uniq(all.map((d) => d.type)) as DocType[],
      regions: uniq(all.map((d) => d.region).filter(Boolean) as string[]),
      topics: uniq(all.flatMap((d) => d.topic ?? [])),
      vendors: uniq(all.map((d) => d.vendor).filter(Boolean) as string[]),
    };
  }, [all]);
}

function Chip({ active, label, count, onClick, className = "" }: { active: boolean; label: string; count?: number; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] rounded-full border px-2 py-0.5 transition ${active ? "bg-accent2 text-white border-accent2" : "bg-card hover:bg-muted border-border text-muted-foreground"} ${className}`}
    >
      {label}{count !== undefined && <span className="ml-1 opacity-70">{count}</span>}
    </button>
  );
}

export function EvidenceIntelligence() {
  const ws = useWorkspace();
  const { state, allEvidence, includedEvidence, setFilters, toggleInclude, setIncludeMany, uploadEvidence, confirmEvidenceSet } = ws;
  const filters = state.evidenceSet.filters;

  const [selection, setSelection] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Cascading filters: options only count docs matching *other* active filters.
  const opts = useFilterOptions(allEvidence);
  const filtered = useMemo(() => applyFilters(allEvidence, filters), [allEvidence, filters]);

  // Counts per option relative to other active filters (excluding the axis itself).
  function countFor<K extends keyof typeof filters>(axis: K, value: string): number {
    const rest = { ...filters, [axis]: [] } as typeof filters;
    return applyFilters(allEvidence, rest).filter((d) => {
      switch (axis) {
        case "sources": return d.source === value;
        case "authorities": return d.authority === value;
        case "purposes": return d.purpose === value;
        case "types": return d.type === value;
        case "regions": return d.region === value;
        case "topics": return d.topic?.includes(value) ?? false;
        case "vendors": return d.vendor === value;
        default: return false;
      }
    }).length;
  }

  function toggleArrayFilter<K extends keyof typeof filters>(axis: K, value: string) {
    const cur = filters[axis] as string[];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setFilters({ [axis]: next } as any);
  }
  function clearAll() {
    setFilters({ search: "", sources: [], authorities: [], purposes: [], types: [], regions: [], topics: [], vendors: [], dateFrom: undefined, dateTo: undefined });
  }

  const activeCount =
    (filters.search ? 1 : 0) + filters.sources.length + filters.authorities.length +
    filters.purposes.length + filters.types.length + filters.regions.length +
    filters.topics.length + filters.vendors.length + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  // Extracted intelligence, grouped
  const byAuthority = useMemo(() => {
    const m = new Map<Authority, EvidenceDocument[]>();
    includedEvidence.forEach((d) => {
      const arr = m.get(d.authority) ?? [];
      arr.push(d);
      m.set(d.authority, arr);
    });
    return AUTHORITY_ORDER.map((a) => [a, m.get(a) ?? []] as const).filter(([, v]) => v.length);
  }, [includedEvidence]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
      {/* Left: filters + summary */}
      <aside className="space-y-3">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold"><Filter className="h-3.5 w-3.5" /> Cascading filters
            {activeCount > 0 && <button onClick={clearAll} className="ml-auto text-[11px] text-muted-foreground hover:text-foreground">Clear all ({activeCount})</button>}
          </div>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} placeholder="Search evidence…" className="pl-7 h-8 text-xs" />
          </div>

          <FilterGroup label="Source" opts={opts.sources} active={filters.sources} onToggle={(v) => toggleArrayFilter("sources", v)} count={(v) => countFor("sources", v)} />
          <FilterGroup label="Authority" opts={opts.authorities} active={filters.authorities} onToggle={(v) => toggleArrayFilter("authorities", v)} count={(v) => countFor("authorities", v)} />
          <FilterGroup label="Purpose" opts={opts.purposes} active={filters.purposes} onToggle={(v) => toggleArrayFilter("purposes", v)} count={(v) => countFor("purposes", v)} />
          <FilterGroup label="Type" opts={opts.types} active={filters.types} onToggle={(v) => toggleArrayFilter("types", v)} count={(v) => countFor("types", v)} />
          <FilterGroup label="Region" opts={opts.regions} active={filters.regions} onToggle={(v) => toggleArrayFilter("regions", v)} count={(v) => countFor("regions", v)} />
          <FilterGroup label="Topic" opts={opts.topics} active={filters.topics} onToggle={(v) => toggleArrayFilter("topics", v)} count={(v) => countFor("topics", v)} />
          <FilterGroup label="Vendor" opts={opts.vendors} active={filters.vendors} onToggle={(v) => toggleArrayFilter("vendors", v)} count={(v) => countFor("vendors", v)} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Date range</div>
            <div className="flex gap-2">
              <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })} className="h-7 text-[11px] px-2" />
              <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => setFilters({ dateTo: e.target.value || undefined })} className="h-7 text-[11px] px-2" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="text-xs font-semibold flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-accent2" /> Evidence Set Summary</div>
          <div className="text-[11px] text-muted-foreground">{includedEvidence.length} of {allEvidence.length} sources included · {filtered.length} match current filters</div>
          {state.evidenceSet.summary && (
            <div className="space-y-1.5 pt-1">
              <StatBar label="Artifact coverage" value={state.evidenceSet.summary.artifactCoverage} />
              <StatBar label="Draft readiness" value={state.evidenceSet.summary.draftReadiness} tone="accent" />
              {state.evidenceSet.summary.gaps.map((g) => <div key={g} className="text-[11px] text-amber-600 dark:text-amber-400">Gap: {g}</div>)}
              {state.evidenceSet.summary.conflicts.map((c) => <div key={c} className="text-[11px] text-rose-600 dark:text-rose-400">Conflict: {c}</div>)}
            </div>
          )}
          <Button size="sm" className="w-full" onClick={confirmEvidenceSet}>{state.evidenceSet.confirmed ? "Recalculate readiness" : "Confirm Evidence Set"}</Button>
        </div>
      </aside>

      {/* Right: two-column list + extracted intelligence */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-semibold">Evidence sources</div>
          <span className="text-xs text-muted-foreground">{filtered.length} shown</span>
          <div className="ml-auto flex gap-2">
            {selection.length > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={() => { setIncludeMany(selection, true); setSelection([]); }}>Include selected ({selection.length})</Button>
                <Button size="sm" variant="outline" onClick={() => { setIncludeMany(selection, false); setSelection([]); }}>Exclude selected</Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)} className="gap-1"><Upload className="h-3.5 w-3.5" /> Upload</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">No evidence matches. Adjust filters or clear all.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((d) => (
              <label key={d.id} className={`rounded-lg border p-3 text-sm cursor-pointer transition ${d.included ? "bg-card border-accent2/30" : "bg-muted/20 border-border"}`}>
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={selection.includes(d.id)} onChange={(e) => setSelection((s) => e.target.checked ? [...s, d.id] : s.filter((x) => x !== d.id))} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium leading-tight truncate">{d.title}</div>
                      <button onClick={(e) => { e.preventDefault(); toggleInclude(d.id); }} className={`text-[10px] rounded px-1.5 py-0.5 border ${d.included ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : "border-border text-muted-foreground"}`}>{d.included ? "Included" : "Excluded"}</button>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                      <span className={`rounded-full border px-1.5 py-0.5 ${authorityColor[d.authority]}`}>{d.authority}</span>
                      <span>· {d.type}</span>
                      {d.vendor && <span>· {d.vendor}</span>}
                      {d.region && <span>· {d.region}</span>}
                      {d.date && <span>· {d.date}</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{d.body}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="text-sm font-semibold">Extracted intelligence · grouped by authority</div>
          {byAuthority.length === 0 && <div className="text-xs text-muted-foreground">Include at least one source above to extract intelligence.</div>}
          {byAuthority.map(([auth, docs]) => (
            <div key={auth}>
              <div className={`inline-block text-[11px] rounded-full border px-2 py-0.5 mb-1.5 ${authorityColor[auth]}`}>{auth} · {docs.length}</div>
              <ul className="text-xs space-y-1 pl-1">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-start gap-2"><ChevronRight className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" /><span><span className="font-medium">{d.title}</span> — <span className="text-muted-foreground">{d.body?.slice(0, 140) ?? d.purpose}</span></span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {uploadOpen && <UploadDrawer onClose={() => setUploadOpen(false)} onUpload={(doc) => { uploadEvidence(doc); setUploadOpen(false); }} />}
    </div>
  );
}

function FilterGroup({ label, opts, active, onToggle, count }: { label: string; opts: string[]; active: string[]; onToggle: (v: string) => void; count: (v: string) => number }) {
  if (!opts.length) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {opts.map((v) => {
          const c = count(v);
          return <Chip key={v} active={active.includes(v)} onClick={() => onToggle(v)} label={v} count={c} className={c === 0 && !active.includes(v) ? "opacity-40" : ""} />;
        })}
      </div>
    </div>
  );
}

function StatBar({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "accent" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-0.5"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}%</span></div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full ${tone === "accent" ? "bg-accent2" : "bg-primary"}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function UploadDrawer({ onClose, onUpload }: { onClose: () => void; onUpload: (doc: Omit<EvidenceDocument, "included" | "source" | "status">) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocType>("SOW");
  const [authority, setAuthority] = useState<Authority>("Prior drafting reference");
  const [purpose, setPurpose] = useState("drafting-basis");
  const [vendor, setVendor] = useState("");
  const [region, setRegion] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border rounded-xl w-full max-w-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><div className="text-sm font-semibold">Upload evidence</div><button onClick={onClose}><X className="h-4 w-4" /></button></div>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <select className="rounded border bg-card px-2 py-1 text-xs" value={type} onChange={(e) => setType(e.target.value as DocType)}>
            {["SOW","Contract","Redline","RateCard","Invoice","SLA","ServiceReport","ChangeOrder","Certification","Insurance","Safety","ClauseLibrary","VendorProposal","Benchmark"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className="rounded border bg-card px-2 py-1 text-xs" value={authority} onChange={(e) => setAuthority(e.target.value as Authority)}>
            {AUTHORITY_ORDER.map((a) => <option key={a}>{a}</option>)}
          </select>
          <Input placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          <Input placeholder="Vendor (optional)" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          <Input placeholder="Region (optional)" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <textarea className="w-full rounded border bg-card p-2 text-xs h-24" placeholder="Description / body" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onUpload({ id: `up-${Date.now()}`, title: title || "Untitled evidence", type, authority, purpose, vendor: vendor || undefined, region: region || undefined, body, date: new Date().toISOString().slice(0, 10) })}><Check className="h-3.5 w-3.5 mr-1" /> Upload</Button>
        </div>
      </div>
    </div>
  );
}
