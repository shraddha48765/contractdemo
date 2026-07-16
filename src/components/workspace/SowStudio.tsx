import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useWorkspace } from "@/lib/workspace/WorkspaceProvider";
import { availableTemplates, industrialMaintenanceTemplate, sectionPacks } from "@/lib/seeds/templates";
import { exportDocx, exportEvidencePackZip } from "@/lib/workspace/exports";
import type { DraftSection, SectionRevision, SuggestedChange, WorkflowStatus } from "@/lib/workspace/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles, FileText, MessageSquareText, Users, Download, Printer, Send, Save,
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Trash2, Plus, RefreshCw, Check, X, History, Settings2, ListTree,
  RotateCcw, HardDrive, CornerDownRight,
} from "lucide-react";

type Drawer = null | "ai" | "history" | "comments" | "collab" | "review" | "meta";
const WORKFLOW_CYCLE: WorkflowStatus[] = ["draft", "needs-review", "approved", "rejected"];
const workflowLabel: Record<WorkflowStatus, string> = {
  draft: "Draft", "needs-review": "Needs Review", approved: "Approved", rejected: "Rejected",
};
const workflowClass: Record<WorkflowStatus, string> = {
  draft: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  "needs-review": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

export function SowStudio() {
  const ws = useWorkspace();
  const { state, includedEvidence, generateDraft, saveVersion, issueToVendor, editSectionBody,
    reorderSection, removeSection, addSection, setSuggestionStatus, regenerateSection,
    addReviewer, addComment, resolveComment, addCollaborator, removeCollaborator,
    setCollaboratorAccess, setRail, updateMetadata } = ws;

  const draft = state.draft;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [templateId, setTemplateId] = useState<string>(industrialMaintenanceTemplate.id);
  const [packIds, setPackIds] = useState<string[]>(sectionPacks.map((p) => p.id));
  const [toast, setToast] = useState<string | null>(null);
  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [regenOpen, setRegenOpen] = useState<{ sectionId: string; instruction: string } | null>(null);
  const [issueNotice, setIssueNotice] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const sortedSections = useMemo(() => draft ? [...draft.sections].sort((a, b) => a.order - b.order) : [], [draft]);
  const activeSection = draft && (selectedSectionId ? sortedSections.find((s) => s.id === selectedSectionId) : sortedSections[0]) || null;

  // Outline click: scroll into view + brief highlight
  useEffect(() => {
    if (!selectedSectionId) return;
    const el = sectionRefs.current[selectedSectionId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightId(selectedSectionId);
      const t = setTimeout(() => setHighlightId(null), 1400);
      return () => clearTimeout(t);
    }
  }, [selectedSectionId]);

  // Available "+ Add Section" items — template + pack sections not already present, plus Custom
  const addableSections = useMemo(() => {
    if (!draft) return [] as { id: string; label: string; group: string }[];
    const present = new Set(draft.sections.map((s) => s.id));
    const tpl = industrialMaintenanceTemplate.baseSections
      .filter((s) => !present.has(s.id))
      .map((s) => ({ id: s.id, label: s.label, group: "Template" }));
    const pk = sectionPacks.flatMap((p) => p.sections
      .filter((s) => !present.has(s.id))
      .map((s) => ({ id: s.id, label: s.label, group: p.name })));
    return [...tpl, ...pk];
  }, [draft]);

  // ---- Empty state ----
  if (!draft) {
    return (
      <div className="rounded-xl border bg-card p-8 max-w-2xl mx-auto text-center space-y-4">
        <FileText className="h-10 w-10 mx-auto text-accent2" />
        <div className="text-lg font-semibold">SOW Draft Studio</div>
        <p className="text-sm text-muted-foreground">Confirm your evidence set on the Evidence & Intelligence tab, then generate a first draft here. Sections are grounded in the sources you include and appear progressively as they generate.</p>
        <div className="text-left rounded-lg border bg-muted/30 p-3 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Base template</div>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full h-8 rounded border bg-card text-xs px-2" aria-label="Base template">
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.id === industrialMaintenanceTemplate.id ? " — Recommended" : ""} · {t.baseSections.length} sections
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Add section packs</div>
            <div className="space-y-1">
              {sectionPacks.map((p) => (
                <label key={p.id} className="flex items-start gap-2 text-xs">
                  <input type="checkbox" checked={packIds.includes(p.id)} onChange={(e) => setPackIds((cur) => e.target.checked ? [...cur, p.id] : cur.filter((x) => x !== p.id))} className="mt-0.5" />
                  <span><span className="font-medium">{p.name}</span> <span className="text-muted-foreground">— {p.description}</span></span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button className="gap-1.5" onClick={() => generateDraft({ templateId, packIds })} disabled={includedEvidence.length === 0}>
          <Sparkles className="h-4 w-4" /> Generate first draft {includedEvidence.length === 0 && "(include evidence first)"}
        </Button>
      </div>
    );
  }

  const totalTarget = industrialMaintenanceTemplate.baseSections.length + sectionPacks.filter((p) => draft.sectionPackIds.includes(p.id)).flatMap((p) => p.sections).length;
  const generating = draft.status === "Generating";
  const pendingCount = sortedSections.reduce((n, s) => n + s.suggestions.filter((x) => x.status === "pending").length, 0);
  const openComments = state.comments.filter((c) => c.state === "open").length;

  return (
    <div className={`grid grid-cols-1 gap-3 min-h-[600px] ${focusMode ? "" : "lg:grid-cols-[240px_1fr_320px]"}`}>
      {/* LEFT: Rail — outline OR evidence */}
      {!focusMode && (
      <aside className="rounded-xl border bg-card p-3 space-y-2 order-2 lg:order-1">
        <div className="flex gap-1">
          <button onClick={() => setRail("outline")} className={`flex-1 text-[11px] rounded px-2 py-1 border ${state.railMode === "outline" ? "bg-accent2 text-white border-accent2" : "border-border text-muted-foreground"}`}><ListTree className="h-3 w-3 inline mr-1" />Outline</button>
          <button onClick={() => setRail("evidence")} className={`flex-1 text-[11px] rounded px-2 py-1 border ${state.railMode === "evidence" ? "bg-accent2 text-white border-accent2" : "border-border text-muted-foreground"}`}><FileText className="h-3 w-3 inline mr-1" />Evidence</button>
        </div>
        {state.railMode === "outline" ? (
          <div className="space-y-1">
            {sortedSections.map((s) => (
              <button key={s.id} onClick={() => setSelectedSectionId(s.id)}
                className={`w-full text-left text-xs rounded px-2 py-1.5 border transition ${activeSection?.id === s.id ? "border-accent2 bg-accent2/5" : "border-transparent hover:bg-muted/50"}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium truncate">{s.label}</span>
                  <SectionStatusChip section={s} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <ProvenanceChip section={s} />
                  <span>· {s.currentBody ? `${s.currentBody.length} chars` : "empty"} · {s.suggestions.filter((x) => x.status === "pending").length} AI</span>
                </div>
              </button>
            ))}
            <div className="relative">
              <Button size="sm" variant="outline" className="w-full text-[11px] mt-2 h-7" onClick={() => setAddOpen((v) => !v)}><Plus className="h-3 w-3 mr-1" />Add section</Button>
              {addOpen && (
                <div className="absolute z-30 mt-1 left-0 right-0 max-h-72 overflow-y-auto rounded-md border bg-popover shadow-lg text-xs">
                  {addableSections.length === 0 && <div className="p-2 text-muted-foreground">All template & pack sections already added.</div>}
                  {addableSections.map((s) => (
                    <button key={s.id} onClick={() => { addSection(s.label, { sectionId: s.id, insertAfterId: activeSection?.id }); setAddOpen(false); flash(`Added section: ${s.label}`); }} className="w-full text-left px-2 py-1.5 hover:bg-muted flex items-center justify-between">
                      <span>{s.label}</span>
                      <span className="text-[10px] text-muted-foreground">{s.group}</span>
                    </button>
                  ))}
                  <div className="border-t">
                    <button onClick={() => { setAddOpen(false); setAddCustomOpen(true); }} className="w-full text-left px-2 py-1.5 hover:bg-muted italic text-muted-foreground">+ Custom section…</button>
                  </div>
                </div>
              )}
              {addCustomOpen && (
                <div className="absolute z-30 mt-1 left-0 right-0 rounded-md border bg-popover shadow-lg p-2 space-y-2">
                  <Input autoFocus value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Section title…" className="h-7 text-xs" onKeyDown={(e) => { if (e.key === "Enter" && customLabel.trim()) { addSection(customLabel.trim(), { insertAfterId: activeSection?.id }); flash(`Added: ${customLabel.trim()}`); setCustomLabel(""); setAddCustomOpen(false); } if (e.key === "Escape") { setAddCustomOpen(false); setCustomLabel(""); } }} />
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => { setAddCustomOpen(false); setCustomLabel(""); }}>Cancel</Button>
                    <Button size="sm" className="h-6 text-[11px]" disabled={!customLabel.trim()} onClick={() => { addSection(customLabel.trim(), { insertAfterId: activeSection?.id }); flash(`Added: ${customLabel.trim()}`); setCustomLabel(""); setAddCustomOpen(false); }}>Add</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{includedEvidence.length} sources in set</div>
            {includedEvidence.slice(0, 20).map((d) => (
              <div key={d.id} className="rounded border border-border/50 p-1.5"><div className="font-medium truncate">{d.title}</div><div className="text-[10px] text-muted-foreground">{d.authority} · {d.type}</div></div>
            ))}
          </div>
        )}
      </aside>
      )}

      {/* CENTER: Word-like document */}
      <section className="space-y-3 order-1 lg:order-2 min-w-0">
        {/* Metadata bar */}
        <div className="rounded-xl border bg-card px-4 py-2.5 text-xs flex items-center gap-3 flex-wrap">
          <div className="font-semibold">{draft.metadata.sowNumber}</div>
          <span className="text-muted-foreground">Rev {draft.metadata.revision}</span>
          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5">{draft.status}</span>
          {draft.metadata.vendor && <span className="text-muted-foreground">· {draft.metadata.vendor}</span>}
          <div className="ml-auto flex gap-1">
            
            <IconBtn onClick={() => { setDrawer("meta"); }} title="Document details"><Settings2 className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn onClick={() => setDrawer("history")} title="Version history"><History className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn onClick={() => setDrawer("comments")} title="Comments" badge={openComments || undefined}><MessageSquareText className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn onClick={() => setDrawer("collab")} title="Collaborators"><Users className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn onClick={() => {
              if (confirm("Global reset: clear ALL demo workspace data across every request? This cannot be undone.")) {
                try {
                  const keys = Object.keys(localStorage).filter((k) => k.startsWith("workspace-v3-") || k.startsWith("demo-"));
                  keys.forEach((k) => localStorage.removeItem(k));
                } catch {}
                window.location.reload();
              }
            }} title="Global reset — clear all demo data"><RotateCcw className="h-3.5 w-3.5" /></IconBtn>
          </div>
        </div>


        {/* Generation status */}
        {generating && (
          <div className="rounded-lg border border-accent2/40 bg-accent2/5 px-3 py-2 text-xs flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent2 animate-pulse" />
            Generating {sortedSections.length} of {totalTarget} sections… drafting from {includedEvidence.length} evidence sources.
          </div>
        )}

        {/* Document canvas */}
        <div className="rounded-xl border bg-white text-slate-900 shadow-sm mx-auto max-w-[820px] w-full">
          <div className="px-10 py-8 space-y-6">
            <div className="text-center border-b pb-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Statement of Work</div>
              <div className="text-xl font-bold mt-1">{draft.metadata.sowNumber}</div>
              <div className="text-xs text-slate-500 mt-1">Rev {draft.metadata.revision} · {draft.metadata.category}</div>
            </div>
            {sortedSections.map((s, idx) => (
              <SectionBlock key={s.id} section={s} idx={idx} total={sortedSections.length}
                active={activeSection?.id === s.id}
                highlight={highlightId === s.id}
                registerRef={(el) => { sectionRefs.current[s.id] = el; }}
                onFocus={() => setSelectedSectionId(s.id)}
                onChange={(body) => editSectionBody(s.id, body)}
                onMove={(dir) => reorderSection(s.id, dir)}
                onRemove={() => { if (confirm(`Remove section "${s.label}"?`)) removeSection(s.id); }}
                onAiReview={() => { setSelectedSectionId(s.id); setDrawer("ai"); }}
                onRegenerate={async () => { const inst = prompt("Refinement instructions?"); if (inst) { await regenerateSection(s.id, inst); flash("AI proposal added — open AI Review to accept."); setSelectedSectionId(s.id); setDrawer("ai"); } }}
                onHistory={() => { setSelectedSectionId(s.id); setDrawer("history"); }}
                onComment={() => { setSelectedSectionId(s.id); setDrawer("comments"); }}
                onSendForReview={() => { setSelectedSectionId(s.id); setDrawer("review"); }}
              />
            ))}
          </div>
        </div>

        {/* Action bar */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur rounded-xl border p-2 flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => { const v = saveVersion(); if (v) flash(`Saved ${v.label}`); }}><Save className="h-3.5 w-3.5" /> Save draft</Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setDrawer("review")}><Send className="h-3.5 w-3.5" /> Send for review</Button>
          <div className="ml-auto flex items-center gap-1">
            <Button size="sm" variant="outline" className="gap-1" onClick={async () => { await exportDocx(draft, `${draft.metadata.sowNumber}.docx`); flash("DOCX exported"); }}><Download className="h-3.5 w-3.5" /> Download DOCX</Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print / Save as PDF</Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={async () => {
              const allSug = sortedSections.flatMap((s) => s.suggestions);
              await exportEvidencePackZip({ draft, evidence: includedEvidence, suggestions: allSug, comments: state.comments, reviewers: state.reviewers, audit: state.audit, filename: `${draft.metadata.sowNumber}-evidence-pack.zip` });
              flash("Evidence pack exported");
            }}><Download className="h-3.5 w-3.5" /> Export Evidence Pack (.zip)</Button>
            <Button size="sm" className="gap-1" onClick={() => { if (confirm("Issue this draft to Apex Industrial Services? A v1.0 immutable version will be created.")) { issueToVendor("Apex Industrial Services"); flash("Draft issued to vendor as v1.0"); } }}><Send className="h-3.5 w-3.5" /> Issue to Vendor</Button>
          </div>
        </div>
      </section>

      {/* RIGHT: contextual info */}
      {!focusMode && (
      <aside className="rounded-xl border bg-card p-3 space-y-2 order-3 text-xs">
        <div className="font-semibold text-sm">Context</div>
        <div className="text-muted-foreground">{pendingCount} pending AI suggestions across draft</div>
        <div className="text-muted-foreground">{state.reviewers.length} review assignments</div>
        <div className="text-muted-foreground">{state.versions.length} saved versions</div>
        {activeSection && (
          <div className="pt-2 border-t space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Selected section</div>
            <div className="font-medium">{activeSection.label}</div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <ProvenanceChip section={activeSection} />
              <SectionStatusChip section={activeSection} />
            </div>
            <div className="flex gap-1 flex-wrap">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setDrawer("ai")}><Sparkles className="h-3 w-3 mr-1" />AI Review ({activeSection.suggestions.filter((x) => x.status === "pending").length})</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setDrawer("history")}><History className="h-3 w-3 mr-1" />History</Button>
            </div>
            <div className="text-[11px] text-muted-foreground">Sources: {activeSection.sourceEvidenceIds.map((id) => state.documents[id]?.title).filter(Boolean).slice(0, 3).join(", ") || "—"}</div>
          </div>
        )}
      </aside>
      )}

      {/* Drawers */}
      {drawer && <DrawerHost onClose={() => setDrawer(null)}>
        {drawer === "ai" && activeSection && <AiReviewDrawer section={activeSection} onDecide={(sug, status, edited) => { setSuggestionStatus(activeSection.id, sug.id, status, edited); }} />}
        {drawer === "history" && <HistoryDrawer sectionId={activeSection?.id} />}
        {drawer === "comments" && <CommentsDrawer sectionId={activeSection?.id} onAdd={(text, mentions) => addComment({ scope: activeSection ? "section" : "document", sectionId: activeSection?.id, text, mentions })} onResolve={resolveComment} />}
        {drawer === "collab" && <CollabDrawer onAdd={(n, r, a) => addCollaborator({ name: n, role: r, access: a })} onRemove={removeCollaborator} onAccess={setCollaboratorAccess} />}
        {drawer === "review" && <ReviewDrawer defaultSectionId={activeSection?.id} onSubmit={(opts) => { addReviewer(opts); flash("Sent for review"); setDrawer(null); }} />}
        {drawer === "meta" && <MetaDrawer onSave={(m) => { updateMetadata(m); flash("Metadata updated"); }} />}
      </DrawerHost>}

      {toast && <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-xs rounded-lg px-3 py-2 shadow-lg">{toast}</div>}
    </div>
  );
}

function IconBtn({ children, onClick, title, badge }: { children: React.ReactNode; onClick: () => void; title: string; badge?: number }) {
  return <button title={title} onClick={onClick} className="relative rounded p-1.5 hover:bg-muted">{children}{badge !== undefined && <span className="absolute -top-1 -right-1 text-[9px] bg-accent2 text-white rounded-full px-1 min-w-[14px] h-[14px] grid place-items-center">{badge}</span>}</button>;
}

function SectionStatusChip({ section }: { section: DraftSection }) {
  const map: Record<DraftSection["status"], string> = {
    empty: "bg-muted text-muted-foreground",
    generating: "bg-accent2/20 text-accent2",
    ai: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    conflict: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    edited: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    "assigned-review": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  };
  return <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${map[section.status]}`}>{section.status}</span>;
}

function ProvenanceChip({ section }: { section: DraftSection }) {
  const map: Record<DraftSection["origin"], { label: string; cls: string }> = {
    template: { label: "Template", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    pack: { label: "Pack", cls: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
    user: { label: "User", cls: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  };
  const aiTouched = section.currentBody && section.currentBody === section.originalText;
  const m = map[section.origin];
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${m.cls}`}>{m.label}</span>
      {aiTouched && <span className="text-[9px] rounded-full px-1.5 py-0.5 bg-blue-500/15 text-blue-700 dark:text-blue-300">AI-drafted</span>}
    </span>
  );
}

function SectionBlock({
  section, idx, total, active, highlight, registerRef,
  onFocus, onChange, onMove, onRemove,
  onAiReview, onRegenerate, onHistory, onComment, onSendForReview,
}: {
  section: DraftSection; idx: number; total: number; active: boolean;
  highlight: boolean; registerRef: (el: HTMLDivElement | null) => void;
  onFocus: () => void; onChange: (body: string) => void;
  onMove: (dir: "up" | "down") => void; onRemove: () => void;
  onAiReview: () => void; onRegenerate: () => void;
  onHistory: () => void; onComment: () => void; onSendForReview: () => void;
}) {
  const pending = section.suggestions.filter((s) => s.status === "pending").length;
  return (
    <div ref={registerRef} className={`group rounded-lg border-l-2 pl-4 -ml-4 py-1 transition-colors ${active ? "border-accent2" : "border-transparent"} ${highlight ? "bg-amber-100/60 dark:bg-amber-500/10" : ""}`} onClick={onFocus}>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-semibold">{idx + 1}. {section.label}</h2>
        <ProvenanceChip section={section} />
        {pending > 0 && <button onClick={(e) => { e.stopPropagation(); onAiReview(); }} className="text-[10px] rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 px-1.5 py-0.5">{pending} AI</button>}
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 text-slate-500">
          <button onClick={(e) => { e.stopPropagation(); onMove("up"); }} disabled={idx === 0} title="Move up" className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onMove("down"); }} disabled={idx === total - 1} title="Move down" className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onRegenerate(); }} title="Regenerate" className="p-1 hover:bg-slate-100 rounded"><RefreshCw className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onComment(); }} title="Comment" className="p-1 hover:bg-slate-100 rounded"><MessageSquareText className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onSendForReview(); }} title="Send for review" className="p-1 hover:bg-slate-100 rounded"><Send className="h-3.5 w-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onHistory(); }} title="History" className="p-1 hover:bg-slate-100 rounded"><History className="h-3.5 w-3.5" /></button>
          {!section.required && <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove" className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded"><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>
      </div>
      <textarea
        value={section.currentBody}
        onChange={(e) => onChange(e.target.value)}
        placeholder="[Section empty — click Regenerate or edit here]"
        className="w-full min-h-[80px] resize-y bg-transparent text-sm leading-relaxed text-slate-800 outline-none focus:bg-blue-50/40 rounded px-1 -mx-1"
      />
    </div>
  );
}

// ---- Drawer host ----
function DrawerHost({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-background border-l shadow-xl h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <button onClick={onClose} className="float-right text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          {children}
        </div>
      </div>
    </div>
  );
}

// ---- AI Review Drawer (section-scoped) ----
function AiReviewDrawer({ section, onDecide }: { section: DraftSection; onDecide: (s: SuggestedChange, status: "accepted" | "rejected" | "modified", edited?: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent2" /> AI Review · {section.label}</div>
      {section.suggestions.length === 0 && <div className="text-xs text-muted-foreground">No AI suggestions for this section.</div>}
      {section.suggestions.map((s) => (
        <SuggestionCard key={s.id} sug={s} onDecide={onDecide} />
      ))}
    </div>
  );
}

function SuggestionCard({ sug, onDecide }: { sug: SuggestedChange; onDecide: (s: SuggestedChange, status: "accepted" | "rejected" | "modified", edited?: string) => void }) {
  const [modOpen, setModOpen] = useState(false);
  const [text, setText] = useState(sug.editedProposedText ?? sug.proposedText);
  const decided = sug.status !== "pending";
  const chipClass: Record<SuggestedChange["classification"], string> = {
    "Gap": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    "Conflict": "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    "Fallback Clause": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    "Value Protection": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    "Needs Review": "bg-slate-500/15 text-slate-700 dark:text-slate-400",
    "Covered": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    "Variant": "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    "Redline Risk": "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  };
  return (
    <div className="rounded-lg border bg-card p-3 space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 ${chipClass[sug.classification]}`}>{sug.classification}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{sug.governance}</span>
        {decided && <span className="ml-auto text-[10px] rounded-full border px-1.5 py-0.5">{sug.status}</span>}
      </div>
      {sug.before && <div className="text-muted-foreground line-through">{sug.before}</div>}
      <div className="bg-muted/40 rounded p-2">{sug.editedProposedText ?? sug.proposedText}</div>
      <div className="text-muted-foreground italic">{sug.why}</div>
      {!decided && (
        modOpen ? (
          <div className="space-y-2">
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-24 rounded border bg-background p-2 text-xs" />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setModOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { onDecide(sug, "modified", text); setModOpen(false); }}>Apply modified</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => onDecide(sug, "rejected")}><X className="h-3 w-3 mr-1" />Reject</Button>
            <Button size="sm" variant="outline" onClick={() => setModOpen(true)}>Modify</Button>
            <Button size="sm" onClick={() => onDecide(sug, "accepted")}><Check className="h-3 w-3 mr-1" />Accept</Button>
          </div>
        )
      )}
    </div>
  );
}

// ---- History Drawer ----
function HistoryDrawer({ sectionId }: { sectionId?: string }) {
  const { state } = useWorkspace();
  const draft = state.draft!;
  const section = sectionId ? draft.sections.find((s) => s.id === sectionId) : null;
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-1.5"><History className="h-4 w-4" /> History</div>
      {section && (
        <>
          <div className="text-xs font-medium">Section: {section.label}</div>
          <ul className="text-xs space-y-1.5">
            {section.history.map((h: SectionRevision) => (
              <li key={h.id} className="border-l-2 border-accent2/40 pl-2">
                <div><span className="font-medium">{h.actor}</span> · <span className="text-muted-foreground">{new Date(h.ts).toLocaleString()}</span></div>
                <div>{h.summary}</div>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="pt-2 border-t">
        <div className="text-xs font-medium mb-1">Document versions</div>
        <ul className="text-xs space-y-1">
          {state.versions.length === 0 && <li className="text-muted-foreground">No saved versions yet.</li>}
          {state.versions.map((v) => (
            <li key={v.id}><span className="font-medium">{v.label}</span> · <span className="text-muted-foreground">{new Date(v.ts).toLocaleString()} — {v.createdBy}</span></li>
          ))}
        </ul>
      </div>
      <div className="pt-2 border-t">
        <div className="text-xs font-medium mb-1">Audit trail (recent)</div>
        <ul className="text-[11px] space-y-1 max-h-64 overflow-y-auto">
          {state.audit.slice(0, 30).map((e) => (
            <li key={e.id}><span className="text-muted-foreground">{new Date(e.ts).toLocaleTimeString()}</span> · <span className="font-medium">{e.actor}</span> · {e.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---- Comments ----
function CommentsDrawer({ sectionId, onAdd, onResolve }: { sectionId?: string; onAdd: (text: string, mentions: string[]) => void; onResolve: (id: string) => void }) {
  const { state } = useWorkspace();
  const [text, setText] = useState("");
  const list = state.comments.filter((c) => sectionId ? c.sectionId === sectionId : !c.sectionId);
  function submit(e: FormEvent) { e.preventDefault(); if (!text.trim()) return; const mentions = Array.from(text.matchAll(/@(\w+)/g)).map((m) => m[1]); onAdd(text.trim(), mentions); setText(""); }
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-1.5"><MessageSquareText className="h-4 w-4" /> Comments {sectionId ? "· section" : "· document"}</div>
      <form onSubmit={submit} className="space-y-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Comment — use @name to mention" className="w-full h-20 rounded border bg-card p-2 text-xs" />
        <div className="text-right"><Button size="sm" type="submit">Post</Button></div>
      </form>
      <ul className="space-y-2 text-xs">
        {list.length === 0 && <li className="text-muted-foreground">No comments yet.</li>}
        {list.map((c) => (
          <li key={c.id} className={`rounded border p-2 ${c.state === "resolved" ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between"><div className="font-medium">{c.authorName}</div><div className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div></div>
            <div className="mt-1">{c.text}</div>
            {c.mentions.length > 0 && <div className="text-[10px] text-accent2 mt-1">Mentions: {c.mentions.map((m) => "@" + m).join(", ")}</div>}
            {c.state === "open" && <div className="text-right mt-1"><button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => onResolve(c.id)}>Resolve</button></div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Collaborators ----
function CollabDrawer({ onAdd, onRemove, onAccess }: { onAdd: (name: string, role: string, access: "view" | "comment" | "edit") => void; onRemove: (id: string) => void; onAccess: (id: string, a: "view" | "comment" | "edit") => void }) {
  const { state } = useWorkspace();
  const [name, setName] = useState(""); const [role, setRole] = useState("Reviewer"); const [access, setAccess] = useState<"view" | "comment" | "edit">("comment");
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-1.5"><Users className="h-4 w-4" /> Collaborators</div>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs col-span-2" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="h-8 rounded border bg-card text-xs px-2">{["Reviewer","Approver","Editor","Legal","Finance","Business SME"].map((r) => <option key={r}>{r}</option>)}</select>
        <select value={access} onChange={(e) => setAccess(e.target.value as any)} className="h-8 rounded border bg-card text-xs px-2 col-span-2">{["view","comment","edit"].map((a) => <option key={a}>{a}</option>)}</select>
        <Button size="sm" onClick={() => { if (!name) return; onAdd(name, role, access); setName(""); }}>Add</Button>
      </div>
      <ul className="text-xs space-y-1.5">
        {state.collaborators.map((c) => (
          <li key={c.id} className="flex items-center gap-2 rounded border p-2">
            <div className="flex-1"><div className="font-medium">{c.name}</div><div className="text-[10px] text-muted-foreground">{c.role}</div></div>
            <select value={c.access} onChange={(e) => onAccess(c.id, e.target.value as any)} className="h-7 rounded border bg-card text-[11px] px-1">{["view","comment","edit"].map((a) => <option key={a}>{a}</option>)}</select>
            <button onClick={() => onRemove(c.id)} className="text-muted-foreground hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
          </li>
        ))}
      </ul>
      <div className="pt-2 border-t">
        <div className="text-xs font-medium mb-1">Access log</div>
        <ul className="text-[11px] space-y-1 max-h-40 overflow-y-auto">
          {state.collaboratorAudit.map((e) => (
            <li key={e.id}><span className="text-muted-foreground">{new Date(e.ts).toLocaleTimeString()}</span> · {e.actor} {e.action} {e.target}{e.from && e.to ? ` (${e.from} → ${e.to})` : ""}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---- Send for Review ----
function ReviewDrawer({ defaultSectionId, onSubmit }: { defaultSectionId?: string; onSubmit: (opts: { scope: "current-section" | "selected-sections" | "entire-document"; sectionIds: string[]; reviewer: string; dueDate?: string; notes?: string }) => void }) {
  const { state } = useWorkspace();
  const [scope, setScope] = useState<"current-section" | "selected-sections" | "entire-document">(defaultSectionId ? "current-section" : "entire-document");
  const [reviewer, setReviewer] = useState("Legal Reviewer");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sectionIds, setSectionIds] = useState<string[]>(defaultSectionId ? [defaultSectionId] : []);
  const draft = state.draft!;
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-1.5"><Send className="h-4 w-4" /> Send for Review</div>
      <div className="text-[11px] text-muted-foreground">Assigning a reviewer creates a review task and audit event. This is <span className="font-medium">not</span> an approval — approvals happen in the Approvals tab.</div>
      <select value={scope} onChange={(e) => setScope(e.target.value as any)} className="w-full h-8 rounded border bg-card text-xs px-2">
        <option value="current-section">Current section</option>
        <option value="selected-sections">Selected sections</option>
        <option value="entire-document">Entire document</option>
      </select>
      {scope === "selected-sections" && (
        <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1">
          {draft.sections.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={sectionIds.includes(s.id)} onChange={(e) => setSectionIds((cur) => e.target.checked ? [...cur, s.id] : cur.filter((x) => x !== s.id))} />{s.label}</label>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <select value={reviewer} onChange={(e) => setReviewer(e.target.value)} className="h-8 rounded border bg-card text-xs px-2">{state.collaborators.map((c) => <option key={c.id}>{c.name}</option>)}</select>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-xs" />
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for reviewer" className="w-full h-20 rounded border bg-card p-2 text-xs" />
      <div className="text-right"><Button size="sm" onClick={() => onSubmit({ scope, sectionIds: scope === "current-section" && defaultSectionId ? [defaultSectionId] : scope === "entire-document" ? draft.sections.map((s) => s.id) : sectionIds, reviewer, dueDate: dueDate || undefined, notes: notes || undefined })}>Send</Button></div>
      <div className="pt-2 border-t">
        <div className="text-xs font-medium mb-1">Active assignments</div>
        <ul className="text-[11px] space-y-1">
          {state.reviewers.map((r) => <li key={r.id}>{r.reviewer} · {r.scope} · {r.state}</li>)}
          {state.reviewers.length === 0 && <li className="text-muted-foreground">None</li>}
        </ul>
      </div>
    </div>
  );
}

function MetaDrawer({ onSave }: { onSave: (m: Partial<import("@/lib/workspace/types").DraftMetadata>) => void }) {
  const { state } = useWorkspace();
  const m = state.draft!.metadata;
  const [form, setForm] = useState(m);
  return (
    <div className="space-y-3 text-xs">
      <div className="text-sm font-semibold flex items-center gap-1.5"><Settings2 className="h-4 w-4" /> Document details</div>
      {[
        ["sowNumber","SOW Number"],["revision","Revision"],["applicability","Applicability"],
        ["owner","Owner"],["category","Category"],["region","Region"],["vendor","Vendor"],
        ["contractType","Contract type"],["parentMSA","Parent MSA"],["currency","Currency"],
        ["term","Term"],["renewalTerms","Renewal terms"],["effectiveDate","Effective date"],
        ["classificationLevel","Classification"],
      ].map(([k, label]) => (
        <label key={k} className="block"><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
          <Input value={(form as any)[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="h-8" />
        </label>
      ))}
      <div className="text-right"><Button size="sm" onClick={() => onSave(form)}>Save</Button></div>
    </div>
  );
}
