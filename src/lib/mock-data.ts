// Mock/seed data for Contract Intelligence demo

export type SourceType =
  | "Vendor-submitted"
  | "External / Vendor-Published"
  | "Internal Governed"
  | "Approved Template"
  | "Approved Clause"
  | "Operational Log"
  | "System Generated";

export interface SourceArtifact {
  id: string;
  name: string;
  type: SourceType;
  category: string;
  sourceSystem: string;
  governanceStatus: "Approved" | "Pending Legal Review" | "Validated" | "Draft" | "External";
  lastUpdated: string;
  linkedVendor?: string;
  linkedRequest?: string;
  linkedContract?: string;
  whereUsed: string[];
  confidence: "High" | "Medium" | "Low";
  summary: string;
}

export const sourceArtifacts: Record<string, SourceArtifact> = {
  "apex-rate-card-v2": {
    id: "apex-rate-card-v2",
    name: "Apex Rate Card v2",
    type: "Internal Governed",
    category: "Rate Cards",
    sourceSystem: "Contract & Document Intelligence",
    governanceStatus: "Validated",
    lastUpdated: "2026-05-14",
    linkedVendor: "Apex Industrial Services",
    linkedContract: "Apex Industrial Maintenance Services SOW 2026–2029",
    whereUsed: ["Supplier Review", "Evidence Pack", "Draft SOW", "Execution Monitoring"],
    confidence: "High",
    summary: "Current Apex labor rate card. Base technician $125/hr, 3% annual escalation cap.",
  },
  "market-benchmark": {
    id: "market-benchmark",
    name: "Market Benchmark Summary",
    type: "Internal Governed",
    category: "Benchmark Data",
    sourceSystem: "Supplier Intelligence",
    governanceStatus: "Validated",
    lastUpdated: "2026-04-30",
    whereUsed: ["Supplier Review", "Evidence Pack"],
    confidence: "High",
    summary: "Q2 industrial maintenance market benchmark across 14 comparable contracts.",
  },
  "sla-logs": {
    id: "sla-logs",
    name: "SLA Service Logs Q1–Q2",
    type: "Operational Log",
    category: "SLA Logs",
    sourceSystem: "Execution Monitoring",
    governanceStatus: "Validated",
    lastUpdated: "2026-06-30",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Supplier Review", "Evidence Pack", "Execution Monitoring"],
    confidence: "High",
    summary: "96.8% monthly completion, 3.6h average emergency response over last 6 months.",
  },
  "northstar-prior-sow": {
    id: "northstar-prior-sow",
    name: "Northstar Prior SOW",
    type: "Internal Governed",
    category: "SOWs",
    sourceSystem: "Contract & Document Intelligence",
    governanceStatus: "Approved",
    lastUpdated: "2024-08-12",
    linkedVendor: "Northstar Maintenance Group",
    whereUsed: ["Supplier Review", "Evidence Pack"],
    confidence: "High",
    summary: "Historical Northstar SOW. $74K of scope-gap change orders over 18 months.",
  },
  "co-014": {
    id: "co-014",
    name: "Change Order CO-014",
    type: "Internal Governed",
    category: "Change Orders",
    sourceSystem: "Contract & Document Intelligence",
    governanceStatus: "Approved",
    lastUpdated: "2025-11-20",
    linkedVendor: "Northstar Maintenance Group",
    whereUsed: ["Supplier Review", "Evidence Pack"],
    confidence: "High",
    summary: "Northstar scope-gap change order, $18K, approved with finance escalation.",
  },
  "po-7784": {
    id: "po-7784",
    name: "PO Reference PO-7784",
    type: "Internal Governed",
    category: "Purchase Orders",
    sourceSystem: "ERP",
    governanceStatus: "Approved",
    lastUpdated: "2026-01-18",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Contract Intelligence", "Execution Monitoring"],
    confidence: "High",
    summary: "Master PO for Apex maintenance services.",
  },
  "apex-insurance": {
    id: "apex-insurance",
    name: "Apex Insurance Certificate",
    type: "Internal Governed",
    category: "Compliance Documents",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Validated",
    lastUpdated: "2026-03-02",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Supplier Review", "Evidence Pack", "Execution Monitoring"],
    confidence: "High",
    summary: "Current insurance certificate, $5M general liability, valid through 2027.",
  },
  "apex-safety": {
    id: "apex-safety",
    name: "Apex Safety Program Document",
    type: "Internal Governed",
    category: "Compliance Documents",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Validated",
    lastUpdated: "2026-02-15",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Evidence Pack"],
    confidence: "High",
    summary: "OSHA-compliant safety program with site-level procedures.",
  },
  "tech-cert-roster": {
    id: "tech-cert-roster",
    name: "Technician Certification Roster",
    type: "Internal Governed",
    category: "Certifications",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Pending Legal Review",
    lastUpdated: "2026-06-10",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Evidence Pack"],
    confidence: "Medium",
    summary: "Roster of 42 certified technicians. 3 certifications pending renewal.",
  },
  "sow-template": {
    id: "sow-template",
    name: "Approved Industrial Services SOW Template",
    type: "Approved Template",
    category: "Templates",
    sourceSystem: "Knowledge & Governance",
    governanceStatus: "Approved",
    lastUpdated: "2026-01-01",
    whereUsed: ["Draft SOW"],
    confidence: "High",
    summary: "Standard SOW template for industrial maintenance category.",
  },
  "service-credit-clause": {
    id: "service-credit-clause",
    name: "Approved Service Credit Clause",
    type: "Approved Clause",
    category: "Clause Library",
    sourceSystem: "Knowledge & Governance",
    governanceStatus: "Approved",
    lastUpdated: "2025-12-01",
    whereUsed: ["Draft SOW", "Redline Review"],
    confidence: "High",
    summary: "1.5% service credit if SLA missed for two consecutive months.",
  },
  "escalation-cap-clause": {
    id: "escalation-cap-clause",
    name: "Approved Escalation Cap Clause",
    type: "Approved Clause",
    category: "Clause Library",
    sourceSystem: "Knowledge & Governance",
    governanceStatus: "Approved",
    lastUpdated: "2025-12-01",
    whereUsed: ["Draft SOW", "Evidence Pack"],
    confidence: "High",
    summary: "3% annual labor-rate escalation cap.",
  },
  "fallback-clause-b": {
    id: "fallback-clause-b",
    name: "Approved Fallback Clause B",
    type: "Approved Clause",
    category: "Clause Library",
    sourceSystem: "Knowledge & Governance",
    governanceStatus: "Approved",
    lastUpdated: "2025-12-01",
    whereUsed: ["Redline Review"],
    confidence: "High",
    summary: "Fallback service credit language with stronger enforceability.",
  },
  "materials-passthrough": {
    id: "materials-passthrough",
    name: "Materials Pass-Through Confirmation",
    type: "Vendor-submitted",
    category: "Vendor Confirmations",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Validated",
    lastUpdated: "2026-06-18",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Evidence Pack", "Draft SOW"],
    confidence: "High",
    summary: "Confirmation of materials pass-through pricing with no markup.",
  },
  "emergency-coverage": {
    id: "emergency-coverage",
    name: "Emergency Response Coverage Confirmation",
    type: "Vendor-submitted",
    category: "Vendor Confirmations",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Validated",
    lastUpdated: "2026-06-18",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Evidence Pack", "Draft SOW"],
    confidence: "High",
    summary: "4-hour emergency response coverage across all sites.",
  },
  "service-credit-clarification": {
    id: "service-credit-clarification",
    name: "Service Credit Clarification",
    type: "Vendor-submitted",
    category: "Vendor Confirmations",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Validated",
    lastUpdated: "2026-06-20",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Evidence Pack"],
    confidence: "Medium",
    summary: "Vendor clarification on service credit calculation methodology.",
  },
  "elevate-website": {
    id: "elevate-website",
    name: "Elevate Vendor Website",
    type: "External / Vendor-Published",
    category: "External Vendor Data",
    sourceSystem: "External",
    governanceStatus: "External",
    lastUpdated: "2026-06-15",
    linkedVendor: "Elevate Field Services",
    whereUsed: ["Supplier Review"],
    confidence: "Low",
    summary: "Self-published vendor capability statement. Not internally validated.",
  },
  "request-intake": {
    id: "request-intake",
    name: "Request Intake Record",
    type: "Internal Governed",
    category: "Intake",
    sourceSystem: "Klydo Workflow",
    governanceStatus: "Approved",
    lastUpdated: "2026-06-01",
    whereUsed: ["Request Summary"],
    confidence: "High",
    summary: "Original business intake from Operations Manager.",
  },
  "apex-redline-v3": {
    id: "apex-redline-v3",
    name: "Apex Redline v3",
    type: "Vendor-submitted",
    category: "Vendor Redlines",
    sourceSystem: "Vendor Exchange",
    governanceStatus: "Pending Legal Review",
    lastUpdated: "Pending upload",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Redline Review"],
    confidence: "Medium",
    summary: "Vendor-proposed redlines with softened service credit and escalation language.",
  },
  "invoice-1842": {
    id: "invoice-1842",
    name: "Invoice INV-1842",
    type: "Vendor-submitted",
    category: "Invoices",
    sourceSystem: "AP System",
    governanceStatus: "Pending Legal Review",
    lastUpdated: "Pending upload",
    linkedVendor: "Apex Industrial Services",
    linkedContract: "Apex Industrial Maintenance Services SOW 2026–2029",
    whereUsed: ["Execution Monitoring"],
    confidence: "High",
    summary: "First invoice under active Apex contract. Rate variance detected.",
  },
  "signed-sow": {
    id: "signed-sow",
    name: "Signed Apex SOW",
    type: "Internal Governed",
    category: "SOWs",
    sourceSystem: "E-Signature Platform",
    governanceStatus: "Approved",
    lastUpdated: "After activation",
    linkedVendor: "Apex Industrial Services",
    whereUsed: ["Contract Intelligence", "Execution Monitoring"],
    confidence: "High",
    summary: "Fully signed SOW. Matches approved version except non-material formatting.",
  },
  "renewal-record": {
    id: "renewal-record",
    name: "Renewal Review Record",
    type: "System Generated",
    category: "Renewal Records",
    sourceSystem: "Klydo Workflow",
    governanceStatus: "Approved",
    lastUpdated: "Auto-tracked",
    whereUsed: ["Execution Monitoring", "Control Tower"],
    confidence: "High",
    summary: "Auto-tracked 120-day renewal review window.",
  },
};

