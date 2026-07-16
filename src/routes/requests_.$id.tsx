import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { useState, useRef } from "react";
import { vendors, sourceArtifacts, vendorChecklist, negotiationNotes } from "@/lib/mock-data";
import { KlydoTaskCard } from "@/components/KlydoTaskCard";
import { SourceChip } from "@/components/SourceChip";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, FileText, AlertTriangle, ShieldCheck, MessageSquareText, ChevronRight, Sparkles, Users, Download } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { WorkspaceProvider } from "@/lib/workspace/WorkspaceProvider";
import { EvidenceIntelligence } from "@/components/workspace/EvidenceIntelligence";
import { SowStudio } from "@/components/workspace/SowStudio";

export const Route = createFileRoute("/requests_/$id")({
  head: () => ({ meta: [{ title: "Industrial Maintenance Services SOW — Active Request" }] }),
  component: RequestWorkspaceWrapper,
});

function RequestWorkspaceWrapper() {
  const { id } = Route.useParams();
  return (
    <WorkspaceProvider requestId={id}>
      <RequestWorkspace />
    </WorkspaceProvider>
  );
}

const TABS = [
  { id: "summary", label: "Request Summary" },
  { id: "klydo", label: "Klydo Workflow" },
  { id: "supplier", label: "Supplier Review" },
  { id: "evidence-intel", label: "Evidence & Intelligence" },
  { id: "sow", label: "SOW Draft Studio" },
  { id: "redline", label: "Redline Review" },
  { id: "approvals", label: "Approvals & History" },
  { id: "signature", label: "Signature & Activation" },
] as const;

