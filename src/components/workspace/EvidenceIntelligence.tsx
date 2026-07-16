import { useMemo, useState } from "react";
import { applyFilters, useWorkspace } from "@/lib/workspace/WorkspaceProvider";
import type { Authority, DocType, EvidenceDocument } from "@/lib/workspace/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Upload, Search, Filter, ChevronRight, Sparkles, CheckSquare } from "lucide-react";

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

// ---- Business-domain finding taxonomy (per repair patch §2) ----
type BusinessGroup =
  | "Scope & Obligations"
  | "Commercial Terms"
  | "SLA & Service Credits"
  | "Change-Order Lessons"
  | "Compliance Requirements"
  | "Redline Risks"
  | "Renewal Requirements";

const GROUP_ORDER: BusinessGroup[] = [
  "Scope & Obligations",
  "Commercial Terms",
  "SLA & Service Credits",
  "Change-Order Lessons",
  "Compliance Requirements",
  "Redline Risks",
  "Renewal Requirements",
];

interface Finding {
  group: BusinessGroup;
  title: string;
  detail: string;
  sourceIds: string[];
  requiresAll?: boolean; // default: any-of
}

// Findings are grounded to seeded evidence IDs. A finding renders only when at
// least one of its source IDs is currently included in the Evidence Set.
const FINDINGS: Finding[] = [
  // Scope & Obligations
  { group: "Scope & Obligations", title: "Weekend coverage missing from base scope",
    detail: "Weekend emergency coverage was added mid-term via change order in 2023 and 2024 — evidence of recurring under-scoped weekend obligation.",
    sourceIds: ["prior-change-order", "sow-apex-2023"] },
  { group: "Scope & Obligations", title: "PM cycle discipline strong",
    detail: "Q4 service report shows 97% PM completion across six sites; monthly cadence documented in CMMS.",
    sourceIds: ["service-report-q4"] },
  { group: "Scope & Obligations", title: "Emergency generator scope precedent",
    detail: "2022 emergency-generator SOW establishes quarterly PM cycle and 2-hour response as internal benchmark.",
    sourceIds: ["sow-emergency-gen-2022"] },

  // Commercial Terms
  { group: "Commercial Terms", title: "Approved 3% CPI-linked escalation cap",
    detail: "Rate Card v2 (Approved) sets escalation cap at 3% CPI-linked; clause library confirms as governed position.",
    sourceIds: ["apex-rate-card-v2", "clause-library"] },
  { group: "Commercial Terms", title: "Vendor proposal above cap",
    detail: "Apex renewal proposal requests labor +4.2% YoY — 1.2 pts above the 3% governed cap.",
    sourceIds: ["apex-proposal-2026", "apex-rate-card-v2"] },
  { group: "Commercial Terms", title: "2024 spend baseline",
    detail: "PO volume $2.28M across six sites; 42 emergency callouts.",
    sourceIds: ["po-2024-summary"] },
  { group: "Commercial Terms", title: "Materials handling leakage",
    detail: "Invoice INV-1842 shows handling billed at 14% vs approved 8% — ~$12,480 exposure on the sampled invoice.",
    sourceIds: ["invoice-1842"] },
  { group: "Commercial Terms", title: "Prevailing wage schedule active",
    detail: "State prevailing wage schedule 2026 governs applicable maintenance trades.",
    sourceIds: ["wage-schedule-2026"] },

  // SLA & Service Credits
  { group: "SLA & Service Credits", title: "Approved SLA: 4 hours 24×7",
    detail: "2023 Apex SOW establishes 4-hour 24×7 emergency response for critical assets as the governed baseline.",
    sourceIds: ["sow-apex-2023"] },
  { group: "SLA & Service Credits", title: "Actual attainment 94.2% with weekend concentration",
    detail: "SLA log 2025 records 94.2% on-time; 3 misses in Q3 concentrated at Site 4 on weekends.",
    sourceIds: ["sla-log-2025"] },
  { group: "SLA & Service Credits", title: "Service-credit fallback available",
    detail: "Fallback Playbook provides 1.5% service-credit language when monthly completion target missed two consecutive months.",
    sourceIds: ["fallback-playbook", "clause-library"] },
  { group: "SLA & Service Credits", title: "Benchmark: comparable SLA at 6 hrs",
    detail: "Northstar 2022 SOW uses 6-hour business-day response — Apex 4-hour 24×7 remains the stronger position.",
    sourceIds: ["sow-northstar-2022"] },

  // Change-Order Lessons
  { group: "Change-Order Lessons", title: "Weekend coverage repeatedly added by CO",
    detail: "Prior change-order history shows the same weekend-coverage gap patched at premium rate across 2023 and 2024.",
    sourceIds: ["prior-change-order"] },
  { group: "Change-Order Lessons", title: "Approval threshold pattern",
    detail: "Change orders exceeded $25K on multiple occasions without explicit written pre-approval — tighter language required.",
    sourceIds: ["prior-change-order", "po-2024-summary"] },

  // Compliance Requirements
  { group: "Compliance Requirements", title: "OSHA-30 roster gap",
    detail: "Technician certification roster shows 2 of 42 assigned technicians with pending OSHA-30 renewal.",
    sourceIds: ["tech-roster"] },
  { group: "Compliance Requirements", title: "Insurance meets minimums",
    detail: "Certificate of insurance confirms $5M general liability, workers' comp per statute, additional insured endorsement.",
    sourceIds: ["apex-insurance"] },
  { group: "Compliance Requirements", title: "Site safety program governs",
    detail: "Buyer safety program requirements (LOTO, hot work, confined space, PPE minimums) apply to all site work.",
    sourceIds: ["safety-requirements"] },
  { group: "Compliance Requirements", title: "Electrical MSA sets tighter safety schedule",
    detail: "Electrical Repair MSA 2024 imposes stricter OSHA-30 and safety-schedule requirements — reference precedent for elevated language.",
    sourceIds: ["sow-electrical-2024"] },

  // Redline Risks
  { group: "Redline Risks", title: "Redline weakens emergency SLA",
    detail: "Vendor Redline v3 softens 4-hour 24×7 response to 8-hour business hours — direct erosion of governed SLA.",
    sourceIds: ["apex-redline-v3", "sow-apex-2023"] },
  { group: "Redline Risks", title: "Redline removes service credits",
    detail: "Vendor Redline v3 deletes the service-credit clause entirely — restore from fallback playbook.",
    sourceIds: ["apex-redline-v3", "fallback-playbook"] },
  { group: "Redline Risks", title: "Redline raises handling cap to 12%",
    detail: "Vendor Redline v3 lifts handling cap from 8% to 12% — inconsistent with rate card and invoice history.",
    sourceIds: ["apex-redline-v3", "apex-rate-card-v2", "invoice-1842"] },

  // Renewal Requirements
  { group: "Renewal Requirements", title: "120-day renewal review window",
    detail: "2023 Apex SOW establishes a 120-day renewal review window before expiration — carry forward.",
    sourceIds: ["sow-apex-2023"] },
  { group: "Renewal Requirements", title: "Vendor renewal terms above cap",
    detail: "Apex renewal proposal (Nov 2025) proposes labor +4.2% and 6-hour SLA — negotiate down to governed positions.",
    sourceIds: ["apex-proposal-2026"] },
  { group: "Renewal Requirements", title: "Renewal fallback ladder available",
    detail: "Fallback playbook provides ranked positions for renewal negotiation when vendor weakens approved terms.",
    sourceIds: ["fallback-playbook"] },
];

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

  const [uploadOpen, setUploadOpen] = useState(false);

  const opts = useFilterOptions(allEvidence);
  const filtered = useMemo(() => applyFilters(allEvidence, filters), [allEvidence, filters]);

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

  // Business-grouped extracted intelligence
  const groupedFindings = useMemo(() => {
    const includedIds = new Set(includedEvidence.map((d) => d.id));
    return GROUP_ORDER.map((group) => {
      const items = FINDINGS
        .filter((f) => f.group === group)
        .filter((f) => f.requiresAll
          ? f.sourceIds.every((id) => includedIds.has(id))
          : f.sourceIds.some((id) => includedIds.has(id)));
      return { group, items };
    }).filter((g) => g.items.length > 0);
  }, [includedEvidence]);

  // "Select all filtered" — includes every doc currently matching filters.
  const allFilteredIncluded = filtered.length > 0 && filtered.every((d) => d.included);
  const filteredIncludedCount = filtered.filter((d) => d.included).length;

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

      {/* Right: evidence list + business-grouped intelligence */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-semibold">Evidence sources</div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} shown · {filteredIncludedCount} of {filtered.length} included
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={filtered.length === 0}
              onClick={() => setIncludeMany(filtered.map((d) => d.id), !allFilteredIncluded)}
              className="gap-1"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              {allFilteredIncluded ? "Deselect all filtered" : "Select all filtered"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)} className="gap-1"><Upload className="h-3.5 w-3.5" /> Upload</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">No evidence matches. Adjust filters or clear all.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((d) => (
              <label
                key={d.id}
                className={`rounded-lg border p-3 text-sm cursor-pointer transition flex items-start gap-2 ${d.included ? "bg-card border-accent2/40" : "bg-muted/20 border-border opacity-80"}`}
              >
                <input
                  type="checkbox"
                  checked={d.included}
                  onChange={() => toggleInclude(d.id)}
                  className="mt-1 accent-[hsl(var(--accent2,207_90%_54%))]"
                  aria-label={`Include ${d.title} in Evidence Set`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium leading-tight truncate">{d.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                    <span className={`rounded-full border px-1.5 py-0.5 ${authorityColor[d.authority]}`}>{d.authority}</span>
                    <span>· {d.type}</span>
                    {d.vendor && <span>· {d.vendor}</span>}
                    {d.region && <span>· {d.region}</span>}
                    {d.date && <span>· {d.date}</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{d.body}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">Extracted intelligence</div>
            <span className="text-[11px] text-muted-foreground">grouped by business area · authority is a secondary filter</span>
          </div>
          {groupedFindings.length === 0 && (
            <div className="text-xs text-muted-foreground">Include at least one source above to extract intelligence.</div>
          )}
          {groupedFindings.map(({ group, items }) => (
            <div key={group} className="space-y-1.5">
              <div className="text-xs font-semibold text-foreground/90">{group} <span className="text-muted-foreground font-normal">· {items.length}</span></div>
              <ul className="space-y-1.5">
                {items.map((f, i) => (
                  <li key={`${group}-${i}`} className="rounded-md border border-border/60 bg-muted/20 p-2 text-xs">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium">{f.title}</div>
                        <div className="text-muted-foreground mt-0.5">{f.detail}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {f.sourceIds
                            .map((id) => state.documents[id])
                            .filter((d): d is EvidenceDocument => Boolean(d && d.included))
                            .map((d) => (
                              <span
                                key={d.id}
                                title={`${d.authority} · ${d.type}`}
                                className={`inline-flex items-center gap-1 text-[10px] rounded-full border px-1.5 py-0.5 ${authorityColor[d.authority]}`}
                              >
                                <span className="truncate max-w-[160px]">{d.title}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </li>
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