export type VendorStatus =
  | "Incumbent"
  | "Historical Alternate"
  | "New Vendor Option"
  | "Selected Supplier";

export interface Vendor {
  id: string;
  name: string;
  status: VendorStatus;
  position: string;
  cost: string;
  escalation: string;
  emergencyResponse: string;
  completionRate: string;
  changeOrderExposure: string;
  compliance: string;
  transitionRisk: "Low" | "Medium" | "High";
  recommendation: string;
  sources: string[];
  riskScore: number;
  category: string;
  contractsServed: number;
  benchmarkPosition: string;
}

export const vendors: Vendor[] = [
  {
    id: "apex",
    name: "Apex Industrial Services",
    status: "Incumbent",
    position: "Incumbent / current / known supplier",
    cost: "$2.42M",
    escalation: "3.0% capped",
    emergencyResponse: "3.6 hours",
    completionRate: "96.8%",
    changeOrderExposure: "$18K (manageable)",
    compliance: "92%",
    transitionRisk: "Low",
    recommendation: "Recommend after buyer confirmation",
    sources: ["apex-rate-card-v2", "sla-logs", "apex-insurance"],
    riskScore: 22,
    category: "Industrial Maintenance",
    contractsServed: 4,
    benchmarkPosition: "Top quartile completion, median pricing",
  },
  {
    id: "northstar",
    name: "Northstar Maintenance Group",
    status: "Historical Alternate",
    position: "Historical alternate / prior vendor",
    cost: "$2.36M",
    escalation: "4.2% historical request",
    emergencyResponse: "4.4 hours",
    completionRate: "93.9%",
    changeOrderExposure: "$74K (scope gaps)",
    compliance: "81%",
    transitionRisk: "Medium",
    recommendation: "Not recommended",
    sources: ["northstar-prior-sow", "co-014"],
    riskScore: 58,
    category: "Industrial Maintenance",
    contractsServed: 2,
    benchmarkPosition: "Low pricing, weaker SLA history",
  },
  {
    id: "elevate",
    name: "Elevate Field Services",
    status: "New Vendor Option",
    position: "New vendor option / market option",
    cost: "$2.31M",
    escalation: "3.0% proposed",
    emergencyResponse: "No internal history",
    completionRate: "No internal history",
    changeOrderExposure: "Unknown",
    compliance: "68% (pending)",
    transitionRisk: "High",
    recommendation: "Benchmark / future option",
    sources: ["elevate-website", "market-benchmark"],
    riskScore: 71,
    category: "Industrial Maintenance",
    contractsServed: 0,
    benchmarkPosition: "Aggressive pricing, unproven internally",
  },
  {
    id: "premier-mech",
    name: "Premier Mechanical Partners",
    status: "Historical Alternate",
    position: "Adjacent category vendor",
    cost: "—",
    escalation: "—",
    emergencyResponse: "5.1 hours",
    completionRate: "91.2%",
    changeOrderExposure: "$33K",
    compliance: "86%",
    transitionRisk: "Medium",
    recommendation: "Future benchmark",
    sources: ["market-benchmark"],
    riskScore: 44,
    category: "Mechanical Services",
    contractsServed: 1,
    benchmarkPosition: "Mid-market",
  },
  {
    id: "summit-fac",
    name: "Summit Facilities Co",
    status: "New Vendor Option",
    position: "Cross-category supplier",
    cost: "—",
    escalation: "—",
    emergencyResponse: "—",
    completionRate: "—",
    changeOrderExposure: "—",
    compliance: "74%",
    transitionRisk: "High",
    recommendation: "Watchlist",
    sources: ["market-benchmark"],
    riskScore: 62,
    category: "Facilities",
    contractsServed: 0,
    benchmarkPosition: "Emerging",
  },
];

