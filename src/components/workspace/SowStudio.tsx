import { useEffect, useMemo, useRef, useState } from "react";
import {
  useWorkspace,
  industrialMaintenanceTemplate,
  sectionPacks,
} from "@/lib/workspace/WorkspaceProvider";
import { getProvider } from "@/lib/providers/documentIntelligence";
import type { DraftDocument, DraftSection, SuggestedChange, TemplateSection } from "@/lib/workspace/types";
import {
  Sparkles, FileText, Download, Save, Send, ChevronDown, MoreHorizontal, Check, X, Wand2, Link as LinkIcon,
  MessageSquare, Users, ShieldCheck, History, BookOpen, ClipboardList, Info, PanelRight,
} from "lucide-react";

type DrawerId =
  | null | "ai" | "comments" | "collaborators" | "reviewers" | "approvers"
  | "evidence" | "sectionHistory" | "versions" | "audit" | "details";

export function SowStudio() {
  const { state, dispatch, filteredDocs, audit } = useWorkspace();
  const [genProgress, setGenProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedTemplate] = useState(industrialMaintenanceTemplate);
  const [selectedPacks, setSelectedPacks] = useState<string[]>(["pack-value-protection"]);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const draft = state.draft;
  const canGenerate = state.evidenceSet.confirmed;
  const includedEvidence = useMemo(
    () => filteredDocs.filter((d) => d.included),
    [filteredDocs],
  );

  // Auto-switch rail to outline after generation (plan v3 C1)
  useEffect(() => {
    if (draft && draft.sections.length && state.railMode === "evidence") {
      dispatch({ type: "setRailMode", mode: "outline" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.sections.length]);

  const startGenerate = async () => {
    const now = new Date().toISOString();
    const packSections = selectedPacks.flatMap(
      (id) => sectionPacks.find((p) => p.id === id)?.sections ?? [],
    );
    const newDraft: DraftDocument = {
      id: `draft-${Date.now()}`,
      requestId: state.requestId,
      evidenceSetId: state.evidenceSet.id,
      templateId: selectedTemplate.id,
      sectionPackIds: selectedPacks,
      status: "Generating",
      version: 1,
      sections: [],
      metadata: {
        revision: "v0.1",
        status: "Generating",
        applicability: "Renewal 2026 · 6 sites",
        owner: "You",
        effectiveDate: "2026-04-01",
        category: "Industrial Maintenance",
        region: "US Gulf Coast",
        vendor: "Apex Industrial Services",
        contractType: "Renewal",
        sowNumber: "SOW-IMS-2026-014",
        currency: "USD",
        term: "3 years",
        createdAt: now,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "startDraft", draft: newDraft });
    audit("Draft initialized. Beginning progressive generation.", "AI");

    const provider = await getProvider();
    const input = {
      requestId: state.requestId,
      evidenceSetId: state.evidenceSet.id,
      templateId: selectedTemplate.id,
      templateSections: selectedTemplate.baseSections,
      packSections,
      evidence: includedEvidence,
    };
    for await (const ev of provider.generateDocument(input)) {
      if (ev.type === "start") {
        setGenProgress({ current: 0, total: ev.totalSections });
        // Seed placeholder sections in "generating" state so per-section UI shows progress
        const all = [...selectedTemplate.baseSections, ...packSections];
        all.forEach((s, i) => {
          const placeholder: DraftSection = {
            id: s.id, label: s.label, order: i,
            origin: selectedTemplate.baseSections.includes(s) ? "template" : "pack",
            required: s.required,
            status: "generating", body: "",
            suggestions: [], sourceEvidenceIds: [], history: [],
          };
          dispatch({ type: "upsertSection", section: placeholder });
        });
      } else if (ev.type === "section") {
        dispatch({ type: "upsertSection", section: ev.section });
        setGenProgress((p) => (p ? { ...p, current: p.current + 1 } : p));
      } else {
        dispatch({ type: "setDraftStatus", status: "DraftGenerated" });
        setGenProgress(null);
        audit("Draft generated.", "AI");
      }
    }
  };

  const acceptSuggestion = (sec: DraftSection, s: SuggestedChange) => {
    dispatch({ type: "decideSuggestion", sectionId: sec.id, suggestionId: s.id, decision: "accepted" });
    audit(`Accepted "${s.classification}" in ${sec.label}.`);
  };
  const rejectSuggestion = (sec: DraftSection, s: SuggestedChange) => {
    dispatch({ type: "decideSuggestion", sectionId: sec.id, suggestionId: s.id, decision: "rejected" });
    audit(`Rejected "${s.classification}" in ${sec.label}.`);
  };

  const saveDraft = () => {
    if (!draft) return;
    const v = { id: `v-${Date.now()}`, version: draft.version, ts: new Date().toISOString(), label: `Saved ${draft.metadata.revision}`, snapshot: draft };
    dispatch({ type: "snapshotVersion", v });
    dispatch({ type: "setDraftStatus", status: "Saved" });
    audit("Draft saved.");
  };
  const submitReview = () => {
    dispatch({ type: "setDraftStatus", status: "Submitted" });
    audit("Draft submitted for review.");
  };
  const downloadText = () => {
    if (!draft) return;
    const body = draft.sections.map((s) => `${s.label.toUpperCase()}\n${s.body || "(pending)"}\n`).join("\n");
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${draft.metadata.sowNumber || "sow"}.txt`; a.click();
    URL.revokeObjectURL(url);
    audit("Downloaded draft as text.");
  };
  const exportEvidencePack = () => {
    const lines = [
      "EVIDENCE PACK",
      ...includedEvidence.map((d) => ` - ${d.title} [${d.type}] · ${d.authority} · ${d.purpose}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "evidence_pack.txt"; a.click(); URL.revokeObjectURL(url);
    audit("Exported evidence pack.");
  };

  const providerBadge = state.provider === "mock" ? "Mock intelligence" : null;

  return (
    <div className="space-y-3">
      {/* Top action bar (minimal — plan v3 C5) */}
      <div className="rounded-xl border bg-card px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="min-w-0 flex items-center gap-3 flex-wrap">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SOW Draft Studio</div>
          <div className="text-sm font-semibold truncate">{draft?.metadata.sowNumber || "New SOW"}</div>
          {draft && (
            <div className="flex items-center gap-1 text-[10px]">
              <Chip>{draft.metadata.revision}</Chip>
              <Chip tone="info">{draft.metadata.status}</Chip>
              <Chip>{draft.metadata.applicability}</Chip>
              <Chip>Owner: {draft.metadata.owner}</Chip>
              {draft.metadata.effectiveDate && <Chip>Effective {draft.metadata.effectiveDate}</Chip>}
              <button className="ml-1 text-accent2 hover:underline text-[10px]" onClick={() => setDrawer("details")}>Details</button>
            </div>
          )}
          {providerBadge && <span className="text-[10px] rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">{providerBadge}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <ActionBtn onClick={saveDraft} disabled={!draft} icon={<Save className="h-3.5 w-3.5" />} label="Save Draft" />
          <ActionBtn onClick={submitReview} disabled={!draft} icon={<Send className="h-3.5 w-3.5" />} label="Submit for Review" />
          <div className="relative">
            <ActionBtn onClick={() => setExportOpen((v) => !v)} disabled={!draft} icon={<Download className="h-3.5 w-3.5" />} label={<span className="inline-flex items-center gap-1">Export <ChevronDown className="h-3 w-3" /></span>} />
            {exportOpen && draft && (
              <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover shadow-md z-20 text-xs">
                <MenuItem onClick={() => { audit("Saved to workspace."); setExportOpen(false); }}>Save to Workspace</MenuItem>
                <MenuItem onClick={() => { audit("Saved to Drive (demo)."); setExportOpen(false); }}>Save to Drive</MenuItem>
                <MenuItem onClick={() => { downloadText(); setExportOpen(false); }}>Download DOCX</MenuItem>
                <MenuItem onClick={() => { downloadText(); setExportOpen(false); }}>Download PDF</MenuItem>
                <MenuItem onClick={() => { exportEvidencePack(); setExportOpen(false); }}>Export Evidence Pack</MenuItem>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress counter */}
      {genProgress && (
        <div className="rounded-md border bg-accent2/5 px-3 py-2 text-[11px] flex items-center gap-3">
          <Sparkles className="h-3.5 w-3.5 text-accent2 animate-pulse" />
          <span className="font-medium">Generating {genProgress.current} of {genProgress.total} sections…</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-xs">
            <div className="h-full bg-accent2 transition-all" style={{ width: `${(genProgress.current / genProgress.total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-3">
        {/* Left rail (dual-mode) */}
        <aside className="col-span-12 lg:col-span-3 rounded-xl border bg-card overflow-hidden">
          <div className="border-b p-1 flex">
            <RailTab active={state.railMode === "evidence"} onClick={() => dispatch({ type: "setRailMode", mode: "evidence" })}>Evidence</RailTab>
            <RailTab active={state.railMode === "outline"} onClick={() => dispatch({ type: "setRailMode", mode: "outline" })} disabled={!draft}>Outline</RailTab>
          </div>
          <div className="p-2 max-h-[520px] overflow-auto">
            {state.railMode === "evidence" ? (
              includedEvidence.length ? includedEvidence.map((d) => (
                <div key={d.id} className="text-[11px] p-1.5 rounded hover:bg-muted flex items-start gap-1.5">
                  <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.title}</div>
                    <div className="text-[9px] text-muted-foreground">{d.type} · {d.authority}</div>
                  </div>
                </div>
              )) : <div className="text-[11px] text-muted-foreground p-2">No evidence selected. Go to Evidence & Intelligence to include documents.</div>
            ) : (
              draft ? draft.sections.map((s) => (
                <button key={s.id} onClick={() => document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="w-full text-left text-[11px] px-1.5 py-1 rounded hover:bg-muted flex items-center justify-between">
                  <span>{s.label}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${statusClass(s.status)}`}>{statusLabel(s.status)}</span>
                </button>
              )) : <div className="text-[11px] text-muted-foreground p-2">Outline appears after generation.</div>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <div className="col-span-12 lg:col-span-7 rounded-xl border bg-white min-h-[600px]">
          {!draft ? (
            <EmptyState canGenerate={canGenerate} evidenceCount={includedEvidence.length} packs={selectedPacks} setPacks={setSelectedPacks} onGenerate={startGenerate} />
          ) : (
            <div className="p-6 space-y-6">
              {draft.sections.sort((a, b) => a.order - b.order).map((s) => (
                <SectionBlock key={s.id} section={s}
                  onSelect={() => { setSelectedSuggestionId(s.suggestions[0]?.id ?? null); setDrawer("ai"); }}
                  onEdit={(body) => { dispatch({ type: "editSectionBody", sectionId: s.id, body }); }}
                  onApprove={() => { dispatch({ type: "upsertSection", section: { ...s, status: "accepted" } }); audit(`Approved section ${s.label}.`); }}
                  onMoreAction={(action) => handleMore(action, s)}
                  onSuggestionSelect={(sid) => { setSelectedSuggestionId(sid); setDrawer("ai"); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right drawer rail */}
        <aside className="col-span-12 lg:col-span-2 rounded-xl border bg-card p-1 flex lg:flex-col gap-0.5 h-fit">
          <DrawerIcon icon={<Sparkles className="h-4 w-4" />} label="AI Review" active={drawer === "ai"} onClick={() => setDrawer(drawer === "ai" ? null : "ai")} />
          <DrawerIcon icon={<MessageSquare className="h-4 w-4" />} label="Comments" active={drawer === "comments"} onClick={() => setDrawer(drawer === "comments" ? null : "comments")} />
          <DrawerIcon icon={<Users className="h-4 w-4" />} label="Collaborators" active={drawer === "collaborators"} onClick={() => setDrawer(drawer === "collaborators" ? null : "collaborators")} />
          <DrawerIcon icon={<ClipboardList className="h-4 w-4" />} label="Reviewers" active={drawer === "reviewers"} onClick={() => setDrawer(drawer === "reviewers" ? null : "reviewers")} />
          <DrawerIcon icon={<ShieldCheck className="h-4 w-4" />} label="Approvers" active={drawer === "approvers"} onClick={() => setDrawer(drawer === "approvers" ? null : "approvers")} />
          <DrawerIcon icon={<BookOpen className="h-4 w-4" />} label="Evidence" active={drawer === "evidence"} onClick={() => setDrawer(drawer === "evidence" ? null : "evidence")} />
          <DrawerIcon icon={<History className="h-4 w-4" />} label="Section History" active={drawer === "sectionHistory"} onClick={() => setDrawer(drawer === "sectionHistory" ? null : "sectionHistory")} />
          <DrawerIcon icon={<History className="h-4 w-4" />} label="Versions" active={drawer === "versions"} onClick={() => setDrawer(drawer === "versions" ? null : "versions")} />
          <DrawerIcon icon={<ClipboardList className="h-4 w-4" />} label="Audit" active={drawer === "audit"} onClick={() => setDrawer(drawer === "audit" ? null : "audit")} />
          <DrawerIcon icon={<Info className="h-4 w-4" />} label="Document Details" active={drawer === "details"} onClick={() => setDrawer(drawer === "details" ? null : "details")} />
        </aside>
      </div>

      {/* Drawer sheet */}
      {drawer && (
        <DrawerSheet onClose={() => setDrawer(null)}>
          {drawer === "ai" && <AiReviewDrawer selectedId={selectedSuggestionId} onAccept={acceptSuggestion} onReject={rejectSuggestion} onSetSelected={setSelectedSuggestionId} />}
          {drawer === "comments" && <CommentsDrawer />}
          {drawer === "collaborators" && <CollaboratorsDrawer />}
          {drawer === "reviewers" && <ReviewersDrawer />}
          {drawer === "approvers" && <ApproversDrawer />}
          {drawer === "evidence" && <EvidenceDetailsDrawer />}
          {drawer === "sectionHistory" && <SectionHistoryDrawer />}
          {drawer === "versions" && <VersionsDrawer />}
          {drawer === "audit" && <AuditDrawer />}
          {drawer === "details" && <DetailsDrawer />}
        </DrawerSheet>
      )}
    </div>
  );

  function handleMore(action: string, s: DraftSection) {
    switch (action) {
      case "reject": dispatch({ type: "upsertSection", section: { ...s, status: "conflict" } }); audit(`Rejected section ${s.label}.`); break;
      case "sendReview": dispatch({ type: "upsertSection", section: { ...s, status: "review" } }); audit(`Section ${s.label} sent for review.`); break;
      case "regen": (async () => {
        const provider = await getProvider();
        const refined = await provider.refineSection({ section: s, instruction: "Regenerate from evidence", evidence: includedEvidence });
        dispatch({ type: "upsertSection", section: refined });
        audit(`Regenerated ${s.label} from evidence.`, "AI");
      })(); break;
      case "comment": setDrawer("comments"); break;
      case "history": setDrawer("sectionHistory"); break;
      case "restore": audit(`Restore-previous-version requested for ${s.label} (no prior version).`); break;
    }
  }
}

// ---------- Empty state ----------

function EmptyState({ canGenerate, evidenceCount, packs, setPacks, onGenerate }: { canGenerate: boolean; evidenceCount: number; packs: string[]; setPacks: (p: string[]) => void; onGenerate: () => void }) {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Start a new SOW draft</h3>
      <Step n={1} title="Confirm evidence" done={canGenerate} desc={`${evidenceCount} document${evidenceCount === 1 ? "" : "s"} included${canGenerate ? " · confirmed" : " · not yet confirmed"}`} />
      <Step n={2} title="Choose template & section packs" done={canGenerate}
        desc={
          <div className="space-y-2">
            <div className="rounded border p-2 bg-slate-50 text-xs">
              <div className="font-medium">Template: {industrialMaintenanceTemplate.name}</div>
              <div className="text-muted-foreground">{industrialMaintenanceTemplate.description}</div>
            </div>
            <div className="space-y-1">
              {sectionPacks.map((p) => {
                const on = packs.includes(p.id);
                return (
                  <label key={p.id} className="flex items-start gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => setPacks(on ? packs.filter((x) => x !== p.id) : [...packs, p.id])} className="mt-0.5" />
                    <span><span className="font-medium">{p.name}</span> — <span className="text-muted-foreground">{p.description}</span></span>
                  </label>
                );
              })}
            </div>
          </div>
        }
      />
      <Step n={3} title="Generate SOW" done={false}
        desc={
          <button onClick={onGenerate} disabled={!canGenerate} className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md ${canGenerate ? "bg-accent2 text-white hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
            <Sparkles className="h-3.5 w-3.5" /> Generate SOW
          </button>
        }
      />
      {!canGenerate && <p className="text-[11px] text-muted-foreground">Confirm the evidence set in the Evidence & Intelligence tab to enable generation.</p>}
    </div>
  );
}

function Step({ n, title, done, desc }: { n: number; title: string; done: boolean; desc: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className={`h-6 w-6 rounded-full grid place-items-center text-xs font-semibold ${done ? "bg-emerald-600 text-white" : "bg-muted text-foreground"}`}>{done ? "✓" : n}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
    </div>
  );
}

// ---------- Section block ----------

function SectionBlock({ section, onSelect, onEdit, onApprove, onMoreAction, onSuggestionSelect }: {
  section: DraftSection;
  onSelect: () => void;
  onEdit: (body: string) => void;
  onApprove: () => void;
  onMoreAction: (a: string) => void;
  onSuggestionSelect: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [more, setMore] = useState(false);
  const [draft, setDraft] = useState(section.body);
  useEffect(() => setDraft(section.body), [section.body]);

  return (
    <section id={`sec-${section.id}`} className="group">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{section.label}</h4>
        <span className={`text-[9px] px-1 py-0.5 rounded ${statusClass(section.status)}`}>{statusLabel(section.status)}</span>
        {section.required && <span className="text-[9px] text-muted-foreground">Required</span>}
      </div>

      {section.status === "generating" ? (
        <div className="mt-2 space-y-1 animate-pulse">
          <div className="h-3 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
        </div>
      ) : editing ? (
        <div className="mt-1">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full text-sm border rounded p-2 min-h-[100px]" />
          <div className="mt-1 flex gap-1">
            <button onClick={() => { onEdit(draft); setEditing(false); }} className="text-[10px] px-2 py-1 rounded bg-accent2 text-white">Save</button>
            <button onClick={() => { setDraft(section.body); setEditing(false); }} className="text-[10px] px-2 py-1 rounded border">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap text-slate-800">{section.body || "(pending)"}</p>
      )}

      {section.suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {section.suggestions.map((s) => (
            <button key={s.id} onClick={() => onSuggestionSelect(s.id)} className="w-full text-left text-[11px] rounded border-l-2 border-amber-400 bg-amber-50 hover:bg-amber-100 pl-2 pr-2 py-1">
              <span className="font-medium text-amber-900">{s.classification}</span>
              <span className="text-slate-600"> · {truncate(s.after, 90)}</span>
              <span className="text-[10px] text-slate-500 float-right">{s.status === "pending" ? "pending" : s.status}</span>
            </button>
          ))}
        </div>
      )}

      {/* Minimal per-section actions (plan v3 C4) */}
      {section.status !== "generating" && (
        <div className="mt-2 flex items-center gap-1 text-[10px] opacity-70 group-hover:opacity-100 transition">
          <SecBtn onClick={() => setEditing((v) => !v)}>Edit</SecBtn>
          <SecBtn onClick={onApprove}>Approve Section</SecBtn>
          <SecBtn onClick={onSelect}><Wand2 className="h-3 w-3 inline" /> AI Refine</SecBtn>
          <SecBtn onClick={onSelect}><LinkIcon className="h-3 w-3 inline" /> View Sources</SecBtn>
          <div className="relative">
            <SecBtn onClick={() => setMore((v) => !v)}><MoreHorizontal className="h-3 w-3 inline" /> More</SecBtn>
            {more && (
              <div className="absolute left-0 mt-1 w-56 rounded-md border bg-popover shadow-md z-10 text-[11px]">
                <MenuItem onClick={() => { onMoreAction("reject"); setMore(false); }}>Reject</MenuItem>
                <MenuItem onClick={() => { onMoreAction("sendReview"); setMore(false); }}>Send for Review</MenuItem>
                <MenuItem onClick={() => { onMoreAction("regen"); setMore(false); }}>Regenerate from Evidence</MenuItem>
                <MenuItem onClick={() => { onMoreAction("comment"); setMore(false); }}>Add Comment</MenuItem>
                <MenuItem onClick={() => { onMoreAction("history"); setMore(false); }}>View Section History</MenuItem>
                <MenuItem onClick={() => { onMoreAction("restore"); setMore(false); }}>Restore Previous Version</MenuItem>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- Drawers ----------

function DrawerSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute right-0 top-0 h-full w-[420px] bg-card border-l shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function AiReviewDrawer({ selectedId, onAccept, onReject, onSetSelected }: {
  selectedId: string | null;
  onAccept: (sec: DraftSection, s: SuggestedChange) => void;
  onReject: (sec: DraftSection, s: SuggestedChange) => void;
  onSetSelected: (id: string) => void;
}) {
  const { state, dispatch, audit } = useWorkspace();
  const draft = state.draft;
  if (!draft) return <p className="text-xs text-muted-foreground">Generate a draft to see AI suggestions.</p>;
  const all = draft.sections.flatMap((s) => s.suggestions.map((sg) => ({ sec: s, sg })));
  const current = all.find((x) => x.sg.id === selectedId) ?? all[0];
  if (!current) return <p className="text-xs text-muted-foreground">No suggestions yet.</p>;
  const { sec, sg } = current;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="h-4 w-4 text-accent2" /> AI Review</div>
      <div className="flex flex-wrap gap-1 text-[10px]">
        {all.map(({ sg: g }) => (
          <button key={g.id} onClick={() => onSetSelected(g.id)} className={`px-1.5 py-0.5 rounded border ${g.id === sg.id ? "bg-accent2 text-white border-accent2" : "hover:bg-muted"}`}>{g.classification}</button>
        ))}
      </div>
      <div className="rounded border p-2 space-y-2 text-[11px]">
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${classCls(sg.classification)}`}>{sg.classification}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{sg.governance}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{sec.label}</span>
        </div>
        {sg.kind !== "insert" && sg.before && (
          <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Before</div><div className="text-slate-500 line-through">{sg.before}</div></div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">After</div>
          <div className="text-emerald-700">{sg.after}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Why</div>
          <div>{sg.why}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Source evidence</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {sg.sourceEvidenceIds.map((id) => (
              <span key={id} className="text-[10px] rounded border border-source-border bg-source/60 text-source-foreground px-1.5 py-0.5">{state.documents[id]?.title ?? id}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 pt-1">
          <button onClick={() => onAccept(sec, sg)} className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white"><Check className="h-3 w-3" /> Accept</button>
          <button onClick={() => onReject(sec, sg)} className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white"><X className="h-3 w-3" /> Reject</button>
          <button onClick={() => {
            const modified = window.prompt("Modify the proposed text:", sg.after);
            if (modified != null) {
              dispatch({ type: "decideSuggestion", sectionId: sec.id, suggestionId: sg.id, decision: "modified", overrideAfter: modified });
              audit(`Modified "${sg.classification}" in ${sec.label}.`);
            }
          }} className="text-[11px] px-2 py-1 rounded border">Modify</button>
        </div>
      </div>
    </div>
  );
}

function CommentsDrawer() {
  const { state, dispatch, audit } = useWorkspace();
  const [text, setText] = useState("");
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Comments</div>
      <div className="space-y-1 max-h-72 overflow-auto">
        {state.comments.length ? state.comments.map((c) => (
          <div key={c.id} className={`rounded border p-1.5 text-[11px] ${c.state === "resolved" ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between"><span className="font-medium">{c.authorName}</span>{c.state === "open" && <button onClick={() => { dispatch({ type: "resolveComment", id: c.id }); audit("Comment resolved."); }} className="text-[10px] text-accent2">Resolve</button>}</div>
            <div>{c.text}</div>
          </div>
        )) : <p className="text-[11px] text-muted-foreground">No comments yet.</p>}
      </div>
      <div className="flex gap-1">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add comment… use @ to mention" className="flex-1 text-[11px] border rounded px-2 py-1" />
        <button onClick={() => {
          if (!text.trim()) return;
          const mentions = Array.from(text.matchAll(/@(\w+)/g)).map((m) => m[1]);
          dispatch({ type: "addComment", comment: { id: `c-${Date.now()}`, scope: "document", author: "u-owner", authorName: "You", text, mentions, state: "open", createdAt: new Date().toISOString() } });
          audit("Comment added.");
          setText("");
        }} className="text-[10px] px-2 rounded border">Post</button>
      </div>
    </div>
  );
}

function CollaboratorsDrawer() {
  const { state, dispatch, audit } = useWorkspace();
  const [name, setName] = useState(""); const [access, setAccess] = useState<"view" | "comment" | "edit">("comment");
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Collaborators</div>
      <div className="space-y-1">
        {state.collaborators.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-[11px] border rounded p-1.5">
            <div><div className="font-medium">{c.name}</div><div className="text-[10px] text-muted-foreground">{c.role}</div></div>
            <select value={c.access} onChange={(e) => { const to = e.target.value as typeof access; dispatch({ type: "changeCollaboratorAccess", id: c.id, access: to }); dispatch({ type: "logCollabAudit", e: { id: `ca-${Date.now()}`, ts: new Date().toISOString(), actor: "You", action: "access-changed", target: c.id, from: c.access, to } }); audit(`Changed ${c.name} access to ${to}.`); }} className="text-[10px] border rounded px-1 py-0.5 bg-background">
              <option value="view">view</option><option value="comment">comment</option><option value="edit">edit</option>
            </select>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name or email" className="flex-1 text-[11px] border rounded px-2 py-1" />
        <select value={access} onChange={(e) => setAccess(e.target.value as typeof access)} className="text-[10px] border rounded px-1 bg-background">
          <option value="view">view</option><option value="comment">comment</option><option value="edit">edit</option>
        </select>
        <button onClick={() => {
          if (!name.trim()) return;
          const id = `col-${Date.now()}`; const now = new Date().toISOString();
          dispatch({ type: "addCollaborator", c: { id, name, role: "Collaborator", access, addedBy: "You", addedAt: now } });
          dispatch({ type: "logCollabAudit", e: { id: `ca-${Date.now()}`, ts: now, actor: "You", action: "added", target: id, to: access } });
          audit(`Added collaborator ${name} (${access}).`);
          setName("");
        }} className="text-[10px] px-2 rounded border">Add</button>
      </div>
    </div>
  );
}

function ReviewersDrawer() {
  const { state, dispatch, audit } = useWorkspace();
  const [name, setName] = useState("");
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Reviewers (informal input)</div>
      {state.reviewers.map((r) => (
        <div key={r.id} className="text-[11px] border rounded p-1.5 flex items-center justify-between">
          <span>{r.reviewer}</span><span className="text-[10px] text-muted-foreground">{r.state}</span>
        </div>
      ))}
      <div className="flex gap-1">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reviewer name" className="flex-1 text-[11px] border rounded px-2 py-1" />
        <button onClick={() => { if (!name.trim()) return; dispatch({ type: "addReviewer", r: { id: `rv-${Date.now()}`, reviewer: name, state: "assigned", assignedBy: "You", assignedAt: new Date().toISOString() } }); audit(`Assigned reviewer ${name}.`); setName(""); }} className="text-[10px] px-2 rounded border">Assign</button>
      </div>
    </div>
  );
}

function ApproversDrawer() {
  const { state, dispatch, audit } = useWorkspace();
  const [name, setName] = useState(""); const [role, setRole] = useState<"Legal" | "Finance" | "Procurement" | "Signatory" | "Business SME">("Legal");
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Approvers (formal sign-off)</div>
      {state.approvers.map((a) => {
        const rec = state.approvals.find((r) => r.assignmentId === a.id);
        return (
          <div key={a.id} className="text-[11px] border rounded p-1.5 flex items-center justify-between gap-2">
            <div><div className="font-medium">{a.approver}</div><div className="text-[10px] text-muted-foreground">{a.role}</div></div>
            {rec ? <span className={`text-[10px] rounded px-1.5 py-0.5 ${rec.decision === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{rec.decision}</span> : (
              <button onClick={() => {
                const versionId = state.versions[0]?.id ?? `v-live-${Date.now()}`;
                dispatch({ type: "recordApproval", r: { id: `ap-${Date.now()}`, assignmentId: a.id, decision: "approved", approver: a.approver, role: a.role, decidedAt: new Date().toISOString(), documentVersionId: versionId } });
                audit(`${a.approver} (${a.role}) approved.`);
              }} className="text-[10px] px-2 py-0.5 rounded bg-accent2 text-white">Approve</button>
            )}
          </div>
        );
      })}
      <div className="flex gap-1">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Approver name" className="flex-1 text-[11px] border rounded px-2 py-1" />
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="text-[10px] border rounded px-1 bg-background">
          {(["Legal","Finance","Procurement","Signatory","Business SME"] as const).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={() => { if (!name.trim()) return; dispatch({ type: "addApprover", a: { id: `apx-${Date.now()}`, role, approver: name, scope: "document" } }); audit(`Requested approval from ${name} (${role}).`); setName(""); }} className="text-[10px] px-2 rounded border">Assign</button>
      </div>
    </div>
  );
}

function EvidenceDetailsDrawer() {
  const { state, filteredDocs } = useWorkspace();
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Evidence details</div>
      <div className="text-[11px] text-muted-foreground">{filteredDocs.filter((d) => d.included).length} included of {Object.keys(state.documents).length} total</div>
      <div className="space-y-1 max-h-96 overflow-auto">
        {filteredDocs.filter((d) => d.included).map((d) => (
          <div key={d.id} className="border rounded p-1.5 text-[11px]"><div className="font-medium">{d.title}</div><div className="text-[10px] text-muted-foreground">{d.type} · {d.authority} · {d.purpose}</div></div>
        ))}
      </div>
    </div>
  );
}

function SectionHistoryDrawer() {
  const { state } = useWorkspace();
  const events = state.draft?.sections.flatMap((s) => s.history.map((h) => ({ ...h, section: s.label }))) ?? [];
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Section history</div>
      <div className="space-y-1 max-h-96 overflow-auto">
        {events.length ? events.map((e) => (
          <div key={e.id} className="border-l-2 border-slate-200 pl-2 py-1 text-[11px]">
            <div>{e.section} — {e.summary}</div>
            <div className="text-[9px] text-muted-foreground">{new Date(e.ts).toLocaleString()} · {e.actor}</div>
          </div>
        )) : <p className="text-[11px] text-muted-foreground">No section events yet.</p>}
      </div>
    </div>
  );
}

function VersionsDrawer() {
  const { state } = useWorkspace();
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Document versions</div>
      {state.versions.length ? state.versions.map((v) => (
        <div key={v.id} className="border rounded p-1.5 text-[11px]"><div className="font-medium">{v.label}</div><div className="text-[10px] text-muted-foreground">{new Date(v.ts).toLocaleString()}</div></div>
      )) : <p className="text-[11px] text-muted-foreground">No saved versions.</p>}
    </div>
  );
}

function AuditDrawer() {
  const { state } = useWorkspace();
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Audit trail</div>
      <div className="max-h-96 overflow-auto space-y-1">
        {state.audit.map((e) => (
          <div key={e.id} className="border-l-2 border-slate-200 pl-2 py-1 text-[11px]">
            <div>{e.text}</div>
            <div className="text-[9px] text-muted-foreground">{new Date(e.ts).toLocaleString()} · {e.actor} · {e.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailsDrawer() {
  const { state } = useWorkspace();
  const m = state.draft?.metadata;
  if (!m) return <p className="text-[11px] text-muted-foreground">No draft.</p>;
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">Document details</div>
      <dl className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px]">
        {Object.entries(m).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd>{String(v)}</dd></div>
        ))}
      </dl>
    </div>
  );
}

// ---------- Tiny UI atoms ----------

function ActionBtn({ icon, label, onClick, disabled }: { icon?: React.ReactNode; label: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md border transition ${disabled ? "opacity-50 cursor-not-allowed" : "bg-background hover:bg-muted"}`}>
      {icon}{label}
    </button>
  );
}
function SecBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="text-[10px] px-1.5 py-0.5 rounded border hover:bg-muted">{children}</button>;
}
function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="block w-full text-left px-2 py-1.5 hover:bg-muted">{children}</button>;
}
function Chip({ children, tone }: { children: React.ReactNode; tone?: "info" }) {
  const cls = tone === "info" ? "bg-accent2/15 text-accent2" : "bg-slate-100 text-slate-700";
  return <span className={`px-1.5 py-0.5 rounded ${cls}`}>{children}</span>;
}
function RailTab({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button disabled={disabled} onClick={onClick} className={`flex-1 text-[11px] py-1 rounded ${active ? "bg-accent2 text-white" : disabled ? "text-muted-foreground/50" : "text-muted-foreground hover:text-foreground"}`}>{children}</button>;
}
function DrawerIcon({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] ${active ? "bg-accent2/15 text-accent2" : "text-muted-foreground hover:bg-muted"}`}>
      {icon}<span className="hidden xl:inline">{label}</span>
    </button>
  );
}
function statusClass(s: DraftSection["status"]) {
  switch (s) {
    case "generating": return "bg-slate-200 text-slate-700 animate-pulse";
    case "ai": return "bg-indigo-100 text-indigo-800";
    case "review": return "bg-amber-100 text-amber-800";
    case "accepted": return "bg-emerald-100 text-emerald-800";
    case "conflict": return "bg-rose-100 text-rose-800";
    case "edited": return "bg-slate-100 text-slate-700";
    case "empty": default: return "bg-slate-100 text-slate-500";
  }
}
function statusLabel(s: DraftSection["status"]) {
  return s === "generating" ? "Generating…" : s === "ai" ? "AI draft" : s === "review" ? "Needs review" : s === "accepted" ? "Approved" : s === "conflict" ? "Rejected" : s === "edited" ? "Edited" : "Empty";
}
function classCls(c: SuggestedChange["classification"]) {
  switch (c) {
    case "Gap": return "bg-amber-100 text-amber-800";
    case "Conflict": return "bg-red-100 text-red-800";
    case "Fallback Clause": return "bg-indigo-100 text-indigo-800";
    case "Value Protection": return "bg-emerald-100 text-emerald-800";
    case "Needs Review": return "bg-slate-200 text-slate-800";
    case "Covered": return "bg-slate-100 text-slate-600";
    case "Variant": return "bg-sky-100 text-sky-800";
    case "Redline Risk": return "bg-rose-100 text-rose-800";
  }
}
function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + "…" : s; }

// unused imports guard
export const __drawerIconUnused = PanelRight;
