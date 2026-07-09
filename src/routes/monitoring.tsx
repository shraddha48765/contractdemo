import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Activity, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { SourceChip } from "@/components/SourceChip";
import { KlydoTaskCard } from "@/components/KlydoTaskCard";

export const Route = createFileRoute("/monitoring")({
  head: () => ({ meta: [{ title: "Execution Monitoring — Contract Intelligence" }] }),
  component: Monitoring,
});

function Monitoring() {
  const { state, uploadInvoice } = useDemo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const n = f.name.toLowerCase();
    if (n.includes("inv-1842") || n.includes("invoice") || n.includes("apex invoice")) {
      uploadInvoice(f.name);
      setMsg(null);
    } else {
      setMsg("Demo supports predefined upload artifact for this flow. Try 'Invoice_INV-1842.pdf'.");
    }
  };

  const invoiceTask = state.klydoTasks.find((t) => t.id === "k8");

  if (!state.contractActivated) {
    return (
      <AppLayout title="Execution Monitoring" subtitle="Post-Signature Enforcement of Sourced Terms">
        <div className="rounded-xl border bg-card p-8 text-center max-w-lg mx-auto">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm font-semibold">No active contracts under monitoring yet</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Complete Signature & Activation on the Industrial Maintenance Services SOW to enable monitoring, or load the seeded demo contract below.
          </p>
          <Button onClick={activateContract} className="gap-1.5">Load Activated Demo Contract</Button>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout title="Execution Monitoring" subtitle="Post-Signature Enforcement of Sourced Terms.">
      <div className="rounded-xl border bg-card p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground">Active Contract</div>
            <div className="text-base font-semibold">Apex Industrial Maintenance Services SOW 2026–2029</div>
            <div className="text-xs text-muted-foreground mt-0.5">Apex Industrial Services · $2.4M · 6 sites</div>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            <Button variant="outline" size="sm" onClick={() => uploadInvoice("Invoice_INV-1842.pdf")}>Use sample invoice</Button>
            <Button size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Invoice
            </Button>
          </div>
        </div>
        {msg && <div className="mt-3 rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-xs text-warning">{msg}</div>}
      </div>

      {state.invoiceUploaded && (
        <div className="rounded-xl border bg-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-risk" />
            <h3 className="text-sm font-semibold">Invoice INV-1842 — Rate mismatch detected</h3>
            <span className="rounded bg-risk/15 text-risk text-[10px] px-1.5 py-0.5">$12,480 leakage</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <KV label="Contracted rate" value="$125/hr" />
            <KV label="Invoiced rate" value="$132/hr" tone="risk" />
            <KV label="Variance" value="$7/hr" tone="warning" />
            <KV label="Hours affected" value="1,783" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            <SourceChip id="invoice-1842" />
            <SourceChip id="apex-rate-card-v2" />
            <SourceChip id="signed-sow" />
          </div>
          {invoiceTask && <div className="mt-3"><KlydoTaskCard task={invoiceTask} /></div>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="SLA tracking">
          <div className="space-y-2 text-sm">
            <Row label="Emergency response (4h target)" value="3.6h avg" tone="success" />
            <Row label="Monthly completion (95% target)" value="96.8%" tone="success" />
            <Row label="Service credit trigger" value="Not active" tone="muted" />
            <div className="mt-2"><SourceChip id="sla-logs" /></div>
          </div>
        </Card>
        <Card title="Active alerts">
          <ul className="text-xs space-y-2">
            <Alert text="SLA target missed for two consecutive months — 1.5% service credit may apply" tone="warning" />
            <Alert text="Change order above $25K requires approval" tone="warning" />
            <Alert text="Renewal review window approaching" tone="muted" />
            <Alert text="Corrective action plan required due to recurring service misses" tone="risk" />
          </ul>
        </Card>
        <Card title="Compliance">
          <div className="space-y-2 text-sm">
            <Row label="Insurance certificate" value="Valid" tone="success" />
            <Row label="Safety program" value="Validated" tone="success" />
            <Row label="Technician certifications" value="3 pending renewal" tone="warning" />
          </div>
        </Card>
        <Card title="Renewal">
          <div className="text-sm">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent2" /> 120-day review window auto-tracked</div>
            <div className="text-xs text-muted-foreground mt-1">Renewal review opens 120 days before expiration.</div>
            <div className="mt-2"><SourceChip id="renewal-record" /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card title="Contract-to-Invoice Validation">
          <ul className="text-xs space-y-1.5">
            <li className="rounded border p-2">Labor rate above approved rate card <span className="text-muted-foreground">· Exhibit C / C-1</span></li>
            <li className="rounded border p-2">Materials markup exceeds allowed threshold <span className="text-muted-foreground">· Exhibit C-1</span></li>
            <li className="rounded border p-2">Missing approved timesheet <span className="text-muted-foreground">· Exhibit C</span></li>
            <li className="rounded border p-2">Invoice references wrong PO line <span className="text-muted-foreground">· Exhibit C</span></li>
            <li className="rounded border p-2">Unauthorized charge <span className="text-muted-foreground">· Exhibit C</span></li>
          </ul>
        </Card>
        <Card title="WRBS / Tax Cap / Reconciliation">
          <ul className="text-xs space-y-1.5">
            <li className="rounded border p-2 flex justify-between"><span>Tax-cap threshold reached</span><span className="text-warning">Route Finance review</span></li>
            <li className="rounded border p-2 flex justify-between"><span>WRBS variance detected</span><span className="text-warning">Request support</span></li>
            <li className="rounded border p-2 flex justify-between"><span>Rebate/discount not passed through</span><span className="text-warning">Commercial benefit review</span></li>
            <li className="rounded border p-2 flex justify-between"><span>Overcharge evidence available</span><span className="text-warning">Recovery workflow</span></li>
          </ul>
        </Card>
        <Card title="SLA / Service Credit">
          <ul className="text-xs space-y-1.5">
            <li className="rounded border p-2 flex justify-between"><span>4-hour emergency response</span><span className="text-risk">Breach detected</span></li>
            <li className="rounded border p-2 flex justify-between"><span>95% monthly completion</span><span className="text-warning">Missed two consecutive months</span></li>
            <li className="rounded border p-2 flex justify-between"><span>1.5% service credit</span><span className="text-warning">Review triggered</span></li>
            <li className="rounded border p-2 flex justify-between"><span>CAP</span><span className="text-warning">Route Vendor Manager</span></li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function KV({ label, value, tone }: { label: string; value: string; tone?: "risk" | "warning" }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${tone === "risk" ? "text-risk" : tone === "warning" ? "text-warning" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "muted" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium ${cls}`}>{value}</span>
    </div>
  );
}

function Alert({ text, tone }: { text: string; tone: "warning" | "risk" | "muted" }) {
  const cls = tone === "warning" ? "border-warning/30 bg-warning/5 text-warning" : tone === "risk" ? "border-risk/30 bg-risk/5 text-risk" : "border-muted bg-muted/30 text-muted-foreground";
  return <li className={`rounded-md border px-2 py-1.5 ${cls}`}>{text}</li>;
}
