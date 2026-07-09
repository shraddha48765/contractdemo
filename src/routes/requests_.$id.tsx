import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { useState, useRef } from "react";
import { vendors, evidencePack, contractIntelligenceRecs, sourceArtifacts, vendorChecklist, negotiationNotes } from "@/lib/mock-data";
import { KlydoTaskCard } from "@/components/KlydoTaskCard";
import { SourceChip } from "@/components/SourceChip";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, FileText, AlertTriangle, ShieldCheck, MessageSquareText, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/requests_/$id")({
  head: () => ({ meta: [{ title: "Industrial Maintenance Services SOW — Active Request" }] }),
  component: RequestWorkspace,
});

const TABS = [
  { id: "summary", label: "Request Summary" },
  { id: "klydo", label: "Klydo Workflow" },
  { id: "supplier", label: "Supplier Review" },
  { id: "evidence", label: "Evidence Pack" },
  { id: "intel", label: "Contract Intelligence" },
  { id: "sow", label: "Draft SOW" },
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

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
        {[
          ["Category", "Industrial Maintenance Services"],
          ["Procurement Model", "Service procurement with materials pass-through"],
          ["Sourcing Path", "Incumbent renewal with competitive market check"],
          ["RFI/RFP/Tender", "Not required currently — watch triggers"],
          ["Incumbent", "Apex Industrial Services"],
          ["Recommendation", "Apex pending buyer confirmation"],
          ["Value Under Control", "$194.6K modeled"],

        ].map(([k, v]) => (
          <span key={k} className="rounded-full border px-2 py-0.5 bg-card">
            <span className="text-muted-foreground">{k}:</span> <span className="font-medium">{v}</span>
          </span>
        ))}
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
      {tab === "evidence" && <EvidencePackTab />}
      {tab === "intel" && <ContractIntelTab />}
      {tab === "sow" && <DraftSOW />}
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
  return (
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
  );
}

