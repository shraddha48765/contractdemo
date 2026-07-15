// Shared workspace data model (plan v3 §4-§10, plus repair patch)

export type Authority =
  | "Authoritative"
  | "Prior drafting reference"
  | "Commercial evidence"
  | "Operational evidence"
  | "Compliance evidence"
  | "External intelligence";

export type DocType =
  | "SOW"
  | "Contract"
  | "Exhibit"
  | "Redline"
  | "RateCard"
  | "WageSchedule"
  | "PO"
  | "Invoice"
  | "SLA"
  | "ServiceReport"
  | "ChangeOrder"
  | "Certification"
  | "Insurance"
  | "Safety"
  | "ClauseLibrary"
  | "FallbackPlaybook"
  | "Benchmark"
  | "VendorProposal";

export type DocStatus =
  | "Ready"
  | "Applied"
  | "Needs Review"
  | "Pending Classification"
  | "Uploaded / Intake Complete";

export interface EvidenceDocument {
  id: string;
  title: string;
  source: "Seeded" | "Uploaded" | "External";
  type: DocType;
  region?: string;
  topic?: string[];
  vendor?: string;
  date?: string; // ISO
  authority: Authority;
  purpose: string;
  status: DocStatus;
  body?: string;
  sections?: { heading: string; text: string }[];
  providerRef?: string;
  storageRef?: string;
  included: boolean;
  uploadedAt?: string;
}

export interface EvidenceFilters {
  search: string;
  sources: ("Seeded" | "Uploaded" | "External")[];
  authorities: Authority[];
  purposes: string[];
  types: DocType[];
  regions: string[];
  topics: string[];
  vendors: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface EvidenceSet {
  id: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  documentIds: string[];
  filters: EvidenceFilters;
  summary?: { artifactCoverage: number; draftReadiness: number; gaps: string[]; conflicts: string[] };
  confirmed: boolean;
}

// --- Templates & packs ---

export interface TemplateSection {
  id: string;
  label: string;
  guidance: string;
  required: boolean;
}
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  baseSections: TemplateSection[];
}
export interface SectionPack {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
}

// --- Draft document ---

export type SectionStatus =
  | "empty"
  | "generating"
  | "ai"
  | "review"
  | "accepted"
  | "conflict"
  | "edited"
  | "assigned-review";

export interface SectionRevision {
  id: string;
  ts: string;
  actor: string;
  kind: "content" | "structural" | "status" | "suggestion";
  summary: string;
  before?: string;
  after?: string;
}

export type SuggestionClassification =
  | "Gap"
  | "Conflict"
  | "Fallback Clause"
  | "Value Protection"
  | "Needs Review"
  | "Covered"
  | "Variant"
  | "Redline Risk";

export type SuggestionGovernance =
  | "AI recommendation only"
  | "Human approval required"
  | "Eligible for low-risk auto-apply";

export interface SuggestedChange {
  id: string;
  sectionId: string;
  classification: SuggestionClassification;
  governance: SuggestionGovernance;
  kind: "insert" | "delete" | "replace";
  before?: string;
  proposedText: string;          // AI's original proposal (immutable once created)
  editedProposedText?: string;   // user's edit of the proposal (for Modify)
  why: string;
  sourceEvidenceIds: string[];
  status: "pending" | "accepted" | "rejected" | "modified";
  decidedBy?: string;
  decidedAt?: string;
}

export interface DraftSection {
  id: string;
  label: string;
  order: number;
  origin: "template" | "pack" | "user";
  packId?: string;
  required: boolean;
  status: SectionStatus;
  originalText: string;   // first generated body, immutable
  currentBody: string;    // what the document currently shows
  suggestions: SuggestedChange[];
  sourceEvidenceIds: string[];
  history: SectionRevision[];
}

export type DraftStatus =
  | "Initial"
  | "EvidenceSelected"
  | "TemplateSelected"
  | "Generating"
  | "DraftGenerated"
  | "Reviewing"
  | "UnsavedChanges"
  | "Saved"
  | "Submitted"
  | "InReview"
  | "Approved"
  | "IssuedToVendor";

export interface DraftMetadata {
  revision: string;
  status: DraftStatus;
  applicability: string;
  owner: string;
  effectiveDate?: string;
  category?: string;
  region?: string;
  vendor?: string;
  contractType?: string;
  sowNumber?: string;
  parentMSA?: string;
  currency?: string;
  term?: string;
  renewalTerms?: string;
  tags?: string[];
  classificationLevel?: string;
  createdAt: string;
  updatedAt: string;
  issuedTo?: string;
  issuedAt?: string;
}

export interface DraftDocument {
  id: string;
  requestId: string;
  evidenceSetId: string;
  templateId: string;
  sectionPackIds: string[];
  status: DraftStatus;
  version: number;
  sections: DraftSection[];
  metadata: DraftMetadata;
  createdAt: string;
  updatedAt: string;
}

// --- Collaboration ---

export type CollaboratorAccess = "view" | "comment" | "edit";
export interface Collaborator {
  id: string; name: string; email?: string; role: string;
  access: CollaboratorAccess; addedBy: string; addedAt: string;
}
export interface CollaboratorAuditEvent {
  id: string; ts: string; actor: string;
  action: "added" | "removed" | "access-changed";
  target: string; from?: CollaboratorAccess; to?: CollaboratorAccess;
}

export interface Comment {
  id: string;
  parentCommentId?: string;
  scope: "document" | "section";
  sectionId?: string;
  author: string;
  authorName: string;
  text: string;
  mentions: string[];
  state: "open" | "resolved";
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReviewScope = "current-section" | "selected-sections" | "entire-document";
export interface ReviewerAssignment {
  id: string;
  scope: ReviewScope;
  sectionIds: string[];
  reviewer: string;
  state: "assigned" | "in-review" | "changes-requested" | "completed";
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export type ApproverRole = "Legal" | "Finance" | "Procurement" | "Signatory" | "Business SME";
export interface ApproverAssignment {
  id: string; role: ApproverRole; approver: string;
  scope: "document" | "section"; sectionId?: string; requiredOrder?: number;
}
export interface ApprovalRecord {
  id: string; assignmentId: string;
  decision: "approved" | "rejected" | "changes-requested";
  approver: string; role: ApproverRole; decidedAt: string;
  comment?: string; documentVersionId: string; signatureRef?: string;
  invalidated?: boolean; invalidatedReason?: string;
}

export interface DocumentVersion {
  id: string;
  version: number;      // integer major
  minor: number;        // minor bump per save
  label: string;        // "Generated Draft v0.1" etc.
  ts: string;
  createdBy: string;
  summary: string;
  status: DraftStatus;
  immutable: boolean;   // true for Issued v1.0+
  snapshot: DraftDocument;
}

export interface AuditEvent {
  id: string; ts: string; actor: string;
  source: "Human" | "AI" | "System" | "Uploaded Document" | "Seeded Evidence";
  text: string; refId?: string;
}

// --- Workspace root ---

export interface WorkspaceState {
  requestId: string;
  evidenceSet: EvidenceSet;
  documents: Record<string, EvidenceDocument>;
  draft: DraftDocument | null;
  collaborators: Collaborator[];
  collaboratorAudit: CollaboratorAuditEvent[];
  comments: Comment[];
  reviewers: ReviewerAssignment[];
  approvers: ApproverAssignment[];
  approvals: ApprovalRecord[];
  versions: DocumentVersion[];
  audit: AuditEvent[];
  provider: "mock" | "abacus";
  railMode: "evidence" | "outline";
}
