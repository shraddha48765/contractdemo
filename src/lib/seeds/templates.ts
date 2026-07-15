import type { DocumentTemplate, SectionPack } from "@/lib/workspace/types";

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

export const sectionPacks: SectionPack[] = [
  {
    id: "pack-value-protection",
    name: "Value Protection Pack",
    description: "Adds service credits, materials handling cap, and change-order controls.",
    sections: [
      { id: "s-credit", label: "Service Credits", guidance: "Service credit fallback.", required: false },
      { id: "s-mat", label: "Materials Pass-Through", guidance: "Handling cap and receipts.", required: false },
      { id: "s-co", label: "Change Order Approval", guidance: "Approval thresholds and process.", required: false },
    ],
  },
  {
    id: "pack-compliance",
    name: "Compliance & Certifications",
    description: "Technician certifications and prevailing-wage compliance.",
    sections: [
      { id: "s-cert", label: "Technician Certifications", guidance: "OSHA 30 and site-specific certs.", required: false },
      { id: "s-wage", label: "Prevailing Wage Compliance", guidance: "Wage schedule adherence.", required: false },
    ],
  },
];
