import type { EvidenceDocument } from "@/lib/workspace/types";

// Seeded demo evidence pack per plan v3.
// Every doc carries id, title, source, type, region, topic, vendor, date,
// authority, purpose, status, body.

export const seedEvidenceDocs: EvidenceDocument[] = [
  // --- 5 prior SOWs ---
  {
    id: "sow-apex-2023", title: "Apex Industrial Maintenance SOW 2023", source: "Seeded",
    type: "SOW", region: "US Gulf Coast", topic: ["Maintenance", "Multi-site"],
    vendor: "Apex Industrial Services", date: "2023-01-15", authority: "Prior drafting reference",
    purpose: "drafting-basis", status: "Applied", included: true,
    body: "3-year Industrial Maintenance SOW covering 6 sites. Response SLA: 4 hours 24x7 for critical assets. Rate escalation: 3% annual CPI-linked. Service credits: 1.5% for missed monthly targets.",
    sections: [
      { heading: "Scope of Work", text: "Preventive and corrective maintenance across 6 sites." },
      { heading: "SLA", text: "4-hour 24x7 emergency response measured from ticket acknowledgement." },
      { heading: "Rate Card", text: "Governed by Exhibit B; escalation capped at 3% CPI." },
    ],
  },
  {
    id: "sow-northstar-2022", title: "Northstar Maintenance SOW 2022", source: "Seeded",
    type: "SOW", region: "US Midwest", topic: ["Maintenance"], vendor: "Northstar Maintenance Group",
    date: "2022-06-01", authority: "Prior drafting reference", purpose: "benchmark",
    status: "Ready", included: true,
    body: "Comparable 2-year maintenance SOW. Response SLA: 6 hours business days. Rate escalation: 3.5%.",
  },
  {
    id: "sow-electrical-2024", title: "Electrical Repair Services MSA 2024", source: "Seeded",
    type: "SOW", region: "US Gulf Coast", topic: ["Electrical"], vendor: "GulfPower Services",
    date: "2024-03-10", authority: "Prior drafting reference", purpose: "benchmark",
    status: "Ready", included: true,
    body: "Electrical MSA with tighter safety schedule and OSHA-30 certification requirement.",
  },
  {
    id: "sow-hvac-2023", title: "Facilities HVAC SOW 2023", source: "Seeded",
    type: "SOW", region: "US Gulf Coast", topic: ["Facilities"], vendor: "CoolAir Facilities",
    date: "2023-09-01", authority: "Prior drafting reference", purpose: "benchmark",
    status: "Ready", included: true,
    body: "Facilities HVAC with materials pass-through capped at 8% handling.",
  },
  {
    id: "sow-emergency-gen-2022", title: "Emergency Generator Maintenance SOW 2022", source: "Seeded",
    type: "SOW", region: "US Gulf Coast", topic: ["Power"], vendor: "Apex Industrial Services",
    date: "2022-11-15", authority: "Prior drafting reference", purpose: "drafting-basis",
    status: "Ready", included: true,
    body: "Emergency generator maintenance with quarterly PM cycle and 2-hour response.",
  },
  // --- Vendor proposal + redline ---
  {
    id: "apex-proposal-2026", title: "Apex Renewal Proposal 2026", source: "Seeded",
    type: "VendorProposal", region: "US Gulf Coast", topic: ["Maintenance", "Renewal"],
    vendor: "Apex Industrial Services", date: "2025-11-01", authority: "Commercial evidence",
    purpose: "commercial", status: "Ready", included: true,
    body: "Renewal proposal: labor +4.2% YoY, response SLA proposed at 6 hours (was 4), no service credits.",
  },
  {
    id: "apex-redline-v3", title: "Apex Redline v3 (2026 Renewal)", source: "Seeded",
    type: "Redline", region: "US Gulf Coast", topic: ["Maintenance"], vendor: "Apex Industrial Services",
    date: "2025-12-05", authority: "Commercial evidence", purpose: "redline-source",
    status: "Needs Review", included: true,
    body: "Vendor redline weakening emergency SLA from 4h 24x7 to 8h business hours; removes service-credit clause; raises handling cap to 12%.",
    sections: [
      { heading: "SLA", text: "Supplier shall respond within eight (8) business hours." },
      { heading: "Service Credits", text: "[Removed]" },
      { heading: "Handling", text: "Materials at cost plus 12% handling." },
    ],
  },
  // --- Commercial refs ---
  {
    id: "apex-rate-card-v2", title: "Apex Rate Card v2", source: "Seeded",
    type: "RateCard", region: "US Gulf Coast", topic: ["Pricing"], vendor: "Apex Industrial Services",
    date: "2025-10-01", authority: "Authoritative", purpose: "rate-reference",
    status: "Applied", included: true,
    body: "Approved labor rates by discipline. Escalation cap 3% CPI-linked.",
  },
  {
    id: "wage-schedule-2026", title: "Prevailing Wage Schedule 2026", source: "Seeded",
    type: "WageSchedule", region: "US Gulf Coast", topic: ["Pricing", "Compliance"],
    date: "2026-01-01", authority: "Compliance evidence", purpose: "compliance",
    status: "Ready", included: true,
    body: "State prevailing wage schedule for maintenance trades.",
  },
  {
    id: "po-2024-summary", title: "PO Volume Summary 2024", source: "Seeded",
    type: "PO", region: "US Gulf Coast", topic: ["Volume"], vendor: "Apex Industrial Services",
    date: "2024-12-31", authority: "Commercial evidence", purpose: "commercial",
    status: "Ready", included: true,
    body: "2024 PO volume $2.28M across 6 sites; 42 emergency callouts.",
  },
  {
    id: "invoice-1842", title: "Invoice INV-1842", source: "Seeded",
    type: "Invoice", region: "US Gulf Coast", topic: ["Billing"], vendor: "Apex Industrial Services",
    date: "2025-08-14", authority: "Operational evidence", purpose: "leakage-evidence",
    status: "Needs Review", included: true,
    body: "Invoice showing materials handling at 14% (over approved 8%). Rate mismatch on 3 line items totaling $12,480 exposure.",
  },
  {
    id: "invoice-1901", title: "Invoice INV-1901", source: "Seeded",
    type: "Invoice", region: "US Gulf Coast", topic: ["Billing"], vendor: "Apex Industrial Services",
    date: "2025-10-02", authority: "Operational evidence", purpose: "leakage-evidence",
    status: "Ready", included: true,
    body: "Invoice within tolerance; used as comparison baseline.",
  },
  // --- Operational ---
  {
    id: "sla-log-2025", title: "SLA Service Log 2025", source: "Seeded",
    type: "SLA", region: "US Gulf Coast", topic: ["SLA", "Performance"],
    vendor: "Apex Industrial Services", date: "2025-12-01", authority: "Operational evidence",
    purpose: "performance", status: "Ready", included: true,
    body: "94.2% on-time response; 3 SLA misses in Q3 concentrated at Site 4 (weekends).",
  },
  {
    id: "service-report-q4", title: "Q4 Service Report", source: "Seeded",
    type: "ServiceReport", region: "US Gulf Coast", topic: ["Performance"],
    vendor: "Apex Industrial Services", date: "2025-12-31", authority: "Operational evidence",
    purpose: "performance", status: "Ready", included: true,
    body: "PM completion 97%; corrective work orders trending up 8% YoY.",
  },
  {
    id: "prior-change-order", title: "Prior Change Order History", source: "Seeded",
    type: "ChangeOrder", region: "US Gulf Coast", topic: ["Change Management"],
    vendor: "Apex Industrial Services", date: "2024-01-01", authority: "Operational evidence",
    purpose: "gap-evidence", status: "Applied", included: true,
    body: "Weekend coverage added mid-term via CO at premium rate — recurring pattern across 2023 and 2024.",
  },
  // --- Governance ---
  {
    id: "clause-library", title: "Approved Clause Library", source: "Seeded",
    type: "ClauseLibrary", topic: ["Clauses"], date: "2025-06-01",
    authority: "Authoritative", purpose: "clause-source", status: "Applied", included: true,
    body: "Approved fallback clauses for SLA, service credits, rate escalation, handling caps, safety, insurance.",
  },
  {
    id: "fallback-playbook", title: "Fallback Clause Playbook", source: "Seeded",
    type: "FallbackPlaybook", topic: ["Playbook"], date: "2025-06-01",
    authority: "Authoritative", purpose: "fallback-source", status: "Applied", included: true,
    body: "Fallback positions ranked by acceptability when vendor weakens approved terms.",
  },
  {
    id: "apex-insurance", title: "Apex Insurance Certificate", source: "Seeded",
    type: "Insurance", topic: ["Compliance"], vendor: "Apex Industrial Services",
    date: "2025-01-01", authority: "Compliance evidence", purpose: "compliance",
    status: "Ready", included: true,
    body: "COI with $5M general liability, workers' comp per statute, additional insured endorsement.",
  },
  {
    id: "tech-roster", title: "Technician Certification Roster", source: "Seeded",
    type: "Certification", topic: ["Compliance"], vendor: "Apex Industrial Services",
    date: "2025-11-01", authority: "Compliance evidence", purpose: "compliance",
    status: "Ready", included: true,
    body: "42 assigned technicians; OSHA 30 current on 40; 2 pending renewal.",
  },
  {
    id: "safety-requirements", title: "Site Safety Requirements", source: "Seeded",
    type: "Safety", topic: ["Safety"], date: "2025-01-01",
    authority: "Authoritative", purpose: "compliance", status: "Applied", included: true,
    body: "Buyer safety program requirements including LOTO, hot work, confined space, PPE minimums.",
  },
];

export const seedEvidenceById: Record<string, EvidenceDocument> = Object.fromEntries(
  seedEvidenceDocs.map((d) => [d.id, d]),
);