export interface PortfolioContract {
  id: string;
  name: string;
  vendor: string;
  value: string;
  status: string;
  risk: "Low" | "Medium" | "High";
  category: string;
  renewalDays?: number;
}

export const portfolioContracts: PortfolioContract[] = [
  {
    id: "apex-sow",
    name: "Apex Industrial Maintenance Services SOW",
    vendor: "Apex Industrial Services",
    value: "$2.4M",
    status: "Active",
    risk: "High",
    category: "Industrial Maintenance",
    renewalDays: 1080,
  },
  {
    id: "northstar-hist",
    name: "Northstar Historical Maintenance Contract",
    vendor: "Northstar Maintenance Group",
    value: "$1.8M",
    status: "Historical / Closed",
    risk: "Low",
    category: "Industrial Maintenance",
  },
  {
    id: "hvac",
    name: "Facilities HVAC Services Contract",
    vendor: "ClimateWorks Inc.",
    value: "$3.1M",
    status: "Active",
    risk: "Medium",
    category: "Facilities",
    renewalDays: 210,
  },
  {
    id: "safety",
    name: "Safety Equipment Supply Agreement",
    vendor: "Guardian Safety",
    value: "$2.2M",
    status: "Active",
    risk: "Low",
    category: "Safety",
    renewalDays: 320,
  },
  {
    id: "field-insp",
    name: "Field Inspection Services SOW",
    vendor: "InspectPro",
    value: "$1.4M",
    status: "Renewal Risk",
    risk: "High",
    category: "Inspection",
    renewalDays: 90,
  },
  {
    id: "electrical",
    name: "Electrical Repair Services Contract",
    vendor: "VoltLine Services",
    value: "$2.7M",
    status: "Active — SLA Risk",
    risk: "High",
    category: "Electrical",
    renewalDays: 410,
  },
  {
    id: "waste",
    name: "Waste Handling Services Agreement",
    vendor: "EcoHandling Co",
    value: "$1.9M",
    status: "Active — Compliance Review",
    risk: "Medium",
    category: "Waste",
    renewalDays: 540,
  },
  {
    id: "gen",
    name: "Emergency Generator Maintenance SOW",
    vendor: "PowerGuard",
    value: "$3.2M",
    status: "Renewal <120 days",
    risk: "High",
    category: "Power",
    renewalDays: 95,
  },
];

