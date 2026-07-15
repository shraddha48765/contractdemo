// Mock document intelligence provider (Abacus stubbed out per repair patch).

import type {
  DraftSection,
  EvidenceDocument,
  EvidenceSet,
  SuggestedChange,
  TemplateSection,
} from "@/lib/workspace/types";

export interface GenerateInput {
  requestId: string;
  evidenceSetId: string;
  templateId: string;
  templateSections: TemplateSection[];
  packSections: TemplateSection[];
  evidence: EvidenceDocument[];
}
export type SectionEvent =
  | { type: "start"; totalSections: number }
  | { type: "section"; section: DraftSection }
  | { type: "done" };

export interface DocumentIntelligenceProvider {
  name: "mock" | "abacus";
  buildEvidenceSummary(evidence: EvidenceDocument[]): EvidenceSet["summary"];
  generateDocument(input: GenerateInput): AsyncIterable<SectionEvent>;
  refineSection(input: {
    section: DraftSection;
    instruction: string;
    evidence: EvidenceDocument[];
  }): Promise<{ proposedText: string; why: string; sourceEvidenceIds: string[] }>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function suggestionsFor(sectionId: string, evidence: EvidenceDocument[]): SuggestedChange[] {
  const has = (id: string) => evidence.some((e) => e.id === id && e.included);
  const out: SuggestedChange[] = [];
  if (sectionId === "s-scope" && has("prior-change-order")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Gap", governance: "Human approval required", kind: "insert",
      proposedText: "Weekend emergency coverage (Sat–Sun, 06:00–22:00) included in base scope; no separate change order required.",
      why: "Prior change-order history shows weekend coverage was added mid-term at premium rate across 2023 and 2024.",
      sourceEvidenceIds: ["prior-change-order"], status: "pending",
    });
  }
  if (sectionId === "s-sla" && has("apex-redline-v3")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Conflict", governance: "Human approval required", kind: "replace",
      before: "Supplier shall respond to emergency events within eight (8) business hours.",
      proposedText: "Supplier shall respond to emergency events within four (4) hours, 24×7, measured from ticket acknowledgement.",
      why: "Vendor Redline v3 softens the approved 4-hour 24×7 response to 8 business hours. Restoring approved position.",
      sourceEvidenceIds: ["apex-redline-v3", "sow-apex-2023"], status: "pending",
    });
  }
  if (sectionId === "s-credit" && has("apex-redline-v3")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Fallback Clause", governance: "Human approval required", kind: "insert",
      proposedText: "If monthly service completion target is missed for two consecutive months, Supplier shall issue a 1.5% service credit against the following month's invoice.",
      why: "Vendor Redline removed service-credit language. Restoring approved fallback from clause library.",
      sourceEvidenceIds: ["fallback-playbook", "clause-library"], status: "pending",
    });
  }
  if (sectionId === "s-rate" && has("apex-rate-card-v2")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Value Protection", governance: "Eligible for low-risk auto-apply", kind: "insert",
      proposedText: "Labor rates governed by Exhibit B Rate Card. Annual escalation capped at 3% CPI-linked.",
      why: "Approved rate card and 3% escalation cap from clause library.",
      sourceEvidenceIds: ["apex-rate-card-v2", "clause-library"], status: "pending",
    });
  }
  if (sectionId === "s-mat" && has("invoice-1842")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Variant", governance: "AI recommendation only", kind: "replace",
      before: "Materials billed at cost plus reasonable handling.",
      proposedText: "Materials billed at documented cost plus handling not to exceed 8%; invoices to include supplier receipts.",
      why: "Invoice sample INV-1842 shows handling at 14%. Tighter language reduces invoice leakage.",
      sourceEvidenceIds: ["invoice-1842", "clause-library"], status: "pending",
    });
  }
  if (sectionId === "s-cert" && has("tech-roster")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Needs Review", governance: "Human approval required", kind: "insert",
      proposedText: "All assigned technicians shall hold current OSHA 30 and site-specific safety certifications; certification records provided quarterly.",
      why: "Roster shows 2 pending renewals; category playbook requires current OSHA 30 across roster.",
      sourceEvidenceIds: ["tech-roster", "apex-insurance"], status: "pending",
    });
  }
  return out;
}