function SupplierReview() {
  const { state, confirmSupplier } = useDemo();
  const cmp = vendors.slice(0, 3);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 space-y-2">
        <h3 className="text-sm font-semibold">Supplier Review & Sourcing Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border p-3 space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Sourcing Path Recommendation</div>
            <div><span className="text-muted-foreground">Recommended path:</span> Incumbent renewal with competitive market check</div>
            <div><span className="text-muted-foreground">Full RFP required?</span> Not currently required</div>
            <div><span className="text-muted-foreground">Why:</span> Apex is incumbent, lower transition risk; pricing and scope protections required</div>
            <div><span className="text-muted-foreground">Trigger RFP if:</span> escalation exceeds cap, SLA weakens, pricing variance exceeds threshold, or risk score increases</div>
            <div className="text-warning">Klydo action: Procurement Manager approval required</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Supplier Shortlist</div>
            <ul className="space-y-1">
              <li className="flex justify-between"><span>Apex Industrial Services</span><span className="text-success">Incumbent · Recommended with conditions</span></li>
              <li className="flex justify-between"><span>Northstar Maintenance Group</span><span className="text-muted-foreground">Historical alternate · Benchmark reference</span></li>
              <li className="flex justify-between"><span>Elevate Field Services</span><span className="text-muted-foreground">New vendor · Market comparison</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Bid / SOW Response Comparison</div>
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Dimension</th>
              <th className="text-left px-3 py-2 font-medium">Apex</th>
              <th className="text-left px-3 py-2 font-medium">Northstar</th>
              <th className="text-left px-3 py-2 font-medium">Elevate</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Labor escalation", "5% proposed → 3% recommended", "3%", "3%"],
              ["Emergency SLA", "4 hours", "6 hours", "4 hours"],
              ["Completion target", "95%", "93%", "95%"],
              ["Scope exceptions", "Weekend coverage clarification needed", "Prior gaps", "Clean but untested"],
              ["HSSE readiness", "Strong", "Moderate", "Needs onboarding"],
              ["Transition risk", "Low", "Medium", "High"],
              ["Commercial fit", "Medium", "Medium", "Medium-high"],
            ].map((r) => (
              <tr key={r[0]} className="border-t">
                {r.map((c, i) => <td key={i} className={`px-3 py-2 ${i === 0 ? "text-muted-foreground" : ""}`}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-2">Recommended Award Direction</h3>
        <p className="text-xs mb-2 font-medium text-accent2">Conditional award to Apex Industrial Services</p>
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
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-2">Source-to-Procure Value Protection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border p-3"><div className="text-muted-foreground">Escalation exposure avoided</div><div className="font-semibold mt-0.5">$48K</div></div>
          <div className="rounded-lg border p-3"><div className="text-muted-foreground">Scope-gap exposure prevented</div><div className="font-semibold mt-0.5">$74K</div></div>
          <div className="rounded-lg border p-3"><div className="text-muted-foreground">Award risk avoided (HSSE/site readiness)</div><div className="font-semibold mt-0.5">Qualitative</div></div>
        </div>
      </div>

      {!state.supplierConfirmed ? (
        <div className="rounded-xl border bg-accent2/5 border-accent2/30 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent2" />
            <div>
              <div className="text-sm font-semibold">System Recommendation: Apex Industrial Services</div>
              <div className="text-xs text-muted-foreground">Risk-adjusted fit: pricing in range, strong SLA history, low transition risk.</div>
            </div>
          </div>
          <Button onClick={confirmSupplier} className="gap-1.5"><CheckCircle2 className="h-4 w-4" /> Confirm Recommended Supplier</Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-success/10 border-success/30 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div className="text-sm font-semibold">Selected Supplier: Apex Industrial Services</div>
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2.5 font-medium">Metric</th>
              {cmp.map((v) => (
                <th key={v.id} className="text-left px-3 py-2.5 font-medium">
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
              ["3-yr est. cost", "cost"],
              ["Labor escalation", "escalation"],
              ["Avg emergency response", "emergencyResponse"],
              ["Monthly completion", "completionRate"],
              ["Change-order exposure", "changeOrderExposure"],
              ["Compliance readiness", "compliance"],
              ["Transition risk", "transitionRisk"],
              ["Recommendation", "recommendation"],
            ].map(([label, key], idx) => (
              <tr key={label} className="border-t">
                <td className="px-3 py-2.5 text-muted-foreground">{label}</td>
                {cmp.map((v) => (
                  <td key={v.id} className="px-3 py-2.5">
                    <div>{(v as any)[key]}</div>
                    {idx === 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {v.sources.map((s) => <SourceChip key={s} id={s} />)}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

function DraftSOW() {
  const { state } = useDemo();
  const vendorLine = state.supplierConfirmed ? "Apex Industrial Services" : "[Pending supplier confirmation]";
  const sections = [
    { h: "1. Parties", c: `Buyer and ${vendorLine}.` },
    { h: "2. Scope of services", c: "Preventive and corrective industrial maintenance across 6 sites.", src: "sow-template" },
    { h: "3. Term", c: "Three (3) years from contract activation." },
    { h: "4. Pricing", c: "Labor rate card + materials pass-through.", src: "apex-rate-card-v2" },
    { h: "5. Escalation", c: "3% annual labor-rate escalation cap.", src: "escalation-cap-clause" },
    { h: "6. SLA", c: "4-hour emergency response · 95% monthly completion.", src: "emergency-coverage" },
    { h: "7. Service credit", c: "1.5% credit if SLA missed for two consecutive months.", src: "service-credit-clause" },
    { h: "8. Change orders", c: "Approval required for change orders above $25K." },
    { h: "9. Compliance", c: "Insurance, safety program, technician certification required.", src: "apex-insurance" },
    { h: "10. Renewal", c: "120-day renewal review window prior to expiration." },
  ];
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Prior Scope Gap Prevented</div>
            <p className="text-xs mt-0.5">Prior change order showed weekend emergency coverage was added after award. The new Exhibit D draft includes weekend emergency coverage upfront.</p>
            <div className="text-xs mt-1 font-medium text-warning">$74K modeled change-order exposure prevented</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <SourceChip id="prior-change-order" />
              <SourceChip id="exhibit-d" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="text-xs font-semibold mb-2">Generated from</div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            ["Prior Exhibit D / Scope of Work","exhibit-d"],
            ["Supplier response comparison",""],
            ["Approved clause library","service-credit-clause"],
            ["Prior change orders","prior-change-order"],
            ["HSSE requirements","exhibit-e"],
            ["Pricing / WRBS references","exhibit-c1"],
            ["SLA playbook","category-playbook-ims"],
          ].map(([label, id]) => (
            <span key={label} className="rounded border px-2 py-0.5">{label}</span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <SourceChip id="prior-change-order" />
          <SourceChip id="exhibit-d" />
          <SourceChip id="apex-rate-card-v2" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Draft SOW / Exhibit D Builder</h3>
            <p className="text-xs text-muted-foreground">Generated from approved template + governed evidence.</p>
          </div>
          {!state.supplierConfirmed && (
            <span className="text-[11px] rounded bg-warning/15 text-warning px-2 py-0.5">Awaiting supplier confirmation</span>
          )}
        </div>
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.h} className="border-l-2 border-accent2/40 pl-3">
              <div className="text-xs font-semibold">{s.h}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.c}</div>
              {s.src && <div className="mt-1"><SourceChip id={s.src} /></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
    { title: "Service credit language softened", risk: "High", impact: "May reduce 1.5% credit enforceability", fallback: "Approved Service Credit Clause / Fallback Clause B", sources: ["apex-redline-v3", "service-credit-clause", "fallback-clause-b"] },
    { title: "Escalation language modified", risk: "Medium", impact: "Could allow escalation above 3% cap", fallback: "Reinstate 3% annual labor-rate escalation cap", sources: ["apex-redline-v3", "escalation-cap-clause"] },
    { title: "Change-order flexibility expanded", risk: "Medium", impact: "Could increase leakage above $25K threshold", fallback: "Require approval for change orders above $25K", sources: ["apex-redline-v3"] },
  ];

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
              Use sample
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

      {state.redlineUploaded && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Detected risks</h3>
          <div className="space-y-2">
            {risks.map((r) => (
              <div key={r.title} className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${r.risk === "High" ? "text-risk" : "text-warning"}`} />
                  <span className="text-sm font-medium">{r.title}</span>
                  <span className={`text-[10px] rounded px-1.5 py-0.5 ${r.risk === "High" ? "bg-risk/15 text-risk" : "bg-warning/15 text-warning"}`}>{r.risk}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{r.impact}</div>
                <div className="text-xs mt-1"><span className="text-muted-foreground">Recommended fallback: </span>{r.fallback}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {r.sources.map((s) => <SourceChip key={s} id={s} />)}
                </div>
              </div>
            ))}
          </div>
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
