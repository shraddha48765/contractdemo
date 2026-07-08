import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useDemo } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Active Requests — Source-to-Contract Intelligence" }] }),
  component: Requests,
});

const requests = [
  {
    id: "ind-maint-sow",
    name: "Industrial Maintenance Services Renewal – 2026",
    type: "Renewal · 3-year",
    owner: "Procurement Buyer",
    requester: "Operations Manager",
    category: "Industrial Maintenance Services",
    procurementType: "Services + Materials Pass-through",
    sourcingPath: "Incumbent Renewal + Market Check",
    rfpTrigger: "Not Required / Watch",
    valueProtection: "$194.6K modeled",
    value: "$2.4M est.",
    next: "Confirm sourcing strategy",
    status: "In Progress",
  },
  {
    id: "field-inspection-sow",
    name: "Field Inspection Services SOW",
    type: "SOW · 2-year",
    owner: "Sourcing Lead",
    requester: "QA Director",
    category: "Inspection Services",
    procurementType: "Services",
    sourcingPath: "RFP",
    rfpTrigger: "Triggered",
    valueProtection: "$42K modeled",
    value: "$1.1M",
    next: "Evidence validation",
    status: "In Review",
  },
  {
    id: "emergency-gen-sow",
    name: "Emergency Generator Maintenance SOW",
    type: "Renewal · 2-year",
    owner: "Procurement Buyer",
    requester: "Facilities Mgr",
    category: "Power",
    procurementType: "Services",
    sourcingPath: "Incumbent Renewal",
    rfpTrigger: "Not Required",
    valueProtection: "$28K modeled",
    value: "$780K",
    next: "Renewal review window",
    status: "Renewal",
  },
  {
    id: "electrical-repair",
    name: "Electrical Repair Services Contract",
    type: "MSA",
    owner: "Sourcing Lead",
    requester: "Plant Ops",
    category: "Electrical",
    procurementType: "Services",
    sourcingPath: "Market Check",
    rfpTrigger: "Watch",
    valueProtection: "$60K modeled",
    value: "$1.4M",
    next: "Benchmark review",
    status: "In Review",
  },
  {
    id: "hvac-facilities",
    name: "Facilities HVAC Services Contract",
    type: "Renewal",
    owner: "Procurement Buyer",
    requester: "Facilities Mgr",
    category: "Facilities",
    procurementType: "Services + Materials Pass-through",
    sourcingPath: "Incumbent Renewal",
    rfpTrigger: "Not Required",
    valueProtection: "$36K modeled",
    value: "$960K",
    next: "Vendor risk review",
    status: "Renewal",
  },
];

function Requests() {
  const { state } = useDemo();
  return (
    <AppLayout title="Active Requests" subtitle="Source-to-contract requests in flight.">
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Request / SOW Name</th>
              <th className="text-left px-4 py-2.5 font-medium">Category</th>
              <th className="text-left px-4 py-2.5 font-medium">Procurement Type</th>
              <th className="text-left px-4 py-2.5 font-medium">Sourcing Path</th>
              <th className="text-left px-4 py-2.5 font-medium">RFP Trigger</th>
              <th className="text-left px-4 py-2.5 font-medium">Value Protection</th>
              <th className="text-left px-4 py-2.5 font-medium">Current Stage</th>
              <th className="text-left px-4 py-2.5 font-medium">Next Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const isHero = r.id === "ind-maint-sow";
              const stage = isHero
                ? state.contractActivated
                  ? "Active — Execution"
                  : state.supplierConfirmed
                  ? "Evidence & Drafting"
                  : "Supplier Review"
                : r.status;
              return (
                <tr key={r.id} className="border-t hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.type} · {r.requester} · {r.value}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.category}</td>
                  <td className="px-4 py-3 text-xs">{r.procurementType}</td>
                  <td className="px-4 py-3 text-xs">{r.sourcingPath}</td>
                  <td className="px-4 py-3 text-xs">{r.rfpTrigger}</td>
                  <td className="px-4 py-3 text-xs">{r.valueProtection}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="rounded-full bg-accent2/15 text-accent2 px-2 py-0.5 font-medium">{stage}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.next}</td>
                  <td className="px-4 py-3 text-right">
                    {isHero ? (
                      <Link to="/requests/$id" params={{ id: r.id }} className="inline-flex items-center gap-1 text-accent2 text-xs font-medium hover:underline">
                        Open <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!state.supplierConfirmed && (
        <p className="text-xs text-muted-foreground mt-3">
          Hero request shows: Apex is incumbent/known, not selected. Open the workspace to confirm the sourcing strategy.
        </p>
      )}
    </AppLayout>
  );
}
