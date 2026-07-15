import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type {
  AuditEvent, Collaborator, CollaboratorAccess, CollaboratorAuditEvent, Comment,
  DraftDocument, DraftMetadata, DraftSection, DraftStatus, DocumentVersion,
  EvidenceDocument, EvidenceFilters, EvidenceSet, ReviewerAssignment, ReviewScope,
  SectionRevision, SuggestedChange, WorkspaceState,
} from "./types";
import { seedEvidenceDocs } from "@/lib/seeds/evidencePack";
import { industrialMaintenanceTemplate, sectionPacks } from "@/lib/seeds/templates";
import { getProvider } from "@/lib/providers/documentIntelligence";

const CURRENT_USER = "Procurement Buyer";
const CURRENT_USER_HANDLE = "buyer";

const emptyFilters: EvidenceFilters = {
  search: "", sources: [], authorities: [], purposes: [], types: [],
  regions: [], topics: [], vendors: [],
};

function makeInitial(requestId: string): WorkspaceState {
  const docs = Object.fromEntries(seedEvidenceDocs.map((d) => [d.id, { ...d }]));
  const now = new Date().toISOString();
  return {
    requestId,
    documents: docs,
    evidenceSet: {
      id: `es-${requestId}`, requestId, createdAt: now, updatedAt: now,
      documentIds: seedEvidenceDocs.map((d) => d.id),
      filters: { ...emptyFilters },
      confirmed: false,
    },
    draft: null,
    collaborators: [
      { id: "c1", name: "Procurement Buyer", role: "Owner", access: "edit", addedBy: "System", addedAt: now },
      { id: "c2", name: "Legal Reviewer", role: "Legal", access: "comment", addedBy: "System", addedAt: now },
    ],
    collaboratorAudit: [],
    comments: [],
    reviewers: [],
    approvers: [],
    approvals: [],
    versions: [],
    audit: [{ id: `a-${Date.now()}`, ts: now, actor: "System", source: "System", text: "Workspace initialized." }],
    provider: "mock",
    railMode: "evidence",
  };
}

type Action =
  | { type: "HYDRATE"; state: WorkspaceState }
  | { type: "SET_FILTERS"; filters: Partial<EvidenceFilters> }
  | { type: "TOGGLE_INCLUDE"; docId: string }
  | { type: "SET_INCLUDE_MANY"; docIds: string[]; included: boolean }
  | { type: "UPLOAD_EVIDENCE"; doc: EvidenceDocument }
  | { type: "CONFIRM_EVIDENCE_SET"; summary: EvidenceSet["summary"] }
  | { type: "START_DRAFT"; draft: DraftDocument }
  | { type: "APPEND_SECTION"; section: DraftSection }
  | { type: "SET_DRAFT_STATUS"; status: DraftStatus }
  | { type: "EDIT_SECTION_BODY"; sectionId: string; body: string; actor?: string }
  | { type: "REORDER_SECTION"; sectionId: string; direction: "up" | "down" }
  | { type: "REMOVE_SECTION"; sectionId: string }
  | { type: "ADD_SECTION"; section: DraftSection }
  | { type: "SET_SUGGESTION_STATUS"; sectionId: string; suggestionId: string; status: SuggestedChange["status"]; editedProposedText?: string }
  | { type: "ADD_SUGGESTION"; sectionId: string; suggestion: SuggestedChange }
  | { type: "SAVE_VERSION"; version: DocumentVersion }
  | { type: "UPDATE_METADATA"; meta: Partial<DraftMetadata> }
  | { type: "ADD_COMMENT"; comment: Comment }
  | { type: "RESOLVE_COMMENT"; commentId: string; actor: string }
  | { type: "ADD_REVIEWER"; assignment: ReviewerAssignment }
  | { type: "UPDATE_REVIEWER"; id: string; state: ReviewerAssignment["state"]; notes?: string }
  | { type: "ADD_COLLABORATOR"; collab: Collaborator }
  | { type: "REMOVE_COLLABORATOR"; id: string }
  | { type: "SET_COLLAB_ACCESS"; id: string; access: CollaboratorAccess }
  | { type: "SET_RAIL"; rail: "evidence" | "outline" }
  | { type: "ISSUE_TO_VENDOR"; vendor: string }
  | { type: "AUDIT"; event: AuditEvent }
  | { type: "RESET" };

