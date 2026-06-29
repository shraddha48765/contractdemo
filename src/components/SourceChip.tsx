import { useState } from "react";
import { sourceArtifacts } from "@/lib/mock-data";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sidebar";
// Use existing sheet
import { Sheet as Drawer, SheetContent as DrawerContent, SheetHeader as DrawerHeader, SheetTitle as DrawerTitle } from "@/components/ui/sheet";
import { FileText } from "lucide-react";

export function SourceChip({ id, label }: { id: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const art = sourceArtifacts[id];
  if (!art) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-source-border bg-source/60 px-2 py-0.5 text-[11px] font-medium text-source-foreground hover:bg-source transition-colors"
      >
        <FileText className="h-3 w-3" />
        {label ?? art.name}
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="right" className="w-[420px] sm:max-w-[420px]">
          <DrawerHeader>
            <DrawerTitle className="text-base">{art.name}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 px-1 text-sm">
            <p className="text-muted-foreground">{art.summary}</p>
            <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
              <dt className="text-muted-foreground">Source type</dt><dd>{art.type}</dd>
              <dt className="text-muted-foreground">Category</dt><dd>{art.category}</dd>
              <dt className="text-muted-foreground">Source system</dt><dd>{art.sourceSystem}</dd>
              <dt className="text-muted-foreground">Governance</dt>
              <dd>
                <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  art.governanceStatus === "Approved" || art.governanceStatus === "Validated"
                    ? "bg-success/15 text-success"
                    : art.governanceStatus === "Pending Legal Review"
                    ? "bg-warning/15 text-warning"
                    : art.governanceStatus === "External"
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}>{art.governanceStatus}</span>
              </dd>
              <dt className="text-muted-foreground">Last updated</dt><dd>{art.lastUpdated}</dd>
              {art.linkedVendor && (<><dt className="text-muted-foreground">Linked vendor</dt><dd>{art.linkedVendor}</dd></>)}
              {art.linkedContract && (<><dt className="text-muted-foreground">Linked contract</dt><dd>{art.linkedContract}</dd></>)}
              {art.linkedRequest && (<><dt className="text-muted-foreground">Linked request</dt><dd>{art.linkedRequest}</dd></>)}
              <dt className="text-muted-foreground">Confidence</dt><dd>{art.confidence}</dd>
            </dl>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Where used</p>
              <div className="flex flex-wrap gap-1">
                {art.whereUsed.map((w) => (
                  <span key={w} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{w}</span>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
