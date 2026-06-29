import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useMemo } from "react";
import { Sparkles, Send } from "lucide-react";
import { SourceChip } from "./SourceChip";

interface Prompt {
  q: string;
  a: string;
  sources: string[];
}

const promptsByScreen: Record<string, Prompt[]> = {
  "/requests": [
    {
      q: "Why is Apex recommended over Elevate?",
      a: "Apex is recommended because it has stronger risk-adjusted fit: 96.8% monthly completion, 3.6-hour average emergency response, 92% compliance readiness, low transition risk, and acceptance of the 3% escalation cap. Elevate has lower estimated cost but lacks internal service history and has pending compliance validation.",
      sources: ["apex-rate-card-v2", "sla-logs", "apex-insurance", "elevate-website"],
    },
    {
      q: "Which evidence supports the 3% escalation cap?",
      a: "The 3% escalation cap is supported by Apex Rate Card v2, the Market Benchmark Summary, and approved escalation cap clause language.",
      sources: ["apex-rate-card-v2", "market-benchmark", "escalation-cap-clause"],
    },
    {
      q: "What risk did Apex introduce in the redline?",
      a: "Apex softened the service credit trigger and modified escalation language. This could reduce enforceability of the 1.5% service credit and create room for escalation above the 3% cap. Recommended fallback is Approved Fallback Clause B.",
      sources: ["apex-redline-v3", "service-credit-clause", "fallback-clause-b"],
    },
  ],
  "/monitoring": [
    {
      q: "Why was Invoice INV-1842 flagged?",
      a: "Invoice INV-1842 was flagged because the invoiced labor rate is $132/hr while the contracted rate is $125/hr. The $7/hr variance across 1,783 hours creates estimated leakage of $12,480.",
      sources: ["invoice-1842", "apex-rate-card-v2", "signed-sow"],
    },
    {
      q: "Why is this renewal flagged?",
      a: "The renewal is flagged because the contract is within the 120-day review window and has open invoice leakage, SLA service credit exposure, and unresolved corrective action items.",
      sources: ["renewal-record", "sla-logs", "invoice-1842"],
    },
  ],
  "/control-tower": [
    {
      q: "Which contracts have the highest leakage risk?",
      a: "The highest leakage risk is concentrated in Apex Industrial Maintenance Services SOW due to invoice overbilling and SLA credit exposure, Electrical Repair Services Contract due to SLA risk, and Facilities HVAC Services Contract due to pending change orders.",
      sources: ["invoice-1842", "sla-logs"],
    },
  ],
  default: [
    {
      q: "Summarize today's priority actions",
      a: "You have an open supplier confirmation for the Industrial Maintenance Services SOW, a pending technician certification roster validation, and renewal reviews approaching the 120-day window for two contracts.",
      sources: ["request-intake", "renewal-record"],
    },
  ],
};

export function AIAssistant({ open, onClose, screenPath }: { open: boolean; onClose: () => void; screenPath: string }) {
  const prompts = useMemo(() => {
    const key = Object.keys(promptsByScreen).find((k) => screenPath.startsWith(k) && k !== "default");
    return promptsByScreen[key ?? "default"];
  }, [screenPath]);

  const [thread, setThread] = useState<{ q: string; a: string; sources: string[] }[]>([]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[440px] sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-accent2" /> AI Assistant
          </SheetTitle>
          <p className="text-xs text-muted-foreground">Source-backed answers from governed knowledge.</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {thread.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Suggested prompts for this screen — click one to see a source-backed response.
            </p>
          )}
          {thread.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm">{m.q}</div>
              <div className="rounded-lg border bg-card px-3 py-2 text-sm">
                <p className="leading-relaxed">{m.a}</p>
                {m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide self-center">Sources</span>
                    {m.sources.map((s) => (
                      <SourceChip key={s} id={s} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t bg-muted/30 p-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Suggested prompts</p>
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setThread((t) => [...t, p])}
              className="w-full text-left text-xs rounded-md border bg-card px-3 py-2 hover:bg-accent transition flex items-start gap-2"
            >
              <Send className="h-3 w-3 mt-0.5 text-accent2 shrink-0" /> {p.q}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