function withUpdatedDraft(state: WorkspaceState, mut: (d: DraftDocument) => DraftDocument): WorkspaceState {
  if (!state.draft) return state;
  return { ...state, draft: { ...mut(state.draft), updatedAt: new Date().toISOString() } };
}
function updateSection(draft: DraftDocument, id: string, mut: (s: DraftSection) => DraftSection): DraftDocument {
  return { ...draft, sections: draft.sections.map((s) => (s.id === id ? mut(s) : s)) };
}
function nowIso() { return new Date().toISOString(); }
function auditEvt(actor: string, source: AuditEvent["source"], text: string, refId?: string): AuditEvent {
  return { id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: nowIso(), actor, source, text, refId };
}

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "HYDRATE": return action.state;
    case "RESET": return makeInitial(state.requestId);
    case "SET_FILTERS":
      return { ...state, evidenceSet: { ...state.evidenceSet, filters: { ...state.evidenceSet.filters, ...action.filters }, updatedAt: nowIso() } };
    case "TOGGLE_INCLUDE": {
      const d = state.documents[action.docId]; if (!d) return state;
      return { ...state, documents: { ...state.documents, [action.docId]: { ...d, included: !d.included } } };
    }
    case "SET_INCLUDE_MANY": {
      const next = { ...state.documents };
      action.docIds.forEach((id) => { if (next[id]) next[id] = { ...next[id], included: action.included }; });
      return { ...state, documents: next };
    }
    case "UPLOAD_EVIDENCE":
      return {
        ...state,
        documents: { ...state.documents, [action.doc.id]: action.doc },
        evidenceSet: { ...state.evidenceSet, documentIds: [...state.evidenceSet.documentIds, action.doc.id], updatedAt: nowIso() },
        audit: [auditEvt(CURRENT_USER, "Human", `Uploaded evidence "${action.doc.title}"`), ...state.audit],
      };
    case "CONFIRM_EVIDENCE_SET":
      return { ...state, evidenceSet: { ...state.evidenceSet, confirmed: true, summary: action.summary, updatedAt: nowIso() } };
    case "START_DRAFT":
      return { ...state, draft: action.draft,
        audit: [auditEvt("AI", "AI", `Started draft generation from ${state.evidenceSet.documentIds.filter((id) => state.documents[id]?.included).length} evidence sources.`), ...state.audit],
      };
    case "APPEND_SECTION":
      return withUpdatedDraft(state, (d) => ({ ...d, sections: [...d.sections, action.section] }));
    case "SET_DRAFT_STATUS":
      return withUpdatedDraft(state, (d) => ({ ...d, status: action.status, metadata: { ...d.metadata, status: action.status, updatedAt: nowIso() } }));
    case "EDIT_SECTION_BODY": {
      const actor = action.actor ?? CURRENT_USER;
      return withUpdatedDraft(state, (d) => updateSection(d, action.sectionId, (s) => {
        if (s.currentBody === action.body) return s;
        const rev: SectionRevision = {
          id: `r-${Date.now()}`, ts: nowIso(), actor, kind: "content",
          summary: "Inline edit", before: s.currentBody, after: action.body,
        };
        return { ...s, currentBody: action.body, status: s.status === "ai" ? "edited" : s.status, history: [rev, ...s.history] };
      }));
    }
    case "REORDER_SECTION":
      return withUpdatedDraft(state, (d) => {
        const list = [...d.sections].sort((a, b) => a.order - b.order);
        const idx = list.findIndex((s) => s.id === action.sectionId);
        if (idx < 0) return d;
        const swap = action.direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= list.length) return d;
        const a = list[idx], b = list[swap];
        const rev: SectionRevision = { id: `r-${Date.now()}`, ts: nowIso(), actor: CURRENT_USER, kind: "structural", summary: `Reordered ${a.label} ${action.direction}` };
        const map = new Map(list.map((s, i) => [s.id, i]));
        map.set(a.id, swap); map.set(b.id, idx);
        return { ...d, sections: d.sections.map((s) => ({ ...s, order: map.get(s.id) ?? s.order, history: s.id === a.id ? [rev, ...s.history] : s.history })) };
      });
    case "REMOVE_SECTION":
      return withUpdatedDraft(state, (d) => ({ ...d, sections: d.sections.filter((s) => s.id !== action.sectionId) }));
    case "ADD_SECTION":
      return withUpdatedDraft(state, (d) => ({ ...d, sections: [...d.sections, action.section] }));
    case "SET_SUGGESTION_STATUS": {
      const { sectionId, suggestionId, status, editedProposedText } = action;
      return withUpdatedDraft(state, (d) => updateSection(d, sectionId, (s) => {
        const target = s.suggestions.find((x) => x.id === suggestionId);
        if (!target || target.status !== "pending") return s;
        // Determine new body:
        let newBody = s.currentBody;
        let bodyChanged = false;
        if (status === "accepted" || status === "modified") {
          const text = editedProposedText ?? target.proposedText;
          if (target.kind === "insert") {
            newBody = s.currentBody ? `${s.currentBody}\n\n${text}` : text;
          } else if (target.kind === "replace") {
            newBody = target.before && s.currentBody.includes(target.before)
              ? s.currentBody.replace(target.before, text)
              : text;
          } else if (target.kind === "delete") {
            newBody = target.before ? s.currentBody.replace(target.before, "") : s.currentBody;
          }
          bodyChanged = newBody !== s.currentBody;
        }
        const rev: SectionRevision = {
          id: `r-${Date.now()}`, ts: nowIso(), actor: CURRENT_USER, kind: "suggestion",
          summary: `${status === "accepted" ? "Accepted" : status === "rejected" ? "Rejected" : "Modified"} suggestion: ${target.classification}`,
          before: bodyChanged ? s.currentBody : undefined,
          after: bodyChanged ? newBody : undefined,
        };
        return {
          ...s,
          currentBody: newBody,
          suggestions: s.suggestions.map((x) => x.id === suggestionId ? {
            ...x, status, editedProposedText: status === "modified" ? editedProposedText : undefined,
            decidedBy: CURRENT_USER, decidedAt: nowIso(),
          } : x),
          history: [rev, ...s.history],
          status: bodyChanged ? "edited" : s.status,
        };
      }));
    }
    case "ADD_SUGGESTION":
      return withUpdatedDraft(state, (d) => updateSection(d, action.sectionId, (s) => ({
        ...s, suggestions: [...s.suggestions, action.suggestion],
      })));
    case "SAVE_VERSION":
      return {
        ...state, versions: [action.version, ...state.versions],
        audit: [auditEvt(CURRENT_USER, "Human", `Saved ${action.version.label}`, action.version.id), ...state.audit],
      };
    case "UPDATE_METADATA":
      return withUpdatedDraft(state, (d) => ({ ...d, metadata: { ...d.metadata, ...action.meta, updatedAt: nowIso() } }));
    case "ADD_COMMENT":
      return { ...state, comments: [action.comment, ...state.comments],
        audit: [auditEvt(action.comment.authorName, "Human", `Comment on ${action.comment.scope === "section" ? "section " + action.comment.sectionId : "document"}`), ...state.audit] };
    case "RESOLVE_COMMENT":
      return { ...state, comments: state.comments.map((c) => c.id === action.commentId ? { ...c, state: "resolved", resolvedBy: action.actor, resolvedAt: nowIso() } : c) };
    case "ADD_REVIEWER":
      return { ...state, reviewers: [action.assignment, ...state.reviewers],
        audit: [auditEvt(CURRENT_USER, "Human", `Sent for review to ${action.assignment.reviewer} (${action.assignment.scope})`), ...state.audit] };
    case "UPDATE_REVIEWER":
      return { ...state, reviewers: state.reviewers.map((r) => r.id === action.id ? { ...r, state: action.state, notes: action.notes ?? r.notes, completedAt: action.state === "completed" ? nowIso() : r.completedAt } : r) };
    case "ADD_COLLABORATOR":
      return { ...state, collaborators: [...state.collaborators, action.collab],
        collaboratorAudit: [{ id: `ca-${Date.now()}`, ts: nowIso(), actor: CURRENT_USER, action: "added", target: action.collab.name }, ...state.collaboratorAudit] };
    case "REMOVE_COLLABORATOR": {
      const t = state.collaborators.find((c) => c.id === action.id);
      return { ...state, collaborators: state.collaborators.filter((c) => c.id !== action.id),
        collaboratorAudit: t ? [{ id: `ca-${Date.now()}`, ts: nowIso(), actor: CURRENT_USER, action: "removed", target: t.name }, ...state.collaboratorAudit] : state.collaboratorAudit };
    }
    case "SET_COLLAB_ACCESS": {
      const t = state.collaborators.find((c) => c.id === action.id);
      return { ...state, collaborators: state.collaborators.map((c) => c.id === action.id ? { ...c, access: action.access } : c),
        collaboratorAudit: t ? [{ id: `ca-${Date.now()}`, ts: nowIso(), actor: CURRENT_USER, action: "access-changed", target: t.name, from: t.access, to: action.access }, ...state.collaboratorAudit] : state.collaboratorAudit };
    }
    case "SET_RAIL": return { ...state, railMode: action.rail };
    case "ISSUE_TO_VENDOR":
      return withUpdatedDraft(state, (d) => ({ ...d, status: "IssuedToVendor", metadata: { ...d.metadata, status: "IssuedToVendor", issuedTo: action.vendor, issuedAt: nowIso() } }));
    case "AUDIT":
      return { ...state, audit: [action.event, ...state.audit] };
    default: return state;
  }
}

