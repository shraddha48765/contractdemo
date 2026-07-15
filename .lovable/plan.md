# Active Request Workspace — Revised Plan v3 (Final UX Clarifications Folded In)

No code has been changed. This revision keeps everything from v2 and folds the nine UX clarifications into Phase C and Phase D as confirmed requirements.

---

## Carry-over from v2 (unchanged)

- **Tabs (§1):** Request Summary · Klydo Workflow · Supplier Review · Evidence & Intelligence · SOW Draft Studio · Redline Review · Approvals & History · Signature & Activation. Monitoring and Value Protection Command Center remain top-level routes.
- **Backend (§2):** Vercel-compatible TanStack `createServerFn` (Mode A default); optional Supabase/Lovable Edge Function proxy (Mode B). Web-standard Fetch APIs only; no Cloudflare-only bindings.
- **Uploads (§3):** TXT read client-side and stored in workspace state; PDF/DOCX intake-only until Abacus is configured; Abacus receives files via server-side `multipart/form-data`; `bytesRef` is a server-side provider id, never a browser concept; optional Supabase Storage only if opted in.
- **Models (§4–§6):** extended Collaborator (view/comment/edit + addedBy/addedAt + audit); separated ReviewerAssignment vs ApproverAssignment + ApprovalRecord bound to a DocumentVersion; Comments with threads, @mentions, doc/section scope, click-to-navigate, open/resolved.
- **Filters (§7):** Search · Source · Authority · Purpose · Type · Region · Topic · Vendor · Date · Include/Exclude, with intelligent preselection from request context.
- **Structure (§8):** one base template + optional section packs + user edits; Add / Insert Before / Insert After / Reorder / Remove; required sections locked; all structural changes audited.
- **Metadata (§9):** compact header (Revision · Status · Applicability · Owner · Effective Date); full metadata only in a View Document Details drawer.
- **Shared evidenceSetId (§10):** consumed by Evidence & Intelligence, SOW Studio, Redline Review, governed AI Assistant, Klydo exception routing, SourceChip, and fallback intelligence.
- **Preservation (§11):** global AI Assistant, permanent screens, DemoProvider, mock-data registry, layout/logo behavior untouched.

---

## Phase C additions — SOW Draft Studio UX (confirmed)

**C1. Two-mode left rail.**
- Default before generation: **Evidence mode** — evidence list bound to the request's `EvidenceSet`, filter chips, coverage summary, and per-doc include/exclude toggles.
- After the first successful generation, the rail **auto-switches to Outline mode** — ordered section list with per-section status pill (empty / generating / ai / review / accepted / conflict / edited), quick jump to section, and section-count summary.
- A persistent segmented toggle at the top of the rail (`Evidence` ↔ `Outline`) lets the user switch back at any time. Mode is remembered per request in workspace state.

**C2. Empty initial state.**
- No preloaded document. Studio opens with an empty canvas and a guided panel: **Step 1 Confirm Evidence → Step 2 Choose Template & Section Packs → Step 3 Generate SOW**. Each step unlocks the next.
- "Generate SOW" is disabled until an evidence set is confirmed and a template selected.

**C3. Progressive generation with per-section and overall progress.**
- The generation call returns an async iterable of `SectionEvent`s. As each event arrives, that section transitions `empty → generating → ai` and renders in place.
- Each section shows its **own inline loading state** (skeleton lines + spinner in the section header) while `status === "generating"`.
- The Studio header shows an **overall counter**: `Generating 6 of 11 sections…` with a thin progress bar; on completion it collapses to `Draft generated · 11 sections`.
- The user can scroll, read completed sections, open drawers, and cancel generation without blocking the page.

**C4. Minimal per-section action set.**
Visible inline (compact icon+label): **Edit · Approve Section · AI Refine · View Sources · More …**
`More …` menu: **Reject · Send for Review · Regenerate from Evidence · Add Comment · View Section History · Restore Previous Version**. All actions write to the audit trail; Approve Section binds to the current DocumentVersion.