export interface KlydoTask {
  id: string;
  title: string;
  type: string;
  owner: string;
  status: "Open" | "In Review" | "Completed" | "Approved" | "Resolved" | "Overdue" | "Pending";
  due: string;
  priority: "Low" | "Medium" | "High";
  relatedVendor?: string;
  relatedRequest?: string;
  relatedContract?: string;
  sourceArtifact?: string;
  audit: { ts: string; actor: string; action: string }[];
  createdBy?: "seed" | "redline-upload" | "invoice-upload" | "supplier-confirm";
}

export const seedKlydoTasks: KlydoTask[] = [
  {
    id: "k1",
    title: "Confirm recommended supplier",
    type: "Decision",
    owner: "Procurement Buyer",
    status: "Open",
    due: "Today",
    priority: "High",
    relatedRequest: "ind-maint-sow",
    sourceArtifact: "apex-rate-card-v2",
    audit: [{ ts: "2026-06-25 09:14", actor: "System", action: "Task created from Supplier Review stage" }],
    createdBy: "seed",
  },
  {
    id: "k2",
    title: "Review vendor documentation",
    type: "Review",
    owner: "Procurement Buyer",
    status: "In Review",
    due: "2 days",
    priority: "Medium",
    relatedRequest: "ind-maint-sow",
    sourceArtifact: "apex-safety",
    audit: [{ ts: "2026-06-25 09:14", actor: "System", action: "Task created" }],
    createdBy: "seed",
  },
  {
    id: "k3",
    title: "Validate technician certification roster",
    type: "Missing Document / Review",
    owner: "Business Owner",
    status: "Open",
    due: "3 days",
    priority: "Medium",
    relatedRequest: "ind-maint-sow",
    sourceArtifact: "tech-cert-roster",
    audit: [{ ts: "2026-06-25 09:14", actor: "System", action: "Task created" }],
    createdBy: "seed",
  },
  {
    id: "k6",
    title: "Approve final SOW package",
    type: "Approval",
    owner: "Procurement Manager",
    status: "Pending",
    due: "5 days",
    priority: "High",
    relatedRequest: "ind-maint-sow",
    audit: [{ ts: "2026-06-25 09:14", actor: "System", action: "Task created" }],
    createdBy: "seed",
  },
  {
    id: "k7",
    title: "Validate signed-vs-approved version",
    type: "Governance Check",
    owner: "Procurement Buyer",
    status: "Pending",
    due: "6 days",
    priority: "Medium",
    relatedRequest: "ind-maint-sow",
    audit: [{ ts: "2026-06-25 09:14", actor: "System", action: "Task created" }],
    createdBy: "seed",
  },
  {
    id: "k9",
    title: "SLA service credit review (Electrical Repair)",
    type: "Exception",
    owner: "Contract Owner",
    status: "Open",
    due: "5 days",
    priority: "Medium",
    relatedContract: "electrical",
    sourceArtifact: "sla-logs",
    audit: [{ ts: "2026-06-22 10:00", actor: "System", action: "Exception raised from SLA logs" }],
    createdBy: "seed",
  },
  {
    id: "k10",
    title: "Renewal review — Emergency Generator Maintenance SOW",
    type: "Renewal",
    owner: "Contract Owner",
    status: "Open",
    due: "120-day window",
    priority: "High",
    relatedContract: "gen",
    sourceArtifact: "renewal-record",
    audit: [{ ts: "2026-06-20 08:00", actor: "System", action: "Renewal window opened" }],
    createdBy: "seed",
  },
  {
    id: "k11",
    title: "Renewal review — Field Inspection Services SOW",
    type: "Renewal",
    owner: "Procurement Buyer",
    status: "Open",
    due: "90 days",
    priority: "High",
    relatedContract: "field-insp",
    sourceArtifact: "renewal-record",
    audit: [{ ts: "2026-06-18 08:00", actor: "System", action: "Renewal window opened" }],
    createdBy: "seed",
  },
];

