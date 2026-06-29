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
      <p className="mt-4 text-xs text-muted-foreground">Lightweight preview · Full governance configuration handled by Admins.</p>
    </AppLayout>
  );
}
