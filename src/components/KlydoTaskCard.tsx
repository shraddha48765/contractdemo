import type { KlydoTask } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";
import { Clock, User, AlertTriangle, ChevronRight } from "lucide-react";
import { SourceChip } from "./SourceChip";
import { useState } from "react";

const statusStyles: Record<KlydoTask["status"], string> = {
  Open: "bg-accent2/15 text-accent2",
  "In Review": "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Approved: "bg-success/15 text-success",
  Resolved: "bg-success/15 text-success",
  Overdue: "bg-risk/15 text-risk",
  Pending: "bg-muted text-muted-foreground",
  Ready: "bg-accent2/15 text-accent2",
};

const priorityStyles: Record<KlydoTask["priority"], string> = {
  High: "text-risk",
  Medium: "text-warning",
  Low: "text-muted-foreground",
};

export function KlydoTaskCard({ task, compact }: { task: KlydoTask; compact?: boolean }) {
  const { updateKlydoStatus } = useDemo();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-3 hover:border-accent2/40 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{task.type}</span>
            <AlertTriangle className={`h-3 w-3 ${priorityStyles[task.priority]}`} />
            <span className={`text-[10px] font-medium ${priorityStyles[task.priority]}`}>{task.priority}</span>
          </div>
          <div className="text-sm font-medium leading-snug">{task.title}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {task.owner}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {task.due}</span>
            {task.sourceArtifact && <SourceChip id={task.sourceArtifact} />}
          </div>
        </div>
        <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${statusStyles[task.status]}`}>{task.status}</span>
      </div>

      {!compact && (
        <>
          <button onClick={() => setExpanded((v) => !v)} className="mt-2 text-[11px] text-accent2 inline-flex items-center hover:underline">
            {expanded ? "Hide" : "Manage"} <ChevronRight className={`h-3 w-3 transition ${expanded ? "rotate-90" : ""}`} />
          </button>
          {expanded && (
            <div className="mt-2 border-t pt-2 space-y-2">
              <div className="flex flex-wrap gap-1">
                {(["Open", "In Review", "Approved", "Resolved", "Overdue"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateKlydoStatus(task.id, s)}
                    className={`text-[10px] rounded px-2 py-0.5 border ${
                      task.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground space-y-0.5">
                <div className="font-medium uppercase tracking-wide">Audit trail</div>
                {task.audit.slice(-3).map((a, i) => (
                  <div key={i}>· {a.ts} — {a.actor}: {a.action}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