function RequestWorkspace() {
  const { state } = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("summary");
  const [vendorPanelOpen, setVendorPanelOpen] = useState(false);

  const status = state.contractActivated
    ? "Active"
    : state.supplierConfirmed
      ? "Evidence & Drafting"
      : "Supplier Review In Progress";

  return (
    <AppLayout title="Industrial Maintenance Services Renewal – 2026" subtitle="REQ-IMS-2026-014 · 3-year renewal · $2.4M · Incumbent: Apex Industrial Services">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Link to="/requests" className="text-muted-foreground hover:text-foreground">Active Requests</Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">Industrial Maintenance Services Renewal – 2026</span>
          <span className="ml-3 rounded-full bg-accent2/15 text-accent2 px-2 py-0.5 font-medium">{status}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setVendorPanelOpen(true)} className="gap-1.5">
          <MessageSquareText className="h-4 w-4" /> Vendor Exchange Panel
        </Button>
      </div>

      {/* Blueprint · Summary · Progress accordion */}
      <Accordion type="multiple" defaultValue={["blueprint", "summary", "progress"]} className="rounded-xl border overflow-hidden mb-4">
        <AccordionItem value="blueprint" className="border-b border-accent2/30 bg-accent2/5">
          <AccordionTrigger className="px-3 py-2 text-[10px] uppercase tracking-wider text-accent2 font-semibold hover:no-underline">
            Blueprint Applied: Source-to-Contract Intelligence Lifecycle
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] text-muted-foreground px-3">
              {["Intake", "Category Strategy", "Market Discovery", "RFP Decision", "Supplier Shortlist", "Bid/SOW Comparison", "Award Recommendation", "Contract Package", "Approval", "Signature", "Monitor", "Reconcile", "Renew"].map((s, i, arr) => (
                <span key={s} className="shrink-0 flex items-center gap-1">
                  <span>{s}</span>
                  {i < arr.length - 1 && <span className="text-muted-foreground/40">→</span>}
                </span>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="summary" className="border-b">
          <AccordionTrigger className="px-3 py-2 text-xs font-semibold hover:no-underline">
            Executive Summary
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-3">
              <div className="rounded-xl border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Category</div>
                <div className="text-sm font-semibold mt-1">Industrial Maintenance Services</div>
                <div className="text-xs text-muted-foreground mt-0.5">3-year SOW · Multi-site · Critical operations</div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sourcing Path</div>
                <div className="text-sm font-semibold mt-1">Targeted competitive review</div>
                <div className="text-xs text-muted-foreground mt-0.5">Incumbent benchmarked against alternates</div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recommended Vendor</div>
                <div className="text-sm font-semibold mt-1">Apex Industrial Services</div>
                <div className="text-xs text-muted-foreground mt-0.5">Pending buyer confirmation</div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Value Under Control</div>
                <div className="text-sm font-semibold mt-1">7% modeled value protection</div>
                <div className="text-xs text-muted-foreground mt-0.5">Leakage · Reconciliation · SLA · Invoice controls</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="progress" className="border-b-0">
          <AccordionTrigger className="px-3 py-2 text-xs font-semibold hover:no-underline">
            Workflow Progress
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto text-[11px] px-3">
              {["Intake", "Supplier Review", "Evidence", "Drafting", "Redline", "Legal", "Finance", "Mgr Approval", "Signature", "Activation", "Monitoring"].map((s, i, arr) => {
                const stageIdx = state.contractActivated ? 10 : state.redlineUploaded ? 5 : state.supplierConfirmed ? 3 : 1;
                const done = i <= stageIdx;
                return (
                  <div key={s} className="flex items-center gap-1.5 shrink-0">
                    <div className={`h-2 w-2 rounded-full ${done ? "bg-accent2" : "bg-muted-foreground/30"}`} />
                    <span className={done ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                    {i < arr.length - 1 && <span className="text-muted-foreground/40 mx-1">→</span>}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition ${tab === t.id ? "border-accent2 text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && <RequestSummary />}
      {tab === "klydo" && <KlydoWorkflow />}
      {tab === "supplier" && <SupplierReview />}
      {tab === "evidence-intel" && <EvidenceIntelligence />}
      {tab === "sow" && <SowStudio />}
      {tab === "redline" && <RedlineReview />}
      {tab === "approvals" && <ApprovalsHistory />}
      {tab === "signature" && <SignatureActivation />}

      <VendorExchangePanel open={vendorPanelOpen} onClose={() => setVendorPanelOpen(false)} />
    </AppLayout>
  );
}

function RequestSummary() {
  const { state } = useDemo();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Business need</h3>
            <p className="text-sm text-muted-foreground">
              Multi-site industrial maintenance support with emergency response, preventive maintenance,
              materials pass-through, technician certification, and SLA / service credit controls.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Field label="Contract value" value="$2.4M estimated over 3 years" />
            <Field label="Sites / scope" value="6 plants, regional" />
            <Field label="Emergency SLA" value="4-hour response" />
            <Field label="Completion target" value="95% monthly" />
            <Field label="Service credit" value="1.5% if SLA missed two consecutive months" />
            <Field label="Change order rule" value="Approval required above $25K" />
            <Field label="Compliance" value="Insurance · safety · technician cert." />
            <Field label="Renewal review" value="120-day window" />
          </dl>
          <div className="pt-2 border-t">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Source</div>
            <SourceChip id="request-intake" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Supplier context</h3>
          <div className="space-y-2 text-xs">
            <SupplierLine name="Apex Industrial Services" tag={state.supplierConfirmed ? "Selected Supplier" : "Incumbent / known"} highlight={state.supplierConfirmed} />
            <SupplierLine name="Northstar Maintenance Group" tag="Historical alternate" />
            <SupplierLine name="Elevate Field Services" tag="New vendor option" />
          </div>
          {!state.supplierConfirmed && (
            <div className="rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-[11px] text-warning">
              Apex appears as incumbent. Selection requires Procurement Buyer confirmation.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Category Strategy Applied</h3>
            <SourceChip id="category-playbook-ims" />
          </div>
          <dl className="text-xs space-y-1.5">
            <div><dt className="text-muted-foreground inline">Procurement type: </dt><dd className="inline">Service procurement with materials pass-through</dd></div>
            <div><dt className="text-muted-foreground inline">Sourcing playbook: </dt><dd className="inline">Industrial Maintenance Services Renewal</dd></div>
            <div><dt className="text-muted-foreground inline">Primary benchmarks: </dt><dd className="inline">labor rates, escalation, SLA response, service completion, HSSE, certifications, change-order exposure</dd></div>
            <div><dt className="text-muted-foreground inline">Secondary benchmarks: </dt><dd className="inline">materials pass-through, markup, invoice support</dd></div>
            <div><dt className="text-muted-foreground inline">Not primary for this request: </dt><dd className="inline">inventory turns, warehouse carrying cost, commodity stockout risk</dd></div>
            <div><dt className="text-muted-foreground inline">Buyer decision needed: </dt><dd className="inline font-medium">Confirm sourcing path</dd></div>
          </dl>
          <p className="text-[11px] text-muted-foreground border-t pt-2">
            For material procurement, benchmark criteria would shift to unit price, lead time, freight, quality/spec compliance, inventory availability, warranty, volume discount, manufacturer price-change evidence, substitution risk, and supplier delivery reliability.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="text-sm font-semibold">Value Protection Summary</h3>
          <p className="text-[11px] text-muted-foreground -mt-1">Each metric is source-backed. Expand to view calculation basis.</p>
          <ul className="text-xs space-y-1.5">
            <ValueProtectionRow label="Escalation exposure avoided" value="$48K"
              sources={["apex-rate-card-v2", "market-benchmark", "escalation-cap-clause"]}
              calc="Modeled avoided exposure based on 5% proposed escalation vs 3% recommended cap over the labor-rate portion of the 3-year package." />
            <ValueProtectionRow label="Scope-gap exposure prevented" value="$74K"
              sources={["prior-change-order", "northstar-prior-sow", "exhibit-d"]}
              calc="Modeled avoided exposure from prior scope gap that previously required a change order. The new Exhibit D draft inserts weekend emergency coverage upfront." />
            <ValueProtectionRow label="Invoice-rate variance flagged" value="$18.6K"
              sources={["invoice-1842", "apex-rate-card-v2", "exhibit-c"]}
              calc="Modeled exception based on invoice labor/rate lines compared against the approved rate card and invoice support requirements." />
            <ValueProtectionRow label="Materials markup exposure reviewed" value="$12K"
              sources={["exhibit-c", "exhibit-c1"]}
              calc="Modeled review based on materials pass-through, markup rules, and required supporting invoice evidence." />
            <ValueProtectionRow label="Service credit opportunity" value="$42K"
              sources={["sla-logs", "service-credit-clause", "exhibit-d"]}
              calc="Modeled service credit opportunity triggered when SLA target is missed for two consecutive months." />
            <li className="flex justify-between rounded border border-accent2/40 bg-accent2/5 p-2"><span className="font-medium">Total value under control</span><span className="font-semibold text-accent2">$194.6K modeled</span></li>
          </ul>
          <p className="text-[11px] text-muted-foreground pt-1">
            Demo seed values. In production, calculations would use approved contract terms, historical spend, supplier data, invoices, performance records, and CITGO-approved benchmark sources.
          </p>
        </div>

      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-0.5">{value}</dd>
    </div>
  );
}

function ValueProtectionRow({ label, value, sources, calc }: { label: string; value: string; sources: string[]; calc: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded border p-2">
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          <button onClick={() => setOpen((o) => !o)} className="text-[10px] text-accent2 hover:underline">
            {open ? "Hide" : "View calculation"}
          </button>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {sources.map((s) => <SourceChip key={s} id={s} />)}
      </div>
      {open && (
        <div className="mt-1.5 rounded bg-muted/40 p-2 text-[11px] text-muted-foreground">{calc}</div>
      )}
    </li>
  );
}


function SupplierLine({ name, tag, highlight }: { name: string; tag: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{name}</span>
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${highlight ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{tag}</span>
    </div>
  );
}

function KlydoWorkflow() {
  const { state } = useDemo();
  const requestTasks = state.klydoTasks.filter((t) => t.relatedRequest === "ind-maint-sow");
  const steps = [
    "Intake received",
    "Category strategy applied",
    "Sourcing path review",
    "RFP trigger check",
    "Supplier shortlist",
    "Bid / SOW response comparison",
    "Award recommendation",
    "Contract package build",
    "Legal / Finance / Business approvals",
    "Signature & activation",
    "Execution monitoring",
  ];
  const [blueprint, setBlueprint] = useState<"pending" | "confirmed" | "modify">("pending");
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-accent2/5 border-accent2/30 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-accent2 font-semibold">Blueprint</div>
            <div className="text-sm font-semibold mt-0.5">Source-to-Contract Intelligence Lifecycle · Industrial Maintenance Services</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Intake → Category strategy → Sourcing path → RFP trigger → Shortlist → Comparison → Award → Contract package → Approvals → Signature → Monitoring
            </p>
          </div>
          {blueprint === "pending" && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBlueprint("confirmed")} className="text-xs font-medium px-3 py-1.5 rounded-md bg-accent2 text-white hover:opacity-90">Confirm Blueprint</button>
              <button onClick={() => setBlueprint("modify")} className="text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted">Modify Blueprint</button>
            </div>
          )}
          {blueprint === "confirmed" && (
            <span className="text-[11px] rounded-full bg-success/15 text-success border border-success/30 px-2.5 py-1 font-medium">Blueprint Confirmed</span>
          )}
          {blueprint === "modify" && (
            <span className="text-[11px] rounded-full bg-warning/15 text-warning border border-warning/30 px-2.5 py-1 font-medium">Modification requested · routed to Procurement Manager</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Workflow timeline</h3>
          <ol className="space-y-2 text-sm">
            {steps.map((s, i) => {
              const stageIdx = state.contractActivated ? 11 : state.redlineUploaded ? 6 : state.supplierConfirmed ? 4 : 1;
              const done = i < stageIdx;
              const current = i === stageIdx;
              return (
                <li key={s} className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-medium ${done ? "bg-success text-success-foreground" : current ? "bg-accent2 text-white" : "bg-muted text-muted-foreground"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={done ? "text-muted-foreground line-through" : current ? "font-medium" : ""}>{s}</span>
                  {current && <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5">in progress</span>}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Klydo work items</h3>
          <div className="space-y-2">
            {requestTasks.map((t) => <KlydoTaskCard key={t.id} task={t} compact />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierReview() {
  const { state, confirmSupplier } = useDemo();
  const [override, setOverride] = useState<null | "rfp" | "override" | "confirmed">(state.supplierConfirmed ? "confirmed" : null);
  const cmp = vendors.slice(0, 3);
  return (
    <div className="space-y-4">
      {/* 1. Sourcing Path Recommendation */}
      <div className="rounded-xl border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5 font-semibold">STEP 1</span>
          <h3 className="text-sm font-semibold">Sourcing Path Recommendation</h3>
        </div>
        <div className="text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><span className="text-muted-foreground">Recommended path:</span> Incumbent renewal with competitive market check</div>
          <div><span className="text-muted-foreground">RFI/RFP/Tender:</span> Not required currently</div>
          <div className="md:col-span-2"><span className="text-muted-foreground">Why:</span> Apex is incumbent, lower transition risk; pricing and scope protections required.</div>
          <div className="md:col-span-2"><span className="text-muted-foreground">Trigger RFP if:</span> escalation exceeds cap, SLA weakens, pricing variance exceeds threshold, or risk score increases.</div>
        </div>
        <div className="text-[11px] text-warning">Klydo action: Procurement Manager approval required for buyer validation.</div>
      </div>

      {/* 2. Supplier Shortlist */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5 font-semibold">STEP 2</span>
          <h3 className="text-sm font-semibold">Supplier Shortlist</h3>
        </div>
        <ul className="text-xs space-y-1">
          <li className="flex justify-between rounded border p-2"><span>Apex Industrial Services</span><span className="text-success">Incumbent · Recommended with conditions</span></li>
          <li className="flex justify-between rounded border p-2"><span>Northstar Maintenance Group</span><span className="text-muted-foreground">Historical alternate · Benchmark reference</span></li>
          <li className="flex justify-between rounded border p-2"><span>Elevate Field Services</span><span className="text-muted-foreground">New vendor · Market comparison</span></li>
        </ul>
      </div>

      {/* 3. Bid / SOW Response Comparison */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5 font-semibold">STEP 3</span>
          <span className="text-sm font-semibold">Bid / SOW Response Comparison</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Dimension</th>
              {cmp.map((v) => (
                <th key={v.id} className="text-left px-3 py-2 font-medium">
                  <div>{v.name}</div>
                  <div className="text-[10px] font-normal mt-0.5">
                    {state.supplierConfirmed && v.id === "apex" ? (
                      <span className="rounded bg-success/15 text-success px-1.5 py-0.5">Selected Supplier</span>
                    ) : (
                      <span className="rounded bg-muted px-1.5 py-0.5">{v.status}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Labor escalation", "5% proposed → 3% recommended", "3%", "3%"],
              ["Emergency SLA", "4 hours", "6 hours", "4 hours"],
              ["Completion target", "95%", "93%", "95%"],
              ["3-yr est. cost", cmp[0].cost, cmp[1].cost, cmp[2].cost],
              ["Change-order exposure", cmp[0].changeOrderExposure, cmp[1].changeOrderExposure, cmp[2].changeOrderExposure],
              ["Compliance readiness", cmp[0].compliance, cmp[1].compliance, cmp[2].compliance],
              ["Transition risk", cmp[0].transitionRisk, cmp[1].transitionRisk, cmp[2].transitionRisk],
              ["Scope exceptions", "Weekend coverage clarification needed", "Prior gaps", "Clean but untested"],
              ["HSSE readiness", "Strong", "Moderate", "Needs onboarding"],
              ["Recommendation", cmp[0].recommendation, cmp[1].recommendation, cmp[2].recommendation],
            ].map((r) => (
              <tr key={r[0] as string} className="border-t">
                {r.map((c, i) => <td key={i} className={`px-3 py-2 ${i === 0 ? "text-muted-foreground" : ""}`}>{c}</td>)}
              </tr>
            ))}
            <tr className="border-t bg-muted/20">
              <td className="px-3 py-2 text-muted-foreground">Sources</td>
              {cmp.map((v) => (
                <td key={v.id} className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {v.sources.map((s) => <SourceChip key={s} id={s} />)}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Source-to-Procure Value Protection */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5 font-semibold">STEP 4</span>
          <h3 className="text-sm font-semibold">Source-to-Procure Value Protection</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border p-3"><div className="text-muted-foreground">Escalation exposure avoided</div><div className="font-semibold mt-0.5">$48K modeled</div><div className="mt-1"><SourceChip id="escalation-cap-clause" /></div></div>
          <div className="rounded-lg border p-3"><div className="text-muted-foreground">Scope-gap exposure prevented</div><div className="font-semibold mt-0.5">$74K modeled</div><div className="mt-1"><SourceChip id="prior-change-order" /></div></div>
          <div className="rounded-lg border p-3"><div className="text-muted-foreground">Award risk avoided (HSSE/site readiness)</div><div className="font-semibold mt-0.5">Qualitative</div><div className="mt-1"><SourceChip id="exhibit-e" /></div></div>
        </div>
      </div>

      {/* 5. Recommended Award Direction */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5 font-semibold">STEP 5</span>
          <h3 className="text-sm font-semibold">Recommended Award Direction</h3>
        </div>
        <p className="text-xs mb-2 font-medium text-accent2">Conditional award to Apex Industrial Services (pending buyer confirmation)</p>
        <p className="text-[11px] text-muted-foreground mb-2">Required conditions:</p>
        <ul className="text-xs space-y-1 list-disc list-inside">
          <li>Apply 3% annual escalation cap</li>
          <li>Restore 4-hour emergency response SLA</li>
          <li>Maintain 95% monthly service completion target</li>
          <li>Add 1.5% service credit if SLA target is missed for two consecutive months</li>
          <li>Insert prior change-order scope item into Exhibit D</li>
          <li>Require approval for change orders above $25K</li>
          <li>Validate materials pass-through and markup rules</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-1">
          <SourceChip id="apex-rate-card-v2" />
          <SourceChip id="sla-logs" />
          <SourceChip id="escalation-cap-clause" />
          <SourceChip id="service-credit-clause" />
          <SourceChip id="prior-change-order" />
        </div>
      </div>

      {/* 6. Confirm / Override */}
      <div className="rounded-xl border bg-accent2/5 border-accent2/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] rounded bg-accent2/15 text-accent2 px-1.5 py-0.5 font-semibold">STEP 6</span>
          <h3 className="text-sm font-semibold">Confirm / Override Decision</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">Buyer validation required. Human decision governs the sourcing outcome.</p>
        {state.supplierConfirmed ? (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-semibold">Selected Supplier: Apex Industrial Services</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button onClick={confirmSupplier} className="gap-1.5"><CheckCircle2 className="h-4 w-4" /> Confirm Recommended Supplier</Button>
              <Button variant="outline" onClick={() => setOverride("rfp")}>Request RFI/RFP/Tender Path</Button>
              <Button variant="outline" onClick={() => setOverride("override")}>Override Recommendation</Button>
            </div>
            {override === "rfp" && (
              <div className="mt-3 rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-[11px] text-warning">
                RFI/RFP/Tender path requested. Klydo will route to Procurement Manager for approval and open a competitive event.
              </div>
            )}
            {override === "override" && (
              <div className="mt-3 rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-[11px] text-warning">
                Override recorded. Klydo will require justification and re-route award direction for Procurement Manager approval.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


// (Old EvidencePackTab, ContractIntelTab, DraftSOW inline components removed —
//  merged into workspace/EvidenceIntelligence.tsx and workspace/SowStudio.tsx.)



function RedlineReview() {
  const { state, uploadRedline } = useDemo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    if (name.includes("redline") || name.includes("apex_redline") || name.includes("apex redline")) {
      uploadRedline(f.name);
      setMsg(null);
    } else {
      setMsg("Demo supports predefined upload artifact for this flow. Try a file named like 'Apex_Redline_v3.pdf'.");
    }
  };

  const risks = [
    { title: "Escalation changed from 3% to 5%", risk: "High", impact: "Commercial exposure — labor rate escalation above approved cap", fallback: "Restore 3% annual escalation cap", sources: ["escalation-cap-clause", "apex-redline-v3"] },
    { title: "SLA language softened from 4-hour emergency response to commercially reasonable response", risk: "High", impact: "Operational response risk on emergency events", fallback: "Restore 4-hour emergency response SLA", sources: ["emergency-coverage", "apex-redline-v3"] },
    { title: "Service credit deleted", risk: "High", impact: "Performance enforcement risk — credit not payable on SLA miss", fallback: "Restore 1.5% service credit if SLA target is missed for two consecutive months", sources: ["service-credit-clause", "apex-redline-v3"] },
    { title: "Scope exception added for weekend emergency coverage", risk: "Medium", impact: "Change-order exposure on weekend events", fallback: "Clarify weekend emergency coverage in Exhibit D", sources: ["prior-change-order", "exhibit-d"] },
  ];

  const showFindings = state.redlineUploaded;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold">Redline Intelligence & Fallback Review</h3>
            <p className="text-xs text-muted-foreground">This does not replace the redlining workflow. It reuses prior redline history, accepted fallback positions, and approved clause guidance to support faster risk review.</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { uploadRedline("Apex_Redline_v3.pdf"); }}>
              Use Sample Redline
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Redline
            </Button>
          </div>
        </div>
        {state.redlineUploaded && (
          <div className="mt-3 rounded-md bg-success/10 border border-success/30 px-3 py-2 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span><strong>{state.redlineFileName}</strong> received · governance status: Pending Legal Review</span>
          </div>
        )}
        {msg && <div className="mt-3 rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-xs text-warning">{msg}</div>}
      </div>

      {!showFindings && (
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold">Sample Apex Redline v3 Analysis</h3>
            <p className="text-xs text-muted-foreground">Load seeded redline findings to walk through the fallback review flow without uploading a file.</p>
          </div>
          <Button onClick={() => uploadRedline("Apex_Redline_v3.pdf")} className="gap-1.5">Use Sample Redline</Button>
        </div>
      )}

      {showFindings && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-semibold">Sample Apex Redline v3 Analysis</div>
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Vendor Change</th>
                <th className="text-left px-3 py-2 font-medium">Risk</th>
                <th className="text-left px-3 py-2 font-medium">Recommended Fallback</th>
                <th className="text-left px-3 py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.title} className="border-t align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-muted-foreground mt-0.5">{r.impact}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${r.risk === "High" ? "bg-risk/15 text-risk" : "bg-warning/15 text-warning"}`}>{r.risk}</span>
                  </td>
                  <td className="px-3 py-2">{r.fallback}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.sources.map((s) => <SourceChip key={s} id={s} />)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function ApprovalsHistory() {
  const { state, setApproval } = useDemo();
  const rows: { k: "legal" | "finance" | "procurement" | "signatory"; label: string; owner: string }[] = [
    { k: "legal", label: "Legal approval", owner: "Legal Reviewer" },
    { k: "finance", label: "Finance approval", owner: "Finance Reviewer" },
    { k: "procurement", label: "Procurement Manager approval", owner: "Procurement Manager" },
    { k: "signatory", label: "Authorized Signatory readiness", owner: "Authorized Signatory" },
  ];
  const decisionLog = [
    ["Procurement type", "Service + materials pass-through", "Accepted", "success"],
    ["Sourcing path", "Incumbent renewal + market check", "Pending manager approval", "warning"],
    ["RFP trigger", "Not required currently", "Accepted", "success"],
    ["Award direction", "Conditional Apex renewal", "Pending approval", "warning"],
    ["Escalation cap", "3% max", "Finance review", "warning"],
    ["Scope-gap insertion", "Include weekend emergency coverage", "Business SME review", "warning"],
    ["Downstream flag", "Require human validation", "Accepted", "success"],
  ] as const;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Decision Log / Buyer Override</div>
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Decision</th>
              <th className="text-left px-4 py-2 font-medium">Recommendation</th>
              <th className="text-left px-4 py-2 font-medium">Human action</th>
            </tr>
          </thead>
          <tbody>
            {decisionLog.map(([d, rec, act, tone]) => (
              <tr key={d} className="border-t">
                <td className="px-4 py-2 font-medium">{d}</td>
                <td className="px-4 py-2 text-muted-foreground">{rec}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${tone === "success" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{act}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Approval</th>
              <th className="text-left px-4 py-2.5 font-medium">Owner</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Source / Comment</th>
              <th className="text-left px-4 py-2.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = state.approvals[r.k];
              return (
                <tr key={r.k} className="border-t">
                  <td className="px-4 py-3">{r.label}</td>
                  <td className="px-4 py-3 text-xs">{r.owner}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${st === "Approved" ? "bg-success/15 text-success" : st === "Rejected" ? "bg-risk/15 text-risk" : "bg-muted text-muted-foreground"
                      }`}>{st}</span>
                  </td>
                  <td className="px-4 py-3 text-xs"><SourceChip id="service-credit-clause" /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setApproval(r.k, "Approved")}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setApproval(r.k, "Rejected")}>Reject</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SignatureActivation() {
  const { state, activateContract } = useDemo();
  const allApproved = Object.values(state.approvals).every((s) => s === "Approved");
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Signed-vs-Approved Validation</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Approved version</div>
            <div className="font-medium">SOW v4 (approved)</div>
            <SourceChip id="sow-template" />
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Signed version</div>
            <div className="font-medium">SOW v4 (signed)</div>
            <SourceChip id="signed-sow" />
          </div>
        </div>
        <div className="mt-3 rounded-md bg-success/10 border border-success/30 px-3 py-2 text-xs flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success" />
          Signed version matches approved version except non-material formatting changes.
        </div>
        <div className="mt-2 rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-[11px] text-warning">
          If service credit language had changed, Klydo would route Legal review before activation.
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-2">Obligation-to-Control Activation</h3>
        <ul className="text-xs space-y-1.5">
          {[
            ["3% escalation cap", "rate increase check"],
            ["4-hour emergency SLA", "SLA response monitoring"],
            ["95% monthly completion", "service completion tracking"],
            ["1.5% service credit", "credit review trigger"],
            ["Change order approval >$25K", "approval gate"],
            ["Materials pass-through", "markup / invoice validation"],
            ["Rebates / discounts", "commercial benefit check"],
          ].map(([o, c]) => (
            <li key={o} className="flex items-center justify-between rounded border p-2">
              <span>{o}</span>
              <span className="text-muted-foreground">→ {c}</span>
            </li>
          ))}
        </ul>
      </div>


      <div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Contract activation</div>
          <div className="text-xs text-muted-foreground">
            {state.contractActivated ? "Contract is Active. Execution Monitoring is enabled." : "Activates the contract and enables Execution Monitoring."}
          </div>
        </div>
        {state.contractActivated ? (
          <span className="rounded-full bg-success/15 text-success px-3 py-1 text-xs font-semibold">Active</span>
        ) : (
          <Button onClick={activateContract} disabled={!allApproved && false}>Activate Contract</Button>
        )}
      </div>
      {!allApproved && !state.contractActivated && (
        <p className="text-[11px] text-muted-foreground">Tip: approve all four roles under Approvals & History before activation in a real flow.</p>
      )}
    </div>
  );
}

function VendorExchangePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, uploadRedline } = useDemo();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-[480px] bg-background border-l shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Vendor Exchange Panel</h3>
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Apex Industrial Services · Contextual to this request</p>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Vendor documentation checklist</h4>
            <div className="space-y-2">
              {vendorChecklist.map((c) => {
                const isRedline = c.item.includes("Redline");
                const status = isRedline && state.redlineUploaded ? "Submitted" : c.status;
                return (
                  <div key={c.item} className="flex items-center justify-between text-xs rounded border p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span>{c.item}</span>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${status === "Approved" ? "bg-success/15 text-success" :
                      status === "Submitted" || status === "Under Review" ? "bg-warning/15 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>{status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <h4 className="text-xs font-semibold mb-2">Upload Apex Redline v3</h4>
            <input ref={fileRef} type="file" hidden onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const n = f.name.toLowerCase();
              if (n.includes("redline")) uploadRedline(f.name);
              else uploadRedline("Apex_Redline_v3.pdf");
            }} />
            <Button size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
            {state.redlineUploaded && <p className="mt-2 text-xs text-success">✓ {state.redlineFileName} submitted</p>}
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Negotiation notes</h4>
            <div className="space-y-2">
              {negotiationNotes.map((n) => (
                <div key={n.ts} className="rounded-lg border p-3 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{n.owner} · {n.ts}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5">{n.visibility}</span>
                  </div>
                  <p className="mt-1">{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Linked clause: {n.linkedClause}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
