import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { FileText, BookOpen, Workflow, GitBranch, Users, ShieldAlert, History } from "lucide-react";

export const Route = createFileRoute("/governance")({
  head: () => ({ meta: [{ title: "Knowledge & Governance" }] }),
  component: Governance,
});

const modules = [
  { icon: FileText, title: "Templates", desc: "Approved SOW, MSA, NDA templates by category." },
  { icon: BookOpen, title: "Clause Library", desc: "Approved clauses and fallback options." },
  { icon: Workflow, title: "Playbooks", desc: "Negotiation playbooks and escalation paths." },
  { icon: Users, title: "Approval Matrix", desc: "Who approves what, by threshold and category." },
  { icon: ShieldAlert, title: "Access & Roles", desc: "RBAC across procurement, legal, finance." },
  { icon: ShieldAlert, title: "AI Guardrails", desc: "Source traceability and answer constraints." },
  { icon: GitBranch, title: "Version Control", desc: "Document version lineage and signed-vs-approved checks." },
  { icon: History, title: "Decision Logs", desc: "Approval, recommendation, and override history." },
];

function Governance() {
  return (
    <AppLayout title="Knowledge & Governance" subtitle="Preview of the governance and knowledge backbone.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modules.map((m) => (
          <div key={m.title} className="rounded-xl border bg-card p-4">
            <div className="h-9 w-9 rounded-lg bg-accent2/15 text-accent2 grid place-items-center"><m.icon className="h-4 w-4" /></div>
            <div className="mt-3 text-sm font-semibold">{m.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Category Playbooks</h3>
          <p className="text-xs text-muted-foreground mb-3">Benchmark logic adapts to the procurement category.</p>
          <ul className="text-xs space-y-1.5">
            <li className="flex justify-between rounded border p-2"><span>Industrial Maintenance Services</span><span className="text-muted-foreground">Services + Materials Pass-through</span></li>
            <li className="flex justify-between rounded border p-2"><span>Material Supply</span><span className="text-muted-foreground">Unit price · Lead time · Warranty</span></li>
            <li className="flex justify-between rounded border p-2"><span>High-Risk Services</span><span className="text-muted-foreground">HSSE · Insurance · CAP</span></li>
            <li className="flex justify-between rounded border p-2"><span>Professional Services</span><span className="text-muted-foreground">Rate card · Deliverables</span></li>
            <li className="flex justify-between rounded border p-2"><span>Construction / Project Work</span><span className="text-muted-foreground">Milestones · Retainage · Bond</span></li>
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Approved Benchmark Sources</h3>
          <p className="text-xs text-muted-foreground mb-3">Governed data feeding sourcing decisions.</p>
          <ul className="text-xs space-y-1.5">
            <li className="rounded border p-2">Internal historical contracts</li>
            <li className="rounded border p-2">Supplier performance records</li>
            <li className="rounded border p-2">Approved market / rate references</li>
            <li className="rounded border p-2">Insurance / HSSE validation sources</li>
            <li className="rounded border p-2">Pricing / commodity references</li>
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Lightweight preview · Full governance configuration handled by Admins.</p>
    </AppLayout>
  );
}