**C5. Minimal top action bar.**
Visible: **Save Draft · Submit for Review · Export ▾**
Export dropdown: **Save to Workspace · Save to Drive · Download DOCX · Download PDF · Export Evidence Pack**. DOCX via `docx`, PDF via print pipeline, Evidence Pack via `jszip`. Submit for Review triggers `ReviewerAssignment`s and Klydo cards; formal approval flows through Approvers drawer + `ApprovalRecord`.

**C6. Metadata header stays compact.** Per §9 of v2 — only Revision · Status · Applicability · Owner · Effective Date on the canvas header; full metadata lives in Document Details drawer.

**C8. Value protection stays contextual.** No large KPI cards inside the editor. Value-protection framing appears only:
- as a small chip on relevant `SuggestedChange`s (`classification: "Value Protection"`),
- inside the AI Review drawer's "Why" explanation, and
- optionally on hover of a source chip that cites a value-protection clause.
The existing Value Protection Command Center remains the KPI surface.

**C9. Mock indicator.** When the provider factory falls back to Mock (missing key, health-ping fail, or opt-out), the Studio header shows a small `Mock intelligence` pill next to the status chip. On live Abacus, the pill is absent. Server response header `x-di-provider: mock|abacus` drives the flag.

---

## Phase D additions — Drawers & AI Review (confirmed)

**D1. Secondary capabilities live in right-side drawers only.**
Drawers: **AI Review · Comments · Collaborators · Reviewers · Approvers · Evidence Details · Section History · Version History · Audit Trail · Document Details**. Only one open at a time; each has a permanent icon in a slim right rail so entry points are discoverable without cluttering the canvas.

**D2. AI Review drawer capabilities (ContractFlow parity, preserved and extended).**
- **Tracked changes** rendered as insertion / deletion / replacement with before/after diff styling.
- **Source chips** for every suggestion, resolving through the shared `EvidenceSet` (so chips stay live if evidence is reclassified).
- **Gap / Conflict detection** shown as classified chips (Gap · Conflict · Fallback Clause · Value Protection · Needs Review · Covered · Variant · Redline Risk).
- **Why-this-was-shown** explanation per suggestion, grounded in the cited sources.
- **Clause and fallback intelligence** — fallback playbook clauses proposed when a redline weakens an approved position; playbook is itself an EvidenceDocument in the set.
- **Redline-to-SOW proposed changes** — vendor redlines from Redline Review flow into the AI Review drawer as `SuggestedChange`s with `classification: "Redline Risk"`.
- **Accept / Reject / Modify** controls per suggestion; each decision writes an audit entry, updates section body, and can trigger reviewer/approver routing.
- **Contextual value-protection explanation** inline in the suggestion body, matching C8 (no separate KPI block).

**D3. Cross-drawer synchronization.** Comments (§6), Collaborators (§4), Reviewers vs Approvers (§5), Section History (§8 structural + content revisions), Version History (DocumentVersion snapshots bound to approvals), Audit Trail (unified event stream), and Document Details (metadata edit surface, permission-gated).

---

## Confirmation checklist

| Clarification | Included |
| --- | --- |
| 1. Rail modes (Evidence pre-gen, Outline post-gen, auto-switch, manual toggle) | ✅ C1 |
| 2. Studio starts empty; guided Evidence → Template → Generate flow | ✅ C2 |
| 3. Per-section loading + overall `Generating N of M sections` counter | ✅ C3 |
| 4. Minimal section actions + specified `More …` menu | ✅ C4 |
| 5. Minimal top action bar + specified Export dropdown | ✅ C5 |
| 6. All specified secondary capabilities live in drawers only | ✅ D1 |
| 7. AI Review drawer retains all ContractFlow strengths | ✅ D2 |
| 8. Value protection stays contextual; no editor KPI cards | ✅ C8 |
| 9. Mock provider fully functional + "Mock intelligence" indicator | ✅ C9 |

All nine UX clarifications are confirmed and folded into Phase C / Phase D. Everything else from v2 stands unchanged.

No files were created, modified, or deleted in this response. Awaiting approval to switch to build mode and begin Phase A.