function bodyFor(section: TemplateSection): string {
  const m: Record<string, string> = {
    "s-need": "Maintain safe, continuous operation of production assets across six sites with predictable cost and enforceable SLAs.",
    "s-scope": "Preventive and corrective industrial maintenance across six sites; business-hours coverage; weekday emergency response.",
    "s-sla": "Supplier shall respond to emergency events within eight (8) business hours.",
    "s-pm": "Monthly PM cycle per asset class, documented in the CMMS with completion reporting to Buyer.",
    "s-rate": "Labor rates governed by Exhibit B Rate Card.",
    "s-safety": "Supplier shall maintain safety program aligned with Buyer standards and insurance minimums per Exhibit C.",
    "s-renew": "120-day renewal review window prior to expiration.",
    "s-credit": "",
    "s-mat": "Materials billed at cost plus reasonable handling.",
    "s-co": "Change orders require Buyer written approval prior to execution.",
    "s-cert": "",
    "s-wage": "Supplier shall comply with prevailing wage requirements per Exhibit F.",
    "s-report": "Supplier shall deliver a monthly performance report covering SLA attainment, PM completion, corrective work orders, and safety events.",
    "s-site": "Site-specific requirements per Exhibit D, including check-in protocols and escort rules.",
  };
  return m[section.id] ?? "";
}

const mockProvider: DocumentIntelligenceProvider = {
  name: "mock",
  buildEvidenceSummary(evidence) {
    const included = evidence.filter((e) => e.included);
    const gaps: string[] = [];
    const conflicts: string[] = [];
    if (included.some((e) => e.id === "prior-change-order")) gaps.push("Weekend coverage repeatedly added via change order");
    if (included.some((e) => e.id === "apex-redline-v3")) conflicts.push("Vendor redline weakens SLA and removes service credits");
    if (included.some((e) => e.id === "invoice-1842")) conflicts.push("Invoice handling exceeds approved cap");
    // Expected categories for a category strategy: SOW, RateCard, Redline, Invoice, SLA, ChangeOrder,
    // Certification, Insurance, ClauseLibrary, VendorProposal
    const expected: Array<EvidenceDocument["type"]> = [
      "SOW", "RateCard", "Redline", "Invoice", "SLA", "ChangeOrder",
      "Certification", "Insurance", "ClauseLibrary", "VendorProposal",
    ];
    const covered = expected.filter((t) => included.some((d) => d.type === t)).length;
    const artifactCoverage = Math.round((covered / expected.length) * 100);
    const penalties =
      gaps.length * 8 +
      conflicts.length * 10 +
      included.filter((d) => d.status === "Pending Classification").length * 5 +
      included.filter((d) => d.status === "Needs Review").length * 3;
    const draftReadiness = Math.max(0, Math.min(100, artifactCoverage - penalties));
    return { artifactCoverage, draftReadiness, gaps, conflicts };
  },
  async *generateDocument(input) {
    const all = [...input.templateSections, ...input.packSections];
    yield { type: "start", totalSections: all.length };
    let order = 0;
    for (const s of all) {
      await delay(400);
      const body = bodyFor(s);
      const section: DraftSection = {
        id: s.id, label: s.label, order: order++,
        origin: input.templateSections.includes(s) ? "template" : "pack",
        required: s.required,
        status: "ai",
        originalText: body,
        currentBody: body,
        suggestions: suggestionsFor(s.id, input.evidence),
        sourceEvidenceIds: input.evidence.filter((e) => e.included).slice(0, 3).map((e) => e.id),
        history: [{
          id: `h-${s.id}-0`, ts: new Date().toISOString(), actor: "AI",
          kind: "content", summary: "Section generated from evidence.",
        }],
      };
      yield { type: "section", section };
    }
    yield { type: "done" };
  },
  async refineSection({ section, instruction, evidence }) {
    await delay(400);
    // Craft a proposal — do NOT mutate body, do NOT append instruction to body.
    const evTitles = evidence.filter((e) => e.included).slice(0, 2).map((e) => e.title).join(" and ");
    const proposedText =
      section.currentBody
        ? `${section.currentBody}\n\nRefined position: Supplier obligations reinforced with explicit measurement, reporting, and evidence retention consistent with ${evTitles || "approved playbook"}.`
        : "Draft proposal generated from approved evidence.";
    return {
      proposedText,
      why: `Refinement requested: "${instruction}". Proposal grounded in ${evTitles || "the current evidence set"}.`,
      sourceEvidenceIds: evidence.filter((e) => e.included).slice(0, 3).map((e) => e.id),
    };
  },
};

export async function getProvider(): Promise<DocumentIntelligenceProvider> {
  return mockProvider;
}