// ---------- Context ----------

interface WorkspaceApi {
  state: WorkspaceState;
  currentUser: string;
  currentUserHandle: string;
  // Evidence
  setFilters: (f: Partial<EvidenceFilters>) => void;
  toggleInclude: (id: string) => void;
  setIncludeMany: (ids: string[], included: boolean) => void;
  uploadEvidence: (partial: Omit<EvidenceDocument, "included" | "source" | "status">) => void;
  confirmEvidenceSet: () => void;
  // Draft
  generateDraft: (opts: { packIds: string[] }) => Promise<void>;
  regenerateSection: (sectionId: string, instruction: string) => Promise<void>;
  editSectionBody: (sectionId: string, body: string) => void;
  reorderSection: (sectionId: string, direction: "up" | "down") => void;
  removeSection: (sectionId: string) => void;
  addSection: (label: string, origin?: DraftSection["origin"]) => void;
  setSuggestionStatus: (sectionId: string, suggestionId: string, status: SuggestedChange["status"], editedProposedText?: string) => void;
  saveVersion: (label?: string, summary?: string) => DocumentVersion | null;
  issueToVendor: (vendor: string) => void;
  updateMetadata: (meta: Partial<DraftMetadata>) => void;
  // Collab
  addComment: (c: Omit<Comment, "id" | "createdAt" | "state" | "author" | "authorName">) => void;
  resolveComment: (id: string) => void;
  addReviewer: (opts: { scope: ReviewScope; sectionIds: string[]; reviewer: string; dueDate?: string; notes?: string }) => void;
  updateReviewer: (id: string, state: ReviewerAssignment["state"], notes?: string) => void;
  addCollaborator: (c: Omit<Collaborator, "id" | "addedBy" | "addedAt">) => void;
  removeCollaborator: (id: string) => void;
  setCollaboratorAccess: (id: string, access: CollaboratorAccess) => void;
  setRail: (r: "evidence" | "outline") => void;
  reset: () => void;
  // Derived
  includedEvidence: EvidenceDocument[];
  allEvidence: EvidenceDocument[];
}

