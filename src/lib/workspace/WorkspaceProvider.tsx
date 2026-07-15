import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AuditEvent,
  Collaborator,
  CollaboratorAuditEvent,
  Comment,
  DocumentVersion,
  DraftDocument,
  DraftSection,
  DraftStatus,
  EvidenceDocument,
  EvidenceFilters,
  EvidenceSet,
  ReviewerAssignment,
  ApproverAssignment,
  ApprovalRecord,
  SuggestedChange,
  WorkspaceState,
} from "./types";
import { seedEvidenceDocs } from "@/lib/seeds/evidencePack";
import { industrialMaintenanceTemplate, sectionPacks } from "@/lib/seeds/templates";

// ---------- Storage ----------
const key = (rid: string) => `workspace-${rid}-v1`;

function initialFilters(requestId: string): EvidenceFilters {
  // Preselect from request context (plan v3 §7)
  const isApex = requestId === "ind-maint-sow";
  return {
    search: "",
    sources: ["Seeded", "Uploaded", "External"],
    authorities: ["Authoritative", "Prior drafting reference", "Commercial evidence", "Operational evidence", "Compliance evidence"],
    purposes: [],
    types: [],
    regions: isApex ? ["US Gulf Coast"] : [],
    topics: isApex ? ["Maintenance"] : [],
    vendors: isApex ? ["Apex Industrial Services"] : [],
  };
}

function makeInitialState(requestId: string): WorkspaceState {
  const now = new Date().toISOString();
  const documents: Record<string, EvidenceDocument> = Object.fromEntries(
    seedEvidenceDocs.map((d) => [d.id, d]),
  );
  const evidenceSet: EvidenceSet = {
    id: `es-${requestId}`,
    requestId,
    createdAt: now,
    updatedAt: now,
    documentIds: seedEvidenceDocs.map((d) => d.id),
    filters: initialFilters(requestId),
    confirmed: false,
  };
  return {
    requestId,
    evidenceSet,
    documents,
    draft: null,
    collaborators: [
      { id: "u-owner", name: "You", role: "Contract Owner", access: "edit", addedBy: "system", addedAt: now },
      { id: "u-legal", name: "K. Nguyen", role: "Legal", access: "comment", addedBy: "u-owner", addedAt: now },
      { id: "u-finance", name: "R. Patel", role: "Finance", access: "comment", addedBy: "u-owner", addedAt: now },
    ],
    collaboratorAudit: [],
    comments: [],
    reviewers: [],
    approvers: [],
    approvals: [],
    versions: [],
    audit: [{ id: `a-${Date.now()}`, ts: now, actor: "System", source: "System", text: "Workspace initialized." }],
    provider: "mock",
    focusMode: false,
    railMode: "evidence",
  };
}

// ---------- Actions ----------
type Action =
  | { type: "hydrate"; state: WorkspaceState }
  | { type: "setFilters"; filters: Partial<EvidenceFilters> }
  | { type: "toggleInclude"; docId: string }
  | { type: "addDocument"; doc: EvidenceDocument }
  | { type: "confirmEvidence" }
  | { type: "startDraft"; draft: DraftDocument }
  | { type: "setDraftStatus"; status: DraftStatus }
  | { type: "upsertSection"; section: DraftSection }
  | { type: "reorderSection"; sectionId: string; toIndex: number }
  | { type: "removeSection"; sectionId: string }
  | { type: "addSection"; section: DraftSection; position: number }
  | { type: "editSectionBody"; sectionId: string; body: string }
  | { type: "decideSuggestion"; sectionId: string; suggestionId: string; decision: SuggestedChange["status"]; overrideAfter?: string }
  | { type: "setRailMode"; mode: "evidence" | "outline" }
  | { type: "setFocusMode"; on: boolean }
  | { type: "addComment"; comment: Comment }
  | { type: "resolveComment"; id: string }
  | { type: "addCollaborator"; c: Collaborator }
  | { type: "removeCollaborator"; id: string }
  | { type: "changeCollaboratorAccess"; id: string; access: Collaborator["access"] }
  | { type: "logCollabAudit"; e: CollaboratorAuditEvent }
  | { type: "addReviewer"; r: ReviewerAssignment }
  | { type: "addApprover"; a: ApproverAssignment }
  | { type: "recordApproval"; r: ApprovalRecord }
  | { type: "snapshotVersion"; v: DocumentVersion }
  | { type: "audit"; e: AuditEvent };

