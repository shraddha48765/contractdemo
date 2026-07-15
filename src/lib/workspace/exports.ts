// Real DOCX + ZIP export helpers for the SOW Draft Studio.
import {
  Document, Packer, Paragraph, HeadingLevel, TextRun,
} from "docx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { DraftDocument, EvidenceDocument, Comment, ReviewerAssignment, AuditEvent, SuggestedChange } from "@/lib/workspace/types";

export async function exportDocx(draft: DraftDocument, filename: string) {
  const children: Paragraph[] = [];
  children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: draft.metadata.sowNumber || "SOW Draft", bold: true })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: `Revision ${draft.metadata.revision} · ${draft.metadata.status}`, italics: true })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: `Vendor: ${draft.metadata.vendor ?? ""}   |   Category: ${draft.metadata.category ?? ""}   |   Region: ${draft.metadata.region ?? ""}` })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: `Effective: ${draft.metadata.effectiveDate ?? "TBD"}   |   Term: ${draft.metadata.term ?? ""}` })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: " " })] }));
  for (const s of [...draft.sections].sort((a, b) => a.order - b.order)) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: s.label, bold: true })] }));
    const paras = (s.currentBody || "").split(/\n+/).filter(Boolean);
    if (paras.length === 0) paras.push("[Section empty]");
    for (const p of paras) children.push(new Paragraph({ children: [new TextRun({ text: p })] }));
    children.push(new Paragraph({ children: [new TextRun({ text: " " })] }));
  }
  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export async function exportEvidencePackZip(params: {
  draft: DraftDocument;
  evidence: EvidenceDocument[];
  suggestions: SuggestedChange[];
  comments: Comment[];
  reviewers: ReviewerAssignment[];
  audit: AuditEvent[];
  filename: string;
}) {
  const { draft, evidence, suggestions, comments, reviewers, audit, filename } = params;
  const zip = new JSZip();

  const metadata = {
    exportedAt: new Date().toISOString(),
    requestId: draft.requestId,
    draftId: draft.id,
    version: draft.version,
    metadata: draft.metadata,
    sectionCount: draft.sections.length,
    evidenceCount: evidence.length,
    suggestionCount: suggestions.length,
    commentCount: comments.length,
    reviewerCount: reviewers.length,
    auditEventCount: audit.length,
  };
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));
  zip.file("README.txt",
    `Evidence Pack Export\n====================\n\nSOW: ${draft.metadata.sowNumber ?? draft.id}\nVersion: ${draft.metadata.revision}\nExported: ${metadata.exportedAt}\n\nContents:\n - metadata.json — draft & pack metadata\n - draft.md — current draft body (accepted/edited)\n - sources/ — one file per included evidence source\n - suggestions.json — all AI suggestions and decisions\n - comments.json — collaboration comments\n - reviews.json — reviewer assignments\n - audit.json — full audit history\n`);

  const draftMd = [
    `# ${draft.metadata.sowNumber ?? "SOW Draft"} — Rev ${draft.metadata.revision}`,
    `Status: ${draft.metadata.status}`,
    "",
    ...[...draft.sections].sort((a, b) => a.order - b.order).flatMap((s) => [
      `## ${s.label}`,
      "",
      s.currentBody || "_[empty]_",
      "",
    ]),
  ].join("\n");
  zip.file("draft.md", draftMd);

  const src = zip.folder("sources")!;
  for (const e of evidence) {
    const safe = e.id.replace(/[^a-z0-9-_]/gi, "_");
    src.file(`${safe}.json`, JSON.stringify({
      id: e.id, title: e.title, source: e.source, type: e.type, authority: e.authority,
      purpose: e.purpose, region: e.region, vendor: e.vendor, date: e.date,
      status: e.status, topic: e.topic, included: e.included,
    }, null, 2));
    if (e.body) src.file(`${safe}.txt`, e.body);
  }

  zip.file("suggestions.json", JSON.stringify(suggestions, null, 2));
  zip.file("comments.json", JSON.stringify(comments, null, 2));
  zip.file("reviews.json", JSON.stringify(reviewers, null, 2));
  zip.file("audit.json", JSON.stringify(audit, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, filename);
}