const Ctx = createContext<WorkspaceApi | null>(null);
const STORAGE_PREFIX = "workspace-v3-";

export function WorkspaceProvider({ requestId, children }: { requestId: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, requestId, makeInitial);
  const hydrated = useRef(false);
  const key = STORAGE_PREFIX + requestId;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    } catch {}
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (hydrated.current) { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} } }, [state, key]);

  const api = useMemo<WorkspaceApi>(() => {
    const allEvidence = Object.values(state.documents);
    const includedEvidence = allEvidence.filter((d) => d.included);

    return {
      state, currentUser: CURRENT_USER, currentUserHandle: CURRENT_USER_HANDLE,
      allEvidence, includedEvidence,
      setFilters: (f) => dispatch({ type: "SET_FILTERS", filters: f }),
      toggleInclude: (id) => dispatch({ type: "TOGGLE_INCLUDE", docId: id }),
      setIncludeMany: (ids, included) => dispatch({ type: "SET_INCLUDE_MANY", docIds: ids, included }),
      uploadEvidence: (partial) => dispatch({ type: "UPLOAD_EVIDENCE", doc: {
        ...partial, source: "Uploaded", included: true, status: "Uploaded / Intake Complete",
        uploadedAt: nowIso(),
      } }),
      confirmEvidenceSet: async () => {
        const provider = await getProvider();
        const summary = provider.buildEvidenceSummary(includedEvidence);
        dispatch({ type: "CONFIRM_EVIDENCE_SET", summary });
      },
      generateDraft: async ({ packIds }) => {
        const provider = await getProvider();
        const template = industrialMaintenanceTemplate;
        const packs = sectionPacks.filter((p) => packIds.includes(p.id));
        const packSecs = packs.flatMap((p) => p.sections);
        const now = nowIso();
        const draft: DraftDocument = {
          id: `dr-${state.requestId}`, requestId: state.requestId, evidenceSetId: state.evidenceSet.id,
          templateId: template.id, sectionPackIds: packIds, status: "Generating", version: 0,
          sections: [],
          metadata: {
            revision: "v0.1", status: "Generating", applicability: "Draft",
            owner: CURRENT_USER, category: "Industrial Maintenance Services",
            region: "US Gulf Coast", vendor: "Apex Industrial Services",
            contractType: "SOW", sowNumber: "SOW-IMS-2026-014", parentMSA: "MSA-APEX-2019",
            currency: "USD", term: "3 years", renewalTerms: "120-day review window",
            classificationLevel: "Internal", createdAt: now, updatedAt: now,
            tags: ["renewal", "multi-site", "value-protection"],
          },
          createdAt: now, updatedAt: now,
        };
        dispatch({ type: "START_DRAFT", draft });
        for await (const evt of provider.generateDocument({
          requestId: state.requestId, evidenceSetId: state.evidenceSet.id, templateId: template.id,
          templateSections: template.baseSections, packSections: packSecs, evidence: includedEvidence,
        })) {
          if (evt.type === "section") dispatch({ type: "APPEND_SECTION", section: evt.section });
          if (evt.type === "done") dispatch({ type: "SET_DRAFT_STATUS", status: "DraftGenerated" });
        }
      },
      regenerateSection: async (sectionId, instruction) => {
        if (!state.draft) return;
        const provider = await getProvider();
        const section = state.draft.sections.find((s) => s.id === sectionId);
        if (!section) return;
        const res = await provider.refineSection({ section, instruction, evidence: includedEvidence });
        const suggestion: SuggestedChange = {
          id: `sg-${sectionId}-${Date.now()}`, sectionId,
          classification: "Needs Review", governance: "Human approval required",
          kind: "replace", before: section.currentBody, proposedText: res.proposedText,
          why: res.why, sourceEvidenceIds: res.sourceEvidenceIds, status: "pending",
        };
        dispatch({ type: "ADD_SUGGESTION", sectionId, suggestion });
      },
      editSectionBody: (sectionId, body) => dispatch({ type: "EDIT_SECTION_BODY", sectionId, body }),
      reorderSection: (sectionId, direction) => dispatch({ type: "REORDER_SECTION", sectionId, direction }),
      removeSection: (sectionId) => dispatch({ type: "REMOVE_SECTION", sectionId }),
      addSection: (label, origin = "user") => {
        const id = `s-user-${Date.now()}`;
        const order = (state.draft?.sections.length ?? 0);
        dispatch({ type: "ADD_SECTION", section: {
          id, label, order, origin, required: false, status: "empty",
          originalText: "", currentBody: "", suggestions: [], sourceEvidenceIds: [],
          history: [{ id: `h-${id}`, ts: nowIso(), actor: CURRENT_USER, kind: "structural", summary: "Section added" }],
        } });
      },
      setSuggestionStatus: (sectionId, suggestionId, status, editedProposedText) =>
        dispatch({ type: "SET_SUGGESTION_STATUS", sectionId, suggestionId, status, editedProposedText }),
      saveVersion: (label, summary) => {
        if (!state.draft) return null;
        const nextMinor = (state.versions[0]?.minor ?? 0) + 1;
        const version: DocumentVersion = {
          id: `v-${Date.now()}`, version: 0, minor: nextMinor,
          label: label ?? `Draft v0.${nextMinor}`, ts: nowIso(),
          createdBy: CURRENT_USER, summary: summary ?? "Saved draft snapshot",
          status: state.draft.status, immutable: false, snapshot: state.draft,
        };
        dispatch({ type: "SAVE_VERSION", version });
        dispatch({ type: "SET_DRAFT_STATUS", status: "Saved" });
        return version;
      },
      issueToVendor: (vendor) => {
        if (!state.draft) return;
        const version: DocumentVersion = {
          id: `v-${Date.now()}`, version: 1, minor: 0,
          label: "Issued to Vendor v1.0", ts: nowIso(),
          createdBy: CURRENT_USER, summary: `Issued to ${vendor}`,
          status: "IssuedToVendor", immutable: true, snapshot: state.draft,
        };
        dispatch({ type: "SAVE_VERSION", version });
        dispatch({ type: "ISSUE_TO_VENDOR", vendor });
      },
      updateMetadata: (meta) => dispatch({ type: "UPDATE_METADATA", meta }),
      addComment: (c) => dispatch({ type: "ADD_COMMENT", comment: {
        ...c, id: `cm-${Date.now()}`, author: CURRENT_USER_HANDLE, authorName: CURRENT_USER,
        state: "open", createdAt: nowIso(),
      } as Comment }),
      resolveComment: (id) => dispatch({ type: "RESOLVE_COMMENT", commentId: id, actor: CURRENT_USER }),
      addReviewer: ({ scope, sectionIds, reviewer, dueDate, notes }) => dispatch({
        type: "ADD_REVIEWER",
        assignment: {
          id: `rv-${Date.now()}`, scope, sectionIds, reviewer, state: "assigned",
          assignedBy: CURRENT_USER, assignedAt: nowIso(), dueDate, notes,
        },
      }),
      updateReviewer: (id, s, notes) => dispatch({ type: "UPDATE_REVIEWER", id, state: s, notes }),
      addCollaborator: (c) => dispatch({ type: "ADD_COLLABORATOR", collab: {
        ...c, id: `col-${Date.now()}`, addedBy: CURRENT_USER, addedAt: nowIso(),
      } }),
      removeCollaborator: (id) => dispatch({ type: "REMOVE_COLLABORATOR", id }),
      setCollaboratorAccess: (id, access) => dispatch({ type: "SET_COLLAB_ACCESS", id, access }),
      setRail: (r) => dispatch({ type: "SET_RAIL", rail: r }),
      reset: () => { try { localStorage.removeItem(key); } catch {} dispatch({ type: "RESET" }); },
    };
  }, [state, key]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWorkspace outside provider");
  return c;
}

// --- Cascading filter engine, exported for the Evidence tab ---
export function applyFilters(all: EvidenceDocument[], f: EvidenceFilters): EvidenceDocument[] {
  const q = f.search.trim().toLowerCase();
  return all.filter((d) => {
    if (q) {
      const hay = `${d.title} ${d.body ?? ""} ${d.topic?.join(" ") ?? ""} ${d.vendor ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.sources.length && !f.sources.includes(d.source)) return false;
    if (f.authorities.length && !f.authorities.includes(d.authority)) return false;
    if (f.purposes.length && !f.purposes.includes(d.purpose)) return false;
    if (f.types.length && !f.types.includes(d.type)) return false;
    if (f.regions.length && (!d.region || !f.regions.includes(d.region))) return false;
    if (f.topics.length && (!d.topic || !f.topics.some((t) => d.topic!.includes(t)))) return false;
    if (f.vendors.length && (!d.vendor || !f.vendors.includes(d.vendor))) return false;
    if (f.dateFrom && (!d.date || d.date < f.dateFrom)) return false;
    if (f.dateTo && (!d.date || d.date > f.dateTo)) return false;
    return true;
  });
}