export const evidencePack = [
  { id: "apex-rate-card-v2", usedFor: "Pricing baseline & rate validation", validation: "Validated" },
  { id: "market-benchmark", usedFor: "Cost benchmarking", validation: "Validated" },
  { id: "sla-logs", usedFor: "SLA & completion history", validation: "Validated" },
  { id: "northstar-prior-sow", usedFor: "Scope-gap risk reference", validation: "Validated" },
  { id: "co-014", usedFor: "Change-order pattern analysis", validation: "Validated" },
  { id: "apex-insurance", usedFor: "Compliance check", validation: "Validated" },
  { id: "tech-cert-roster", usedFor: "Certification verification", validation: "Pending" },
  { id: "service-credit-clause", usedFor: "Approved clause inclusion", validation: "Validated" },
];

export const contractIntelligenceRecs = [
  {
    title: "Apply 3% annual labor-rate escalation cap",
    impact: "Caps multi-year exposure on ~$2.4M base",
    sources: ["apex-rate-card-v2", "market-benchmark", "escalation-cap-clause"],
  },
  {
    title: "Include 4-hour emergency response SLA",
    impact: "Aligns with operations need; vendor confirmed coverage",
    sources: ["emergency-coverage", "sla-logs"],
  },
  {
    title: "Include 95% monthly completion target",
    impact: "Apex currently performs at 96.8%; achievable",
    sources: ["sla-logs"],
  },
  {
    title: "Include 1.5% service credit if SLA missed two consecutive months",
    impact: "Enforces SLA discipline; ~$42K credit exposure modeled",
    sources: ["service-credit-clause", "sla-logs"],
  },
  {
    title: "Require approval for change orders above $25K",
    impact: "Mitigates Northstar-style $74K scope-gap pattern",
    sources: ["co-014", "northstar-prior-sow"],
  },
  {
    title: "Insurance, safety, technician certification requirements",
    impact: "Aligns with internal compliance baseline",
    sources: ["apex-insurance", "apex-safety", "tech-cert-roster"],
  },
  {
    title: "Add 120-day renewal review window",
    impact: "Prevents auto-rollover; supports portfolio renewal cadence",
    sources: ["renewal-record"],
  },
  {
    title: "Address prior scope-gap risk from Northstar history",
    impact: "Forces tighter scope definition in SOW",
    sources: ["northstar-prior-sow", "co-014"],
  },
];

