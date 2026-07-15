import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { useState, useRef } from "react";
import { vendors, sourceArtifacts, vendorChecklist, negotiationNotes } from "@/lib/mock-data";
import { KlydoTaskCard } from "@/components/KlydoTaskCard";
import { SourceChip } from "@/components/SourceChip";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, FileText, AlertTriangle, ShieldCheck, MessageSquareText, ChevronRight, Sparkles, Users, Download } from "lucide-react";
import { WorkspaceProvider } from "@/lib/workspace/WorkspaceProvider";
import { EvidenceIntelligence } from "./workspace/EvidenceIntelligence";
import { SowStudio } from "./workspace/SowStudio";

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

      {/* Blueprint strip */}
      <div className="rounded-xl border border-accent2/30 bg-accent2/5 p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-accent2 font-semibold mb-1.5">Blueprint Applied: Source-to-Contract Intelligence Lifecycle</div>
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] text-muted-foreground">
          {["Intake","Category Strategy","Market Discovery","RFP Decision","Supplier Shortlist","Bid/SOW Comparison","Award Recommendation","Contract Package","Approval","Signature","Monitor","Reconcile","Renew"].map((s, i, arr) => (
            <span key={s} className="shrink-0 flex items-center gap-1">
              <span>{s}</span>
              {i < arr.length - 1 && <span className="text-muted-foreground/40">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Executive summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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

      {/* Klydo progress strip */}
      <div className="rounded-xl border bg-card p-3 mb-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
          {["Intake","Supplier Review","Evidence","Drafting","Redline","Legal","Finance","Mgr Approval","Signature","Activation","Monitoring"].map((s, i, arr) => {
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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition ${
              tab === t.id ? "border-accent2 text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
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
            sources={["apex-rate-card-v2","market-benchmark","escalation-cap-clause"]}
            calc="Modeled avoided exposure based on 5% proposed escalation vs 3% recommended cap over the labor-rate portion of the 3-year package." />
          <ValueProtectionRow label="Scope-gap exposure prevented" value="$74K"
            sources={["prior-change-order","northstar-prior-sow","exhibit-d"]}
            calc="Modeled avoided exposure from prior scope gap that previously required a change order. The new Exhibit D draft inserts weekend emergency coverage upfront." />
          <ValueProtectionRow label="Invoice-rate variance flagged" value="$18.6K"
            sources={["invoice-1842","apex-rate-card-v2","exhibit-c"]}
            calc="Modeled exception based on invoice labor/rate lines compared against the approved rate card and invoice support requirements." />
          <ValueProtectionRow label="Materials markup exposure reviewed" value="$12K"
            sources={["exhibit-c","exhibit-c1"]}
            calc="Modeled review based on materials pass-through, markup rules, and required supporting invoice evidence." />
          <ValueProtectionRow label="Service credit opportunity" value="$42K"
            sources={["sla-logs","service-credit-clause","exhibit-d"]}
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


function EvidencePackTab() {
  const { state } = useDemo();
  const packageRows = [
    { n: "Preamble / Master Agreement", status: "Ready", intel: "parties, term, value, authorized reps", id: "preamble" },
    { n: "Exhibit A-1 General T&Cs", status: "Applied", intel: "change orders, audit rights, records, overcharge recovery", id: "exhibit-a1" },
    { n: "Exhibit B-1 Insurance & Indemnity", status: "Applied", intel: "insurance limits, indemnity, additional insured", id: "exhibit-b1" },
    { n: "Exhibit C Compensation & Invoicing", status: "Applied", intel: "payment method, invoices, timesheets, discounts/rebates", id: "exhibit-c" },
    { n: "Exhibit C-1 Pricing / WRBS", status: "Applied", intel: "pricing review, markup, escalation, rate controls", id: "exhibit-c1" },
    { n: "Exhibit D Scope of Work", status: "Drafting", intel: "services, SLA, scope-gap insertions", id: "exhibit-d" },
    { n: "Exhibit E HSSE Requirements", status: "Applied", intel: "safety, training, permits, H2S, TWIC", id: "exhibit-e" },
    { n: "Exhibit G Change Order Form", status: "Applied", intel: "formal change order process", id: "exhibit-g" },
  ];
  return (
    <div className="space-y-4">
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-1">Contract Package Evidence Pack — Contract Package Builder</h3>
      <p className="text-xs text-muted-foreground mb-3">Exhibit-based structure with governed intelligence extraction.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5 font-medium">Exhibit</th>
              <th className="text-left px-2 py-1.5 font-medium">Status</th>
              <th className="text-left px-2 py-1.5 font-medium">Intelligence extracted</th>
              <th className="text-left px-2 py-1.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {packageRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-2 py-1.5 font-medium">{r.n}</td>
                <td className="px-2 py-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${r.status === "Applied" ? "bg-success/15 text-success" : r.status === "Drafting" ? "bg-warning/15 text-warning" : "bg-accent2/15 text-accent2"}`}>{r.status}</span>
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">{r.intel}</td>
                <td className="px-2 py-1.5"><SourceChip id={r.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
        <span className="text-muted-foreground uppercase tracking-wide">Package sources:</span>
        {["GEP","OpenText","SAP","Supplier Submission","Internal Template Library","Buyer Upload"].map((s) => (
          <span key={s} className="rounded bg-muted px-1.5 py-0.5">{s}</span>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Included evidence</h3>
        <div className="space-y-2">
          {evidencePack.map((e) => {
            const a = sourceArtifacts[e.id];
            return (
              <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-accent2" />
                    <span className="text-sm font-medium">{a.name}</span>
                    <span className="rounded bg-source text-source-foreground text-[10px] px-1.5 py-0.5">{a.category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Used for: {e.usedFor}</div>
                  <div className="mt-1.5"><SourceChip id={e.id} /></div>
                </div>
                <span className={`text-[10px] rounded px-1.5 py-0.5 ${e.validation === "Validated" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {e.validation}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-2">Gaps / conflicts</h3>
          <ul className="text-xs space-y-1.5">
            <li className="flex gap-2"><AlertTriangle className="h-3 w-3 text-warning mt-0.5" /> 3 technician certifications pending renewal</li>
            <li className="flex gap-2"><AlertTriangle className="h-3 w-3 text-warning mt-0.5" /> Northstar prior SOW shows $74K scope-gap pattern</li>
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-2">Linked Klydo tasks</h3>
          {state.klydoTasks.filter((t) => ["k2","k3"].includes(t.id)).map((t) => <KlydoTaskCard key={t.id} task={t} compact />)}
        </div>
      </div>
    </div>
    </div>
  );
}

function ContractIntelTab() {
  const extracted = [
    { term: "3% escalation cap", source: "Exhibit C-1 / pricing logic", control: "pricing variance check", srcId: "exhibit-c1" },
    { term: "4-hour emergency SLA", source: "Exhibit D", control: "SLA response monitoring", srcId: "exhibit-d" },
    { term: "95% monthly completion target", source: "Exhibit D", control: "service completion rule", srcId: "exhibit-d" },
    { term: "1.5% service credit", source: "Exhibit D / commercial terms", control: "service credit review", srcId: "exhibit-d" },
    { term: "Change order approval above $25K", source: "Exhibit A-1 / Exhibit G", control: "change-order approval gate", srcId: "exhibit-g" },
    { term: "Materials markup", source: "Exhibit C / Exhibit C-1", control: "markup validation", srcId: "exhibit-c1" },
    { term: "Rebates / discounts pass-through", source: "Exhibit C", control: "commercial benefit check", srcId: "exhibit-c" },
    { term: "Audit rights / overcharge recovery", source: "Exhibit A-1", control: "recovery evidence", srcId: "exhibit-a1" },
  ];
  return (
    <div className="space-y-4">
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-1">Extracted Terms → Business Controls</h3>
      <p className="text-xs text-muted-foreground mb-3">Flat exhibit language becomes structured sourcing intelligence and post-signature monitoring rules.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5 font-medium">Extracted term</th>
              <th className="text-left px-2 py-1.5 font-medium">Source</th>
              <th className="text-left px-2 py-1.5 font-medium">Control created</th>
              <th className="text-left px-2 py-1.5 font-medium">Chip</th>
            </tr>
          </thead>
          <tbody>
            {extracted.map((r) => (
              <tr key={r.term} className="border-t">
                <td className="px-2 py-1.5 font-medium">{r.term}</td>
                <td className="px-2 py-1.5 text-muted-foreground">{r.source}</td>
                <td className="px-2 py-1.5">{r.control}</td>
                <td className="px-2 py-1.5"><SourceChip id={r.srcId} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3">Recommendations</h3>
      <div className="space-y-2">
        {contractIntelligenceRecs.map((r) => (
          <div key={r.title} className="rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-accent2 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.impact}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {r.sources.map((s) => <SourceChip key={s} id={s} />)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Leak label="Prior change orders" value="$74K" />
        <Leak label="Invoice overbilling exposure" value="$12K detected" />
        <Leak label="Service credit exposure" value="$42K" />
        <Leak label="Escalation cap risk" value="3% capped" />
      </div>
    </div>
    </div>
  );
}

function Leak({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}

// ============================================================================
// SOW Draft Studio (rebuilt Draft SOW tab)
// Self-contained: local state only, seeded demo packet, upload intake,
// track-changes-style AI suggestions with Accept/Reject/Modify, audit trail.
// ============================================================================

type SuggestionStatus = "pending" | "accepted" | "rejected" | "modified";
type Suggestion = {
  id: string;
  section: string;
  classification: "Gap" | "Conflict" | "Fallback Clause" | "Value Protection" | "Needs Review" | "Covered" | "Variant" | "Redline Risk";
  governance: "AI recommendation only" | "Human approval required" | "Eligible for low-risk auto-apply";
  kind: "insert" | "delete" | "replace";
  before?: string;
  after: string;
  why: string;
  sources: string[];
  status: SuggestionStatus;
};

type SourceDoc = {
  id: string;
  name: string;
  type: string;
  status: "Ready" | "Applied" | "Drafting" | "Needs Review" | "Pending Classification" | "Uploaded / Intake Complete";
  origin: "Seeded" | "Uploaded";
  uploadedAt?: string;
};

type OutlineStatus = "none" | "ai" | "review" | "accepted" | "conflict";
type OutlineItem = { id: string; label: string; status: OutlineStatus };

type AuditEvent = { id: string; ts: string; actor: string; source: string; text: string };

const SEED_DOCS: SourceDoc[] = [
  { id: "prior-sow", name: "Prior Maintenance Services SOW", type: "SOW", status: "Applied", origin: "Seeded" },
  { id: "vendor-redline-v3", name: "Vendor Redline v3", type: "Redline", status: "Needs Review", origin: "Seeded" },
  { id: "rate-card", name: "Rate Card", type: "Pricing", status: "Applied", origin: "Seeded" },
  { id: "sla-log", name: "SLA Service Log", type: "Performance", status: "Ready", origin: "Seeded" },
  { id: "co-history", name: "Prior Change Order History", type: "History", status: "Applied", origin: "Seeded" },
  { id: "clause-library", name: "Approved Clause Library", type: "Library", status: "Drafting", origin: "Seeded" },
  { id: "invoice-sample", name: "Invoice Sample", type: "Invoice", status: "Ready", origin: "Seeded" },
];

const SEED_OUTLINE: OutlineItem[] = [
  { id: "s-need", label: "Business Need", status: "none" },
  { id: "s-scope", label: "Scope of Work", status: "accepted" },
  { id: "s-sla", label: "Emergency Response SLA", status: "conflict" },
  { id: "s-pm", label: "Preventive Maintenance", status: "none" },
  { id: "s-mat", label: "Materials Pass-Through", status: "review" },
  { id: "s-rate", label: "Rate Card / Pricing", status: "accepted" },
  { id: "s-credit", label: "Service Credits", status: "ai" },
  { id: "s-co", label: "Change Order Approval", status: "ai" },
  { id: "s-safety", label: "Safety & Insurance", status: "none" },
  { id: "s-cert", label: "Technician Certifications", status: "review" },
  { id: "s-renew", label: "Renewal Review", status: "none" },
];

const SEED_SUGGESTIONS: Suggestion[] = [
  {
    id: "sg-1",
    section: "Scope of Work",
    classification: "Gap",
    governance: "Human approval required",
    kind: "insert",
    after: "Weekend emergency coverage (Sat–Sun, 06:00–22:00) included in base scope; no separate change order required.",
    why: "Prior change-order history shows weekend coverage was added mid-term at premium rate. Closing the gap upfront prevents repeat leakage.",
    sources: ["prior-change-order", "exhibit-d"],
    status: "pending",
  },
  {
    id: "sg-2",
    section: "Emergency Response SLA",
    classification: "Conflict",
    governance: "Human approval required",
    kind: "replace",
    before: "Supplier shall respond to emergency events within eight (8) business hours.",
    after: "Supplier shall respond to emergency events within four (4) hours, 24×7, measured from ticket acknowledgement.",
    why: "Vendor Redline v3 softens the approved 4-hour response to 8 business hours. Approved position is 4-hour, 24×7.",
    sources: ["emergency-coverage", "apex-redline-v3"],
    status: "pending",
  },
  {
    id: "sg-3",
    section: "Service Credits",
    classification: "Fallback Clause",
    governance: "Human approval required",
    kind: "insert",
    after: "If monthly service completion target is missed for two consecutive months, Supplier shall issue a 1.5% service credit against the following month's invoice.",
    why: "Vendor Redline removed service credit language. Restoring approved fallback preserves performance enforcement.",
    sources: ["service-credit-clause", "clause-library"],
    status: "pending",
  },
  {
    id: "sg-4",
    section: "Rate Card / Pricing",
    classification: "Value Protection",
    governance: "Eligible for low-risk auto-apply",
    kind: "insert",
    after: "Labor rates governed by Exhibit B Rate Card. Annual escalation capped at 3% CPI-linked.",
    why: "Approved rate card and 3% escalation cap from clause library. Standard value protection insertion.",
    sources: ["apex-rate-card-v2", "escalation-cap-clause"],
    status: "pending",
  },
  {
    id: "sg-5",
    section: "Technician Certifications",
    classification: "Needs Review",
    governance: "Human approval required",
    kind: "insert",
    after: "All assigned technicians shall hold current OSHA 30 and site-specific safety certifications; certification records provided quarterly.",
    why: "Certification clause missing from current draft; required by category playbook.",
    sources: ["clause-library", "apex-insurance"],
    status: "pending",
  },
  {
    id: "sg-6",
    section: "Materials Pass-Through",
    classification: "Variant",
    governance: "AI recommendation only",
    kind: "replace",
    before: "Materials billed at cost plus reasonable handling.",
    after: "Materials billed at documented cost plus handling not to exceed 8%; invoices to include supplier receipts.",
    why: "Invoice sample shows handling variance up to 14%. Tighter language reduces invoice leakage.",
    sources: ["invoice-sample", "clause-library"],
    status: "pending",
  },
];

const REVIEWERS = ["Legal Reviewer", "Finance / Cost Control", "Business SME", "Contract Owner", "Procurement Manager"];

function DraftSOW() {
  const [packetLoaded, setPacketLoaded] = useState(true);
  const [docs, setDocs] = useState<SourceDoc[]>(SEED_DOCS);
  const [outline] = useState<OutlineItem[]>(SEED_OUTLINE);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SEED_SUGGESTIONS);
  const [selectedId, setSelectedId] = useState<string>(SEED_SUGGESTIONS[0].id);
  const [modifyText, setModifyText] = useState<string>("");
  const [comments, setComments] = useState<{ id: string; who: string; text: string; resolved: boolean }[]>([
    { id: "c1", who: "K. Nguyen · Legal", text: "Confirm fallback SLA language before send to vendor.", resolved: false },
    { id: "c2", who: "R. Patel · Finance", text: "Validate rate-card reference matches Exhibit B.", resolved: false },
  ]);
  const [newComment, setNewComment] = useState("");
  const [audit, setAudit] = useState<AuditEvent[]>([
    { id: "a0", ts: "09:14 AM", actor: "System", source: "Seeded Evidence", text: "Demo contract packet loaded (7 documents)." },
    { id: "a1", ts: "09:15 AM", actor: "System", source: "AI", text: "SOW draft v0.3 generated from packet." },
  ]);
  const [assistantMsg, setAssistantMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = suggestions.find((s) => s.id === selectedId) ?? suggestions[0];

  const reviewed = suggestions.filter((s) => s.status !== "pending").length;
  const total = suggestions.length;
  const pct = Math.round((reviewed / total) * 100);
  const unresolved = comments.filter((c) => !c.resolved).length;

  const pushAudit = (text: string, actor = "You · Contract Owner", source = "Human") =>
    setAudit((a) => [{ id: `a${Date.now()}`, ts: nowTs(), actor, source, text }, ...a]);

  const act = (id: string, status: SuggestionStatus, note?: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status, ...(note ? { after: note } : {}) } : s)));
    const s = suggestions.find((x) => x.id === id);
    if (!s) return;
    const verb = status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "modified";
    pushAudit(`${verb[0].toUpperCase() + verb.slice(1)} suggestion "${s.classification} · ${s.section}"`, "You · Contract Owner", "Human + AI");
  };

  const applyLowRisk = () => {
    const ids = suggestions.filter((s) => s.status === "pending" && s.governance === "Eligible for low-risk auto-apply").map((s) => s.id);
    if (!ids.length) return;
    setSuggestions((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, status: "accepted" } : s)));
    pushAudit(`Auto-applied ${ids.length} low-risk suggestion(s).`, "System", "AI");
  };

  const nextSuggestion = (dir: 1 | -1) => {
    const idx = suggestions.findIndex((s) => s.id === selectedId);
    const n = (idx + dir + suggestions.length) % suggestions.length;
    setSelectedId(suggestions[n].id);
    setModifyText("");
  };

  const assignReviewer = (id: string, r: string) => {
    pushAudit(`Assigned ${r} to "${suggestions.find((s) => s.id === id)?.section}".`, "You · Contract Owner", "Human");
  };

  const loadPacket = () => {
    setPacketLoaded(true);
    setDocs(SEED_DOCS);
    setSuggestions(SEED_SUGGESTIONS);
    pushAudit("Demo contract packet loaded (7 documents).", "System", "Seeded Evidence");
  };

  const generateSow = () => {
    pushAudit("SOW draft regenerated from packet + accepted suggestions.", "System", "AI");
  };

  const handleUpload = (files: FileList | null) => {
    if (!files || !files.length) return;
    const now = new Date().toLocaleString();
    const added: SourceDoc[] = Array.from(files).map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      type: (f.name.split(".").pop() || "file").toUpperCase(),
      status: "Uploaded / Intake Complete",
      origin: "Uploaded",
      uploadedAt: now,
    }));
    setDocs((d) => [...added, ...d]);
    added.forEach((a) => pushAudit(`Uploaded "${a.name}". Basic intake complete. Deep extraction requires the configured document intelligence pipeline.`, "You · Contract Owner", "Uploaded Document"));
  };

  const downloadSow = () => {
    const body = buildSowText(suggestions);
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Industrial_Maintenance_SOW_ExhibitD_v0.4.txt";
    a.click();
    URL.revokeObjectURL(url);
    pushAudit("SOW downloaded (Exhibit D v0.4).", "You · Contract Owner", "Human");
  };

  const exportEvidence = () => {
    const body = buildEvidencePack(docs, suggestions, audit);
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Evidence_Pack.txt";
    a.click();
    URL.revokeObjectURL(url);
    pushAudit("Evidence pack exported.", "You · Contract Owner", "Human");
  };

  const saveToWorkspace = () => pushAudit("SOW saved to workspace.", "You · Contract Owner", "Human");
  const saveToDrive = () => pushAudit("SOW saved to Drive (demo).", "You · Contract Owner", "Human");
  const submitForReview = () => pushAudit("SOW submitted for review.", "You · Contract Owner", "Human");

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((c) => [...c, { id: `c${Date.now()}`, who: "You · Contract Owner", text: newComment.trim(), resolved: false }]);
    pushAudit("Comment added.", "You · Contract Owner", "Human");
    setNewComment("");
  };
  const resolveComment = (id: string) => {
    setComments((c) => c.map((x) => (x.id === id ? { ...x, resolved: true } : x)));
    pushAudit("Comment resolved.", "You · Contract Owner", "Human");
  };

  const assistantPrompts = [
    "Why was this clause suggested?",
    "Which source supports this change?",
    "What happens if I reject this fallback?",
    "Which suggestions still need legal review?",
    "Summarize unresolved SOW issues",
  ];
  const askAssistant = (q: string) => {
    const canned: Record<string, string> = {
      "Why was this clause suggested?": `${selected.classification} · ${selected.section}: ${selected.why}`,
      "Which source supports this change?": `Sources: ${selected.sources.join(", ")}`,
      "What happens if I reject this fallback?": "Rejection is logged in the audit trail. Fallback clause is not applied; risk remains open for Redline Review.",
      "Which suggestions still need legal review?": `${suggestions.filter((s) => s.status === "pending" && s.governance === "Human approval required").length} suggestions require legal review.`,
      "Summarize unresolved SOW issues": `${suggestions.filter((s) => s.status === "pending").length} suggestions pending · ${unresolved} unresolved comments · ${outline.filter((o) => o.status === "conflict" || o.status === "review").length} outline items flagged.`,
    };
    setAssistantMsg(canned[q] || "See governed sources on the right.");
  };

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="rounded-xl border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SOW Draft Studio</div>
            <div className="text-sm font-semibold truncate">Industrial Maintenance Services SOW / Exhibit D</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
              <Badge tone="warn">Draft in Progress</Badge>
              <Badge tone="info">Initial Review</Badge>
              <Badge tone="ok"><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />Live Review</Badge>
              <button className="ml-1 text-muted-foreground hover:text-foreground underline underline-offset-2">Version history</button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StudioBtn onClick={generateSow} icon={<Sparkles className="h-3.5 w-3.5" />} label="Generate SOW" primary />
            <StudioBtn onClick={saveToWorkspace} icon={<FileText className="h-3.5 w-3.5" />} label="Save to Workspace" />
            <StudioBtn onClick={saveToDrive} icon={<Upload className="h-3.5 w-3.5" />} label="Save to Drive" />
            <StudioBtn onClick={downloadSow} icon={<Download className="h-3.5 w-3.5" />} label="Download SOW" />
            <StudioBtn onClick={exportEvidence} icon={<Download className="h-3.5 w-3.5" />} label="Export Evidence Pack" />
            <StudioBtn onClick={submitForReview} icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Submit for Review" />
          </div>
        </div>
        {/* Progress */}
        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex-1 min-w-[160px]">
            <div className="flex justify-between mb-0.5"><span>{reviewed} of {total} suggestions reviewed</span><span>{pct}%</span></div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-accent2" style={{ width: `${pct}%` }} /></div>
          </div>
          <div>{unresolved} unresolved comment{unresolved === 1 ? "" : "s"}</div>
          <div className="flex items-center gap-1">
            <button className="rounded border px-1.5 py-0.5 hover:bg-muted" onClick={() => nextSuggestion(-1)}>‹ Prev</button>
            <button className="rounded border px-1.5 py-0.5 hover:bg-muted" onClick={() => nextSuggestion(1)}>Next ›</button>
            <button className="rounded border px-1.5 py-0.5 hover:bg-muted" onClick={applyLowRisk}>Apply all low-risk</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* LEFT: Source docs + outline */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <div className="rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold flex items-center justify-between">
              <span>Source Documents</span>
              <span className="text-[10px] font-normal text-muted-foreground">{docs.length}</span>
            </div>
            <div className="p-2 space-y-1 max-h-[260px] overflow-auto">
              {docs.map((d) => (
                <div key={d.id} className="rounded border px-2 py-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 truncate font-medium text-[12px]">{d.name}</div>
                    <span className={`text-[9px] px-1 py-0.5 rounded ${d.origin === "Seeded" ? "bg-slate-100 text-slate-600" : "bg-accent2/15 text-accent2"}`}>{d.origin}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 text-muted-foreground">
                    <span>{d.type}</span>
                    <span title={statusTip(d.status)} className={`px-1 py-0.5 rounded text-[9px] ${docStatusClass(d.status)}`}>{d.status}</span>
                  </div>
                  {d.uploadedAt && <div className="text-[9px] text-muted-foreground mt-0.5">Uploaded {d.uploadedAt}</div>}
                </div>
              ))}
            </div>
            <div className="p-2 border-t space-y-1.5">
              <button className="w-full text-[11px] rounded-md border bg-background hover:bg-muted px-2 py-1.5" onClick={loadPacket}>
                {packetLoaded ? "Reload Demo Contract Packet" : "Load Demo Contract Packet"}
              </button>
              <button className="w-full text-[11px] rounded-md border bg-accent2 text-white hover:opacity-90 px-2 py-1.5 flex items-center justify-center gap-1" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3" /> Upload Contract Artifact
              </button>
              <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.xlsx,image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }} />
              <p className="text-[9px] text-muted-foreground leading-snug">Unknown uploads receive basic intake only. Deep extraction requires the configured document intelligence pipeline.</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold">SOW Outline</div>
            <div className="p-2 space-y-0.5">
              {outline.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-[11px] px-1.5 py-1 rounded hover:bg-muted">
                  <span>{o.label}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${outlineClass(o.status)}`}>{outlineLabel(o.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: document canvas */}
        <div className="col-span-12 lg:col-span-6 rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Exhibit D — Statement of Work</div>
              <div className="text-base font-semibold text-slate-900">Industrial Maintenance Services · Renewal 2026</div>
            </div>
            <span className="text-[10px] rounded bg-warning/15 text-warning px-1.5 py-0.5">Draft v0.4</span>
          </div>
          <div className="px-8 py-6 text-slate-800 space-y-5 min-h-[560px]">
            {SEED_OUTLINE.map((o) => {
              const secSug = suggestions.filter((s) => s.section === o.label);
              const body = sectionBody(o.label);
              return (
                <section key={o.id} className="group">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{o.label}</h4>
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-[10px] text-slate-500">
                      <button className="hover:text-slate-900" title="Edit">✎ Edit</button>
                      <button className="hover:text-slate-900" title="AI Refine">✨ AI Refine</button>
                      <button className="hover:text-slate-900" title="Add Comment">💬 Comment</button>
                      <button className="hover:text-slate-900" title="View Sources">🔗 Sources</button>
                    </div>
                  </div>
                  {body && <p className="text-sm mt-1 leading-relaxed">{body}</p>}
                  {secSug.map((s) => (
                    <div key={s.id} className={`mt-2 rounded border-l-2 pl-2 pr-2 py-1.5 cursor-pointer text-sm leading-relaxed ${selectedId === s.id ? "bg-amber-50 border-amber-500" : "bg-slate-50 border-slate-300 hover:bg-amber-50/60"}`} onClick={() => { setSelectedId(s.id); setModifyText(""); }}>
                      <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
                        <span className={`px-1 py-0.5 rounded ${classificationClass(s.classification)}`}>{s.classification}</span>
                        <span className="text-slate-500">AI suggestion · {statusLabel(s.status)}</span>
                      </div>
                      {s.kind === "replace" && s.before && (
                        <div className="text-slate-500 line-through text-[13px]">{s.before}</div>
                      )}
                      {s.kind === "delete" && s.before && (
                        <div className="text-red-600 line-through text-[13px]">{s.before}</div>
                      )}
                      <div className={`${s.status === "accepted" ? "text-emerald-700" : s.status === "rejected" ? "text-slate-400 line-through" : "text-emerald-700"}`}>
                        {s.kind === "delete" ? "" : (s.status === "modified" ? s.after : s.after)}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.sources.map((src) => <SourceChip key={src} id={src} />)}
                      </div>
                    </div>
                  ))}
                </section>
              );
            })}
            <p className="text-[11px] text-slate-400 italic pt-4 border-t">— End of draft —</p>
          </div>
        </div>

        {/* RIGHT: AI review + collaboration + audit */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <div className="rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent2" /> AI Suggested Change
            </div>
            <div className="p-3 space-y-2 text-[11px]">
              <div className="flex flex-wrap gap-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${classificationClass(selected.classification)}`}>{selected.classification}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{selected.governance}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{selected.section}</span>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Why</div>
                <div>{selected.why}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Source evidence</div>
                <div className="mt-1 flex flex-wrap gap-1">{selected.sources.map((s) => <SourceChip key={s} id={s} />)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Proposed text</div>
                <textarea className="mt-1 w-full text-[11px] border rounded p-1.5 min-h-[64px]" defaultValue={selected.after} onChange={(e) => setModifyText(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-1">
                <button className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white hover:opacity-90" onClick={() => act(selected.id, "accepted")}>Accept</button>
                <button className="text-[10px] px-2 py-1 rounded bg-red-600 text-white hover:opacity-90" onClick={() => act(selected.id, "rejected")}>Reject</button>
                <button className="text-[10px] px-2 py-1 rounded border" onClick={() => act(selected.id, "modified", modifyText || selected.after)}>Save Modified</button>
                <select className="text-[10px] px-1.5 py-1 rounded border bg-background" defaultValue="" onChange={(e) => { if (e.target.value) { assignReviewer(selected.id, e.target.value); e.target.value = ""; } }}>
                  <option value="">Assign Reviewer…</option>
                  {REVIEWERS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="text-[10px] text-muted-foreground">Status: <span className="font-medium">{statusLabel(selected.status)}</span></div>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold">Collaboration</div>
            <div className="p-3 space-y-2 text-[11px]">
              <div className="space-y-1">
                {comments.map((c) => (
                  <div key={c.id} className={`rounded border p-1.5 ${c.resolved ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[11px]">{c.who}</span>
                      {!c.resolved && <button className="text-[10px] text-accent2 hover:underline" onClick={() => resolveComment(c.id)}>Resolve</button>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{c.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input className="flex-1 text-[11px] border rounded px-2 py-1" placeholder="Add comment…" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} />
                <button className="text-[10px] px-2 rounded border hover:bg-muted" onClick={addComment}>Post</button>
              </div>
              <div className="text-[10px] text-muted-foreground">Collaborators: M. Ortiz · K. Nguyen · R. Patel · + Add</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold flex items-center gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5" /> Ask about this clause
            </div>
            <div className="p-3 space-y-1.5 text-[11px]">
              <div className="flex flex-wrap gap-1">
                {assistantPrompts.map((p) => (
                  <button key={p} className="text-[10px] px-1.5 py-0.5 rounded border hover:bg-muted" onClick={() => askAssistant(p)}>{p}</button>
                ))}
              </div>
              {assistantMsg && <div className="rounded bg-muted p-2 text-[11px]">{assistantMsg}</div>}
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="px-3 py-2 border-b text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Audit / Change History
            </div>
            <div className="p-2 space-y-1 max-h-[220px] overflow-auto text-[11px]">
              {audit.map((e) => (
                <div key={e.id} className="border-l-2 border-slate-200 pl-2 py-0.5">
                  <div className="text-[11px]">{e.text}</div>
                  <div className="text-[9px] text-muted-foreground">{e.actor} · {e.ts} · Source: {e.source}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- helpers ----------
function nowTs() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function statusLabel(s: SuggestionStatus) {
  return s === "pending" ? "Pending review" : s === "accepted" ? "Accepted" : s === "rejected" ? "Rejected" : "Modified";
}
function classificationClass(c: Suggestion["classification"]) {
  switch (c) {
    case "Gap": return "bg-amber-100 text-amber-800";
    case "Conflict": return "bg-red-100 text-red-800";
    case "Fallback Clause": return "bg-indigo-100 text-indigo-800";
    case "Value Protection": return "bg-emerald-100 text-emerald-800";
    case "Needs Review": return "bg-slate-200 text-slate-800";
    case "Covered": return "bg-slate-100 text-slate-600";
    case "Variant": return "bg-sky-100 text-sky-800";
    case "Redline Risk": return "bg-rose-100 text-rose-800";
  }
}
function docStatusClass(s: SourceDoc["status"]) {
  switch (s) {
    case "Ready": return "bg-slate-100 text-slate-700";
    case "Applied": return "bg-emerald-100 text-emerald-800";
    case "Drafting": return "bg-indigo-100 text-indigo-800";
    case "Needs Review": return "bg-amber-100 text-amber-800";
    case "Pending Classification": return "bg-slate-100 text-slate-500";
    case "Uploaded / Intake Complete": return "bg-accent2/15 text-accent2";
  }
}
function statusTip(s: SourceDoc["status"]) {
  const m: Record<string, string> = {
    Ready: "Extracted and ready for review",
    Applied: "Intelligence has been applied to the draft",
    Drafting: "Being used in the SOW generation process",
    "Needs Review": "Requires human decision",
    "Pending Classification": "Uploaded but not deeply extracted yet",
    "Uploaded / Intake Complete": "Basic intake complete — deep extraction requires document intelligence pipeline",
  };
  return m[s];
}
function outlineClass(s: OutlineStatus) {
  switch (s) {
    case "none": return "bg-slate-100 text-slate-500";
    case "ai": return "bg-indigo-100 text-indigo-800";
    case "review": return "bg-amber-100 text-amber-800";
    case "accepted": return "bg-emerald-100 text-emerald-800";
    case "conflict": return "bg-red-100 text-red-800";
  }
}
function outlineLabel(s: OutlineStatus) {
  return s === "none" ? "OK" : s === "ai" ? "AI suggestion" : s === "review" ? "Needs review" : s === "accepted" ? "Accepted" : "Conflict";
}
function sectionBody(section: string): string {
  const m: Record<string, string> = {
    "Business Need": "Maintain safe, continuous operation of production assets across six sites with predictable cost and enforceable SLAs.",
    "Scope of Work": "Preventive and corrective industrial maintenance across six sites, business hours coverage, weekday emergency response.",
    "Emergency Response SLA": "",
    "Preventive Maintenance": "Monthly PM cycle per asset class, documented in the CMMS with completion reporting to Buyer.",
    "Materials Pass-Through": "",
    "Rate Card / Pricing": "",
    "Service Credits": "",
    "Change Order Approval": "",
    "Safety & Insurance": "Supplier shall maintain safety program aligned with Buyer standards and insurance minimums per Exhibit C.",
    "Technician Certifications": "",
    "Renewal Review": "120-day renewal review window prior to expiration.",
  };
  return m[section] ?? "";
}
function buildSowText(sugs: Suggestion[]): string {
  const applied = sugs.filter((s) => s.status === "accepted" || s.status === "modified");
  const rejected = sugs.filter((s) => s.status === "rejected");
  return [
    "INDUSTRIAL MAINTENANCE SERVICES SOW — EXHIBIT D",
    "Draft v0.4",
    "",
    ...SEED_OUTLINE.flatMap((o) => {
      const body = sectionBody(o.label);
      const secSugs = applied.filter((s) => s.section === o.label);
      return [
        `${o.label.toUpperCase()}`,
        body || "(Governed by attached exhibits and clause library.)",
        ...secSugs.map((s) => `  • ${s.after}`),
        "",
      ];
    }),
    `Applied suggestions: ${applied.length} · Rejected: ${rejected.length} · Pending: ${sugs.length - applied.length - rejected.length}`,
  ].join("\n");
}
function buildEvidencePack(docs: SourceDoc[], sugs: Suggestion[], audit: AuditEvent[]): string {
  return [
    "EVIDENCE PACK — Industrial Maintenance Services SOW",
    "",
    "Source Documents:",
    ...docs.map((d) => ` - ${d.name} [${d.type}] · ${d.status} · ${d.origin}`),
    "",
    "AI Suggestions:",
    ...sugs.map((s) => ` - [${s.classification}] ${s.section}: ${s.after} (status: ${s.status}; sources: ${s.sources.join(", ")})`),
    "",
    "Audit Trail:",
    ...audit.map((a) => ` - ${a.ts} · ${a.actor} · ${a.source} · ${a.text}`),
  ].join("\n");
}

function StudioBtn({ icon, label, primary, onClick }: { icon: React.ReactNode; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1.5 rounded-md border transition ${
        primary ? "bg-accent2 text-white border-accent2 hover:opacity-90" : "bg-background border-border hover:bg-muted"
      }`}
    >
      {icon} {label}
    </button>
  );
}
function Badge({ tone, children }: { tone: "warn" | "info" | "ok"; children: React.ReactNode }) {
  const cls = tone === "warn" ? "bg-warning/15 text-warning" : tone === "ok" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${cls}`}>{children}</span>;
}


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
                  <span className={`rounded-full px-2 py-0.5 font-medium ${
                    st === "Approved" ? "bg-success/15 text-success" : st === "Rejected" ? "bg-risk/15 text-risk" : "bg-muted text-muted-foreground"
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
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                      status === "Approved" ? "bg-success/15 text-success" :
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