function reducer(state: WorkspaceState, a: Action): WorkspaceState {
  switch (a.type) {
    case "hydrate": return a.state;
    case "setFilters":
      return { ...state, evidenceSet: { ...state.evidenceSet, filters: { ...state.evidenceSet.filters, ...a.filters }, updatedAt: new Date().toISOString() } };
    case "toggleInclude": {
      const d = state.documents[a.docId];
      if (!d) return state;
      return { ...state, documents: { ...state.documents, [a.docId]: { ...d, included: !d.included } } };
    }
    case "addDocument":
      return {
        ...state,
        documents: { ...state.documents, [a.doc.id]: a.doc },
        evidenceSet: { ...state.evidenceSet, documentIds: [a.doc.id, ...state.evidenceSet.documentIds], updatedAt: new Date().toISOString() },
      };
    case "confirmEvidence":
      return { ...state, evidenceSet: { ...state.evidenceSet, confirmed: true, updatedAt: new Date().toISOString() } };
    case "startDraft":
      return { ...state, draft: a.draft, railMode: "outline" };
    case "setDraftStatus":
      return state.draft ? { ...state, draft: { ...state.draft, status: a.status, updatedAt: new Date().toISOString() } } : state;
    case "upsertSection": {
      if (!state.draft) return state;
      const exists = state.draft.sections.some((s) => s.id === a.section.id);
      const sections = exists
        ? state.draft.sections.map((s) => (s.id === a.section.id ? a.section : s))
        : [...state.draft.sections, a.section];
      return { ...state, draft: { ...state.draft, sections, updatedAt: new Date().toISOString() } };
    }
    case "reorderSection": {
      if (!state.draft) return state;
      const src = state.draft.sections.findIndex((s) => s.id === a.sectionId);
      if (src < 0) return state;
      const arr = [...state.draft.sections];
      const [item] = arr.splice(src, 1);
      arr.splice(a.toIndex, 0, item);
      return { ...state, draft: { ...state.draft, sections: arr.map((s, i) => ({ ...s, order: i })) } };
    }
    case "removeSection": {
      if (!state.draft) return state;
      return { ...state, draft: { ...state.draft, sections: state.draft.sections.filter((s) => s.id !== a.sectionId || s.required) } };
    }
    case "addSection": {
      if (!state.draft) return state;
      const arr = [...state.draft.sections];
      arr.splice(a.position, 0, a.section);
      return { ...state, draft: { ...state.draft, sections: arr.map((s, i) => ({ ...s, order: i })) } };
    }
    case "editSectionBody": {
      if (!state.draft) return state;
      return { ...state, draft: { ...state.draft, status: "UnsavedChanges", sections: state.draft.sections.map((s) => s.id === a.sectionId ? { ...s, body: a.body, status: "edited", history: [...s.history, { id: `h-${Date.now()}`, ts: new Date().toISOString(), actor: "You", kind: "content", summary: "Edited body." }] } : s) } };
    }
    case "decideSuggestion": {
      if (!state.draft) return state;
      return {
        ...state,
        draft: {
          ...state.draft,
          status: "UnsavedChanges",
          sections: state.draft.sections.map((s) => {
            if (s.id !== a.sectionId) return s;
            return {
              ...s,
              suggestions: s.suggestions.map((g) =>
                g.id !== a.suggestionId ? g : { ...g, status: a.decision, after: a.overrideAfter ?? g.after, decidedAt: new Date().toISOString(), decidedBy: "You" },
              ),
              body: a.decision === "accepted" || a.decision === "modified"
                ? applyChange(s.body, s.suggestions.find((g) => g.id === a.suggestionId)!, a.overrideAfter)
                : s.body,
            };
          }),
        },
      };
    }
    case "setRailMode": return { ...state, railMode: a.mode };
    case "setFocusMode": return { ...state, focusMode: a.on };
    case "addComment": return { ...state, comments: [...state.comments, a.comment] };
    case "resolveComment": return { ...state, comments: state.comments.map((c) => c.id === a.id ? { ...c, state: "resolved", resolvedAt: new Date().toISOString(), resolvedBy: "You" } : c) };
    case "addCollaborator": return { ...state, collaborators: [...state.collaborators, a.c] };
    case "removeCollaborator": return { ...state, collaborators: state.collaborators.filter((c) => c.id !== a.id) };
    case "changeCollaboratorAccess": return { ...state, collaborators: state.collaborators.map((c) => c.id === a.id ? { ...c, access: a.access } : c) };
    case "logCollabAudit": return { ...state, collaboratorAudit: [a.e, ...state.collaboratorAudit] };
    case "addReviewer": return { ...state, reviewers: [...state.reviewers, a.r] };
    case "addApprover": return { ...state, approvers: [...state.approvers, a.a] };
    case "recordApproval": return { ...state, approvals: [...state.approvals, a.r] };
    case "snapshotVersion": return { ...state, versions: [a.v, ...state.versions] };
    case "audit": return { ...state, audit: [a.e, ...state.audit].slice(0, 500) };
    default: return state;
  }
}

