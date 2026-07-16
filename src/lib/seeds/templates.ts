import type { DocumentTemplate, SectionPack } from "@/lib/workspace/types";

// --- Base templates (spec §3: three options; only one selectable) ---

export const industrialMaintenanceTemplate: DocumentTemplate = {
  id: "tpl-industrial-maintenance",
  name: "Industrial Maintenance Services SOW",
  description: "Standard template for multi-site industrial maintenance renewals.",
  baseSections: [
    { id: "s-need", label: "Business Need", guidance: "One paragraph statement of business need.", required: true },
    { id: "s-scope", label: "Scope of Work", guidance: "Scope, sites, exclusions.", required: true },
    { id: "s-sla", label: "Emergency Response SLA", guidance: "Response and resolution SLAs.", required: true },
    { id: "s-pm", label: "Preventive Maintenance", guidance: "PM cycle and reporting.", required: true },
    { id: "s-rate", label: "Rate Card / Pricing", guidance: "Governed by Exhibit B.", required: true },
    { id: "s-safety", label: "Safety & Insurance", guidance: "Safety program and insurance minimums.", required: true },
    { id: "s-renew", label: "Renewal Review", guidance: "Renewal window and terms.", required: false },
  ],
};

export const genericServicesTemplate: DocumentTemplate = {
  id: "tpl-generic-services",
  name: "Generic Services SOW",
  description: "General-purpose services SOW skeleton.",
  baseSections: [
    { id: "s-need", label: "Business Need", guidance: "Business need summary.", required: true },
    { id: "s-scope", label: "Scope of Work", guidance: "Scope and deliverables.", required: true },
    { id: "s-rate", label: "Pricing", guidance: "Pricing and rate basis.", required: true },
    { id: "s-safety", label: "Compliance & Insurance", guidance: "Compliance and insurance.", required: true },
  ],
};

export const blankTemplate: DocumentTemplate = {
  id: "tpl-blank",
  name: "Blank SOW Template",
  description: "No pre-populated sections — start from scratch.",
  baseSections: [],
};

export const availableTemplates: DocumentTemplate[] = [
  industrialMaintenanceTemplate,
  genericServicesTemplate,
  blankTemplate,
];

// --- Section packs (spec §3: four packs, additive to any template) ---

export const sectionPacks: SectionPack[] = [
  {
    id: "pack-commercial-value-protection",
    name: "Commercial & Value Protection",
    description: "Service credits, materials handling cap, and change-order controls.",
    sections: [
      { id: "s-credit", label: "Service Credits", guidance: "Service credit fallback.", required: false },
      { id: "s-mat", label: "Materials Pass-Through", guidance: "Handling cap and receipts.", required: false },
      { id: "s-co", label: "Change Order Approval", guidance: "Approval thresholds and process.", required: false },
    ],
  },
  {
    id: "pack-safety-compliance",
    name: "Safety & Compliance",
    description: "Technician certifications, safety program, prevailing-wage compliance.",
    sections: [
      { id: "s-cert", label: "Technician Certifications", guidance: "OSHA 30 and site-specific certs.", required: false },
      { id: "s-wage", label: "Prevailing Wage Compliance", guidance: "Wage schedule adherence.", required: false },
    ],
  },
  {
    id: "pack-performance-reporting",
    name: "Performance & Reporting",
    description: "Monthly performance report and SLA / PM completion reporting.",
    sections: [
      { id: "s-report", label: "Monthly Performance Report", guidance: "SLA, PM completion, corrective, safety events.", required: false },
    ],
  },
  {
    id: "pack-site-regional",
    name: "Site & Regional Requirements",
    description: "Site-specific check-in, escort, and regional exhibits.",
    sections: [
      { id: "s-site", label: "Site-Specific Requirements", guidance: "Site check-in and escort protocols.", required: false },
    ],
  },
];
