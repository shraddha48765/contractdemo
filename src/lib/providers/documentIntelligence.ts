// Document Intelligence provider adapter (plan v3 §2, §C9).
// Client-side factory. Mock is fully functional and drives the demo.
// Abacus adapter is a stub that health-checks a server function; if the
// health call fails, we transparently fall back to Mock.

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
  refineSection(input: { section: DraftSection; instruction: string; evidence: EvidenceDocument[] }): Promise<DraftSection>;
}

// -------- Mock provider (fully functional) --------

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function suggestionsFor(sectionId: string, evidence: EvidenceDocument[]): SuggestedChange[] {
  const byId = Object.fromEntries(evidence.map((e) => [e.id, e]));
  const has = (id: string) => Boolean(byId[id]);
  const out: SuggestedChange[] = [];
  if (sectionId === "s-scope" && has("prior-change-order")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Gap", governance: "Human approval required", kind: "insert",
      after: "Weekend emergency coverage (Sat–Sun, 06:00–22:00) included in base scope; no separate change order required.",
      why: "Prior change-order history shows weekend coverage was added mid-term at premium rate across 2023 and 2024. Closing the gap upfront prevents repeat leakage.",
      sourceEvidenceIds: ["prior-change-order"], status: "pending",
    });
  }
  if (sectionId === "s-sla" && has("apex-redline-v3")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Conflict", governance: "Human approval required", kind: "replace",
      before: "Supplier shall respond to emergency events within eight (8) business hours.",
      after: "Supplier shall respond to emergency events within four (4) hours, 24×7, measured from ticket acknowledgement.",
      why: "Vendor Redline v3 softens the approved 4-hour 24×7 response to 8 business hours. Restoring approved position.",
      sourceEvidenceIds: ["apex-redline-v3", "sow-apex-2023"], status: "pending",
    });
  }
  if (sectionId === "s-credit" && has("apex-redline-v3")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Fallback Clause", governance: "Human approval required", kind: "insert",
      after: "If monthly service completion target is missed for two consecutive months, Supplier shall issue a 1.5% service credit against the following month's invoice.",
      why: "Vendor Redline removed service-credit language. Restoring approved fallback from clause library.",
      sourceEvidenceIds: ["fallback-playbook", "clause-library"], status: "pending",
    });
  }
  if (sectionId === "s-rate" && has("apex-rate-card-v2")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Value Protection", governance: "Eligible for low-risk auto-apply", kind: "insert",
      after: "Labor rates governed by Exhibit B Rate Card. Annual escalation capped at 3% CPI-linked.",
      why: "Approved rate card and 3% escalation cap from clause library. Standard value-protection insertion.",
      sourceEvidenceIds: ["apex-rate-card-v2", "clause-library"], status: "pending",
    });
  }
  if (sectionId === "s-mat" && has("invoice-1842")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Variant", governance: "AI recommendation only", kind: "replace",
      before: "Materials billed at cost plus reasonable handling.",
      after: "Materials billed at documented cost plus handling not to exceed 8%; invoices to include supplier receipts.",
      why: "Invoice sample INV-1842 shows handling at 14%. Tighter language reduces invoice leakage.",
      sourceEvidenceIds: ["invoice-1842", "clause-library"], status: "pending",
    });
  }
  if (sectionId === "s-cert" && has("tech-roster")) {
    out.push({
      id: `sg-${sectionId}-1`, sectionId,
      classification: "Needs Review", governance: "Human approval required", kind: "insert",
      after: "All assigned technicians shall hold current OSHA 30 and site-specific safety certifications; certification records provided quarterly.",
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
  };
  return m[section.id] ?? "";
}

const mockProvider: DocumentIntelligenceProvider = {
  name: "mock",
  buildEvidenceSummary(evidence) {
    const gaps: string[] = [];
    const conflicts: string[] = [];
    if (evidence.some((e) => e.id === "prior-change-order")) gaps.push("Weekend coverage repeatedly added via CO");
    if (evidence.some((e) => e.id === "apex-redline-v3")) conflicts.push("Vendor redline weakens SLA and removes service credits");
    if (evidence.some((e) => e.id === "invoice-1842")) conflicts.push("Invoice handling exceeds approved cap");
    const coverage = Math.min(100, Math.round((evidence.filter((e) => e.included).length / 15) * 100));
    return { coverage, gaps, conflicts };
  },
  async *generateDocument(input) {
    const all = [...input.templateSections, ...input.packSections];
    yield { type: "start", totalSections: all.length };
    let order = 0;
    for (const s of all) {
      await delay(450);
      const section: DraftSection = {
        id: s.id, label: s.label, order: order++,
        origin: input.templateSections.includes(s) ? "template" : "pack",
        required: s.required,
        status: "ai",
        body: bodyFor(s),
        suggestions: suggestionsFor(s.id, input.evidence),
        sourceEvidenceIds: input.evidence.slice(0, 3).map((e) => e.id),
        history: [{ id: `h-${s.id}-0`, ts: new Date().toISOString(), actor: "System", kind: "content", summary: "Section generated from evidence." }],
      };
      yield { type: "section", section };
    }
    yield { type: "done" };
  },
  async refineSection({ section, instruction }) {
    await delay(400);
    return {
      ...section,
      status: "edited",
      body: section.body + `\n\n[AI refinement: ${instruction}]`,
      history: [...section.history, { id: `h-${Date.now()}`, ts: new Date().toISOString(), actor: "AI", kind: "content", summary: `Refined: ${instruction}` }],
    };
  },
};

// -------- Provider factory --------

export async function getProvider(): Promise<DocumentIntelligenceProvider> {
  // Abacus path would go here: probe a health server function.
  // For now, always Mock. Wiring point kept explicit so Phase E is additive.
  return mockProvider;
}