function applyChange(body: string, s: SuggestedChange, overrideAfter?: string): string {
  const text = overrideAfter ?? s.after;
  if (s.kind === "insert") return body ? `${body}\n\n${text}` : text;
  if (s.kind === "replace" && s.before && body.includes(s.before)) return body.replace(s.before, text);
  if (s.kind === "delete" && s.before && body.includes(s.before)) return body.replace(s.before, "");
  return body ? `${body}\n\n${text}` : text;
}

// ---------- Context ----------
interface Ctx {
  state: WorkspaceState;
  dispatch: React.Dispatch<Action>;
  filteredDocs: EvidenceDocument[];
  audit: (text: string, source?: AuditEvent["source"]) => void;
}
const WorkspaceCtx = createContext<Ctx | null>(null);

export function WorkspaceProvider({ requestId, children }: { requestId: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, requestId, makeInitialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key(requestId));
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    try {
      localStorage.setItem(key(requestId), JSON.stringify(state));
    } catch {}
  }, [state, requestId]);

  const audit = useCallback(
    (text: string, source: AuditEvent["source"] = "Human") => {
      dispatch({
        type: "audit",
        e: { id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: new Date().toISOString(), actor: source === "System" || source === "AI" ? source : "You", source, text },
      });
    },
    [],
  );

  const filteredDocs = useMemo(() => {
    const { filters } = state.evidenceSet;
    const q = filters.search.trim().toLowerCase();
    return Object.values(state.documents).filter((d) => {
      if (q && !(`${d.title} ${d.vendor ?? ""} ${(d.topic ?? []).join(" ")} ${d.body ?? ""}`).toLowerCase().includes(q)) return false;
      if (filters.sources.length && !filters.sources.includes(d.source)) return false;
      if (filters.authorities.length && !filters.authorities.includes(d.authority)) return false;
      if (filters.purposes.length && !filters.purposes.includes(d.purpose)) return false;
      if (filters.types.length && !filters.types.includes(d.type)) return false;
      if (filters.regions.length && d.region && !filters.regions.includes(d.region)) return false;
      if (filters.topics.length && !(d.topic ?? []).some((t) => filters.topics.includes(t))) return false;
      if (filters.vendors.length && d.vendor && !filters.vendors.includes(d.vendor)) return false;
      return true;
    });
  }, [state.documents, state.evidenceSet]);

  const value = useMemo(() => ({ state, dispatch, filteredDocs, audit }), [state, filteredDocs, audit]);
  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  const c = useContext(WorkspaceCtx);
  if (!c) throw new Error("useWorkspace outside WorkspaceProvider");
  return c;
}

export { industrialMaintenanceTemplate, sectionPacks };