export const initialKpis = {
  totalActiveValue: "$18.7M",
  leakageExposure: 286000,
  openExceptions: 14,
  renewals120: 6,
  slaRiskContracts: 4,
  invoiceFlags: 9,
  changeOrdersPending: 5,
  serviceCreditsAtRisk: "$42K",
  overdueKlydo: 7,
};

export const vendorChecklist = [
  { item: "Updated Apex Rate Card v2", status: "Approved" as const, source: "apex-rate-card-v2" },
  { item: "Insurance Certificate", status: "Approved" as const, source: "apex-insurance" },
  { item: "Safety Program Document", status: "Approved" as const, source: "apex-safety" },
  { item: "Technician Certification Roster", status: "Under Review" as const, source: "tech-cert-roster" },
  { item: "Apex Redline v3", status: "Requested" as const, source: "apex-redline-v3" },
  { item: "Emergency Response Coverage Confirmation", status: "Approved" as const, source: "emergency-coverage" },
  { item: "Materials Pass-Through Confirmation", status: "Approved" as const, source: "materials-passthrough" },
  { item: "Service Credit Clarification", status: "Submitted" as const, source: "service-credit-clarification" },
];

export const negotiationNotes = [
  {
    ts: "2026-06-22 14:08",
    owner: "Legal Reviewer",
    visibility: "Internal-only",
    text: "Apex pushed back on service credit trigger. Legal recommends fallback clause B.",
    linkedClause: "Service Credit",
  },
  {
    ts: "2026-06-23 10:31",
    owner: "Finance Reviewer",
    visibility: "Internal-only",
    text: "Finance does not approve escalation above 3% without Sourcing Lead approval.",
    linkedClause: "Escalation Cap",
  },
];
