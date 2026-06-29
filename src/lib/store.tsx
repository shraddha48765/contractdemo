import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedKlydoTasks, initialKpis, type KlydoTask } from "./mock-data";

type ApprovalKey = "legal" | "finance" | "procurement" | "signatory";
type ApprovalStatus = "Pending" | "Approved" | "Rejected";

interface DemoState {
  supplierConfirmed: boolean;
  selectedSupplier: string | null;
  redlineUploaded: boolean;
  redlineFileName: string | null;
  invoiceUploaded: boolean;
  invoiceFileName: string | null;
  contractActivated: boolean;
  klydoTasks: KlydoTask[];
  approvals: Record<ApprovalKey, ApprovalStatus>;
  kpis: typeof initialKpis;
}

const defaultState: DemoState = {
  supplierConfirmed: false,
  selectedSupplier: null,
  redlineUploaded: false,
  redlineFileName: null,
  invoiceUploaded: false,
  invoiceFileName: null,
  contractActivated: false,
  klydoTasks: seedKlydoTasks,
  approvals: { legal: "Pending", finance: "Pending", procurement: "Pending", signatory: "Pending" },
  kpis: initialKpis,
};

interface DemoCtx {
  state: DemoState;
  confirmSupplier: () => void;
  uploadRedline: (fileName: string) => void;
  uploadInvoice: (fileName: string) => void;
  activateContract: () => void;
  updateKlydoStatus: (id: string, status: KlydoTask["status"]) => void;
  setApproval: (k: ApprovalKey, s: ApprovalStatus) => void;
  resetDemo: () => void;
}

const Ctx = createContext<DemoCtx | null>(null);
const KEY = "contract-intel-demo-v1";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const confirmSupplier = () =>
    setState((s) => ({
      ...s,
      supplierConfirmed: true,
      selectedSupplier: "apex",
      klydoTasks: s.klydoTasks.map((t) =>
        t.id === "k1"
          ? {
              ...t,
              status: "Completed",
              audit: [...t.audit, { ts: new Date().toISOString().slice(0, 16).replace("T", " "), actor: "Procurement Buyer", action: "Confirmed Apex as recommended supplier" }],
            }
          : t,
      ),
    }));

  const uploadRedline = (fileName: string) =>
    setState((s) => {
      if (s.klydoTasks.some((t) => t.id === "k4")) return { ...s, redlineUploaded: true, redlineFileName: fileName };
      const now = new Date().toISOString().slice(0, 16).replace("T", " ");
      const newTasks: KlydoTask[] = [
        {
          id: "k4",
          title: "Review Apex Redline v3",
          type: "Redline Review",
          owner: "Legal Reviewer",
          status: "Open",
          due: "3 days",
          priority: "High",
          relatedRequest: "ind-maint-sow",
          relatedVendor: "Apex Industrial Services",
          sourceArtifact: "apex-redline-v3",
          audit: [{ ts: now, actor: "System", action: `Created from upload: ${fileName}` }],
          createdBy: "redline-upload",
        },
        {
          id: "k5",
          title: "Review escalation/service credit impact",
          type: "Finance Review",
          owner: "Finance Reviewer",
          status: "Open",
          due: "3 days",
          priority: "High",
          relatedRequest: "ind-maint-sow",
          relatedVendor: "Apex Industrial Services",
          sourceArtifact: "apex-redline-v3",
          audit: [{ ts: now, actor: "System", action: `Created from upload: ${fileName}` }],
          createdBy: "redline-upload",
        },
      ];
      return {
        ...s,
        redlineUploaded: true,
        redlineFileName: fileName,
        klydoTasks: [...s.klydoTasks, ...newTasks],
      };
    });

  const uploadInvoice = (fileName: string) =>
    setState((s) => {
      if (s.klydoTasks.some((t) => t.id === "k8")) return { ...s, invoiceUploaded: true, invoiceFileName: fileName };
      const now = new Date().toISOString().slice(0, 16).replace("T", " ");
      const task: KlydoTask = {
        id: "k8",
        title: "Invoice rate mismatch — INV-1842",
        type: "Exception",
        owner: "Finance Reviewer",
        status: "Open",
        due: "3 days",
        priority: "High",
        relatedContract: "apex-sow",
        relatedVendor: "Apex Industrial Services",
        sourceArtifact: "invoice-1842",
        audit: [{ ts: now, actor: "System", action: `Exception created from invoice ${fileName}` }],
        createdBy: "invoice-upload",
      };
      return {
        ...s,
        invoiceUploaded: true,
        invoiceFileName: fileName,
        klydoTasks: [...s.klydoTasks, task],
        kpis: {
          ...s.kpis,
          leakageExposure: s.kpis.leakageExposure + 12480,
          openExceptions: s.kpis.openExceptions + 1,
          invoiceFlags: s.kpis.invoiceFlags + 1,
        },
      };
    });

  const activateContract = () =>
    setState((s) => ({ ...s, contractActivated: true }));

  const updateKlydoStatus = (id: string, status: KlydoTask["status"]) =>
    setState((s) => ({
      ...s,
      klydoTasks: s.klydoTasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              audit: [...t.audit, { ts: new Date().toISOString().slice(0, 16).replace("T", " "), actor: "Procurement Buyer", action: `Status → ${status}` }],
            }
          : t,
      ),
    }));

  const setApproval = (k: ApprovalKey, st: ApprovalStatus) =>
    setState((s) => ({ ...s, approvals: { ...s.approvals, [k]: st } }));

  const resetDemo = () => {
    localStorage.removeItem(KEY);
    setState(defaultState);
  };

  return (
    <Ctx.Provider value={{ state, confirmSupplier, uploadRedline, uploadInvoice, activateContract, updateKlydoStatus, setApproval, resetDemo }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDemo() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemo outside provider");
  return c;
}
