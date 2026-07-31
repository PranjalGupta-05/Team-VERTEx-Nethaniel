/**
 * Zero-dependency PDF generator for CrimeVision AI forensic reports.
 * Builds valid PDF 1.4 documents from raw spec primitives.
 *
 * Supports: text blocks, section headers, tables, page breaks,
 * metadata embedding, and multi-page flow.
 */

// ─── Low-level PDF primitives ───────────────────────────────────────────────

function pdfString(s: string): string {
  return `(${s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;
}

function pdfDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `(D:${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z)`;
}

// ─── Report data types ──────────────────────────────────────────────────────

export interface ReportData {
  reportVersion: string;
  generatedAt: string;
  certification: { algorithm: string; hash: string; statement: string };
  case: {
    id: string;
    reference: string;
    title: string;
    description: string | null;
    location: string | null;
    status: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
    owner: { id: string; displayName: string | null; email: string | null };
  };
  evidence: Array<{
    id: string;
    originalName: string;
    sha256: string;
    mimeType: string;
    byteSize: string;
    modality: string;
    status: string;
    capturedAt: string | null;
    analysisCount: number;
  }>;
  timeline: Array<{
    id: string;
    evidenceName: string;
    type: string;
    title: string;
    description: string;
    confidence: number | null;
    occurredAt: string;
  }>;
  aiFindings: Array<{
    evidenceName: string;
    type: string;
    model: string;
    confidence: number | null;
    occurredAt: string | null;
    payload: Record<string, unknown>;
  }>;
  confidenceSummary: {
    overall: number | null;
    byType: Record<string, { avg: number; count: number }>;
  };
  chainOfCustodyEvents: number;
}

// ─── PDF Document Builder ───────────────────────────────────────────────────

interface PdfObject {
  id: number;
  content: string;
}

class PdfBuilder {
  private objects: PdfObject[] = [];
  private nextId = 1;
  private pageIds: number[] = [];
  private pageContentIds: number[] = [];
  private currentPageLines: string[] = [];
  private currentY = 750;
  private catalogId = 0;
  private pagesId = 0;
  private fontId = 0;
  private fontBoldId = 0;

  private readonly PAGE_WIDTH = 595; // A4
  private readonly PAGE_HEIGHT = 842;
  private readonly MARGIN_LEFT = 50;
  private readonly MARGIN_RIGHT = 50;
  private readonly MARGIN_TOP = 42;
  private readonly MARGIN_BOTTOM = 60;
  private readonly LINE_HEIGHT = 14;
  private readonly USABLE_WIDTH = 595 - 50 - 50; // 495

  constructor(private report: ReportData) {}

  private addObject(content: string): number {
    const id = this.nextId++;
    this.objects.push({ id, content });
    return id;
  }

  private startNewPage() {
    // Flush current page if any
    if (this.currentPageLines.length > 0) {
      this.flushPage();
    }
    this.currentY = this.PAGE_HEIGHT - this.MARGIN_TOP;
    this.currentPageLines = [];
  }

  private flushPage() {
    const stream = this.currentPageLines.join("\n");
    const streamBytes = Buffer.byteLength(stream, "utf-8");
    const contentId = this.addObject(
      `<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`
    );
    this.pageContentIds.push(contentId);

    const pageId = this.addObject(
      `<< /Type /Page /Parent ${this.pagesId} 0 R /MediaBox [0 0 ${this.PAGE_WIDTH} ${this.PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${this.fontId} 0 R /F2 ${this.fontBoldId} 0 R >> >> >>`
    );
    this.pageIds.push(pageId);
    this.currentPageLines = [];
  }

  private ensureSpace(needed: number) {
    if (this.currentY - needed < this.MARGIN_BOTTOM) {
      this.flushPage();
      this.currentY = this.PAGE_HEIGHT - this.MARGIN_TOP;
    }
  }

  private addText(text: string, size: number, font: string = "/F1", x?: number) {
    this.ensureSpace(size + 4);
    const posX = x ?? this.MARGIN_LEFT;
    // Sanitize text for PDF
    const safe = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    this.currentPageLines.push(
      `BT ${font} ${size} Tf ${posX} ${this.currentY} Td ${pdfString(safe)} Tj ET`
    );
    this.currentY -= size + 4;
  }

  private addLine(y?: number) {
    const posY = y ?? this.currentY;
    this.ensureSpace(8);
    this.currentPageLines.push(
      `0.3 0.3 0.35 RG 0.5 w ${this.MARGIN_LEFT} ${posY} m ${this.PAGE_WIDTH - this.MARGIN_RIGHT} ${posY} l S`
    );
    this.currentY -= 10;
  }

  private addSectionHeader(title: string) {
    this.ensureSpace(40);
    this.currentY -= 8;
    // Cyan-ish accent line
    this.currentPageLines.push(
      `0.33 0.91 0.85 RG 2 w ${this.MARGIN_LEFT} ${this.currentY + 14} m ${this.MARGIN_LEFT + 4} ${this.currentY + 14} l S`
    );
    this.addText(title.toUpperCase(), 11, "/F2", this.MARGIN_LEFT + 10);
    this.addLine();
  }

  private addKeyValue(key: string, value: string) {
    this.ensureSpace(this.LINE_HEIGHT + 2);
    const safeKey = key.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const safeVal = value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    this.currentPageLines.push(
      `BT /F2 8 Tf ${this.MARGIN_LEFT} ${this.currentY} Td (${safeKey}:) Tj ET`,
      `BT /F1 8 Tf ${this.MARGIN_LEFT + 120} ${this.currentY} Td (${safeVal}) Tj ET`
    );
    this.currentY -= this.LINE_HEIGHT;
  }

  // Word-wrap long text into lines that fit within maxWidth (approximate)
  private wrapText(text: string, fontSize: number, maxWidth: number): string[] {
    const avgCharWidth = fontSize * 0.48; // approximate for Helvetica
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      if (current.length + word.length + 1 > maxChars && current.length > 0) {
        lines.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [""];
  }

  private addWrappedText(text: string, size: number, font: string = "/F1") {
    const lines = this.wrapText(text, size, this.USABLE_WIDTH);
    for (const line of lines) {
      this.addText(line, size, font);
    }
  }

  private addTableRow(cells: string[], widths: number[], bold = false) {
    this.ensureSpace(this.LINE_HEIGHT + 2);
    const font = bold ? "/F2" : "/F1";
    let x = this.MARGIN_LEFT;
    for (let i = 0; i < cells.length; i++) {
      const cell = (cells[i] ?? "").slice(0, Math.floor(widths[i]! / 3.8)); // truncate if needed
      const safe = cell.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      this.currentPageLines.push(
        `BT ${font} 7 Tf ${x} ${this.currentY} Td (${safe}) Tj ET`
      );
      x += widths[i]!;
    }
    this.currentY -= this.LINE_HEIGHT;
  }

  // ─── Build sections ──────────────────────────────────────────────────────

  private buildCoverPage() {
    this.startNewPage();
    this.currentY = 620;

    // Title block
    this.addText("CRIMEVISION AI", 20, "/F2");
    this.currentY -= 4;
    this.addText("FORENSIC INTELLIGENCE REPORT", 10, "/F1");
    this.currentY -= 20;
    this.addLine();
    this.currentY -= 10;

    this.addKeyValue("Case Reference", this.report.case.reference);
    this.addKeyValue("Case Title", this.report.case.title);
    this.addKeyValue("Status", this.report.case.status);
    this.addKeyValue("Priority", `P${this.report.case.priority}`);
    this.addKeyValue("Location", this.report.case.location ?? "Not specified");
    this.addKeyValue("Case Owner", this.report.case.owner.displayName ?? "Unknown");
    this.addKeyValue("Owner Email", this.report.case.owner.email ?? "Not specified");
    this.currentY -= 10;
    this.addKeyValue("Report Generated", new Date(this.report.generatedAt).toUTCString());
    this.addKeyValue("Report Version", this.report.reportVersion);
    this.currentY -= 10;
    this.addLine();
    this.currentY -= 6;
    this.addText("INTEGRITY CERTIFICATION", 9, "/F2");
    this.currentY -= 2;
    this.addKeyValue("Algorithm", this.report.certification.algorithm);
    this.addKeyValue("Hash", this.report.certification.hash);
    this.addWrappedText(this.report.certification.statement, 7);
    this.currentY -= 20;
    this.addText(`Chain of Custody Events: ${this.report.chainOfCustodyEvents}`, 8, "/F1");
  }

  private buildCaseSummary() {
    this.startNewPage();
    this.addSectionHeader("Case Summary");

    this.addKeyValue("ID", this.report.case.id);
    this.addKeyValue("Reference", this.report.case.reference);
    this.addKeyValue("Title", this.report.case.title);
    this.addKeyValue("Status", this.report.case.status);
    this.addKeyValue("Priority", `P${this.report.case.priority}`);
    this.addKeyValue("Location", this.report.case.location ?? "Not specified");
    this.addKeyValue("Created", new Date(this.report.case.createdAt).toUTCString());
    this.addKeyValue("Last Updated", new Date(this.report.case.updatedAt).toUTCString());
    this.currentY -= 6;

    if (this.report.case.description) {
      this.addText("Description:", 8, "/F2");
      this.addWrappedText(this.report.case.description, 8);
    }
  }

  private buildEvidenceInventory() {
    this.addSectionHeader("Evidence Inventory");

    const headers = ["Name", "Type", "Modality", "Size", "Status", "Analyses"];
    const widths = [150, 80, 65, 60, 65, 55];
    this.addTableRow(headers, widths, true);
    this.addLine();

    for (const ev of this.report.evidence) {
      const size = Number(ev.byteSize);
      const sizeStr = size > 1_000_000 ? `${(size / 1_000_000).toFixed(1)} MB` : `${Math.round(size / 1_000)} KB`;
      this.addTableRow(
        [ev.originalName, ev.mimeType, ev.modality, sizeStr, ev.status, String(ev.analysisCount)],
        widths
      );
    }
  }

  private buildAIFindings() {
    this.startNewPage();
    this.addSectionHeader("AI Findings & Detections");

    if (this.report.aiFindings.length === 0) {
      this.addText("No AI analysis results available for this case.", 8);
      return;
    }

    const headers = ["Evidence", "Type", "Model", "Confidence", "Timestamp"];
    const widths = [140, 80, 100, 70, 100];
    this.addTableRow(headers, widths, true);
    this.addLine();

    for (const finding of this.report.aiFindings) {
      const conf = finding.confidence != null ? `${(finding.confidence * 100).toFixed(1)}%` : "N/A";
      const time = finding.occurredAt ? new Date(finding.occurredAt).toISOString().slice(0, 19) : "—";
      this.addTableRow(
        [finding.evidenceName, finding.type, finding.model, conf, time],
        widths
      );
    }

    // Detection-specific sub-section
    const detections = this.report.aiFindings.filter((f) => f.type === "DETECTION");
    if (detections.length > 0) {
      this.currentY -= 10;
      this.addText(`Detection Results: ${detections.length} detections found`, 8, "/F2");
      for (const det of detections.slice(0, 20)) {
        const label = typeof det.payload.label === "string" ? det.payload.label : "object";
        const conf = det.confidence != null ? `${(det.confidence * 100).toFixed(1)}%` : "N/A";
        this.addText(`  - ${label} (${conf}) in ${det.evidenceName}`, 7);
      }
    }

    // OCR-specific sub-section
    const ocrResults = this.report.aiFindings.filter((f) => f.type === "OCR");
    if (ocrResults.length > 0) {
      this.currentY -= 10;
      this.addText(`OCR Results: ${ocrResults.length} text extractions`, 8, "/F2");
      for (const ocr of ocrResults.slice(0, 20)) {
        const text = typeof ocr.payload.text === "string" ? ocr.payload.text : JSON.stringify(ocr.payload);
        const conf = ocr.confidence != null ? `${(ocr.confidence * 100).toFixed(1)}%` : "N/A";
        this.addText(`  - "${text.slice(0, 80)}" (${conf}) in ${ocr.evidenceName}`, 7);
      }
    }
  }

  private buildTimeline() {
    this.startNewPage();
    this.addSectionHeader("Event Timeline");

    if (this.report.timeline.length === 0) {
      this.addText("No timeline events available for this case.", 8);
      return;
    }

    for (const event of this.report.timeline) {
      this.ensureSpace(50);
      const time = new Date(event.occurredAt).toISOString().slice(0, 19).replace("T", " ");
      const conf = event.confidence != null ? ` [${(event.confidence * 100).toFixed(1)}%]` : "";
      this.addText(`${time} UTC`, 7, "/F2");
      this.addText(`${event.title}${conf}`, 8, "/F1");
      this.addWrappedText(event.description, 7);
      this.addText(`Source: ${event.evidenceName} | Type: ${event.type}`, 6, "/F1");
      this.currentY -= 6;
    }
  }

  private buildConfidenceScores() {
    this.addSectionHeader("Confidence Score Summary");

    if (this.report.confidenceSummary.overall != null) {
      this.addKeyValue("Overall Average", `${(this.report.confidenceSummary.overall * 100).toFixed(1)}%`);
    } else {
      this.addKeyValue("Overall Average", "No confidence data available");
    }

    this.currentY -= 6;
    this.addText("Confidence by Analysis Type:", 8, "/F2");
    this.currentY -= 4;

    const headers = ["Type", "Average Confidence", "Count"];
    const widths = [150, 150, 100];
    this.addTableRow(headers, widths, true);
    this.addLine();

    for (const [type, stats] of Object.entries(this.report.confidenceSummary.byType)) {
      this.addTableRow(
        [type, `${(stats.avg * 100).toFixed(1)}%`, String(stats.count)],
        widths
      );
    }
  }

  private buildMetadata() {
    this.addSectionHeader("Report Metadata");

    this.addKeyValue("Report Version", this.report.reportVersion);
    this.addKeyValue("Generated At", new Date(this.report.generatedAt).toUTCString());
    this.addKeyValue("Certification Algorithm", this.report.certification.algorithm);
    this.addKeyValue("Certification Hash", this.report.certification.hash);
    this.addKeyValue("Evidence Items", String(this.report.evidence.length));
    this.addKeyValue("AI Findings", String(this.report.aiFindings.length));
    this.addKeyValue("Timeline Events", String(this.report.timeline.length));
    this.addKeyValue("Chain of Custody Events", String(this.report.chainOfCustodyEvents));
    this.currentY -= 10;
    this.addWrappedText(this.report.certification.statement, 7);
    this.currentY -= 20;
    this.addText("--- END OF REPORT ---", 8, "/F2", 240);
  }

  // ─── Assemble the final PDF ───────────────────────────────────────────────

  public generate(): Buffer {
    // Reserve IDs for structural objects
    this.catalogId = this.nextId++;
    this.pagesId = this.nextId++;
    this.fontId = this.nextId++;
    this.fontBoldId = this.nextId++;

    // Build all pages
    this.buildCoverPage();
    this.buildCaseSummary();
    this.buildEvidenceInventory();
    this.buildAIFindings();
    this.buildTimeline();
    this.buildConfidenceScores();
    this.buildMetadata();

    // Flush last page
    if (this.currentPageLines.length > 0) {
      this.flushPage();
    }

    // Build structural objects
    const allObjects: PdfObject[] = [];

    // Catalog
    allObjects.push({
      id: this.catalogId,
      content: `<< /Type /Catalog /Pages ${this.pagesId} 0 R >>`,
    });

    // Pages
    const kids = this.pageIds.map((id) => `${id} 0 R`).join(" ");
    allObjects.push({
      id: this.pagesId,
      content: `<< /Type /Pages /Kids [${kids}] /Count ${this.pageIds.length} >>`,
    });

    // Fonts
    allObjects.push({
      id: this.fontId,
      content: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    });
    allObjects.push({
      id: this.fontBoldId,
      content: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
    });

    // Merge all objects
    allObjects.push(...this.objects);
    allObjects.sort((a, b) => a.id - b.id);

    // Info dictionary
    const infoId = this.nextId++;
    allObjects.push({
      id: infoId,
      content: `<< /Title ${pdfString(`CrimeVision Report - ${this.report.case.reference}`)} /Author ${pdfString("CrimeVision AI")} /Creator ${pdfString("CrimeVision PDF Generator v1.0")} /Producer ${pdfString("CrimeVision AI")} /CreationDate ${pdfDate(new Date(this.report.generatedAt))} >>`,
    });

    // Serialize
    const parts: string[] = [];
    parts.push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    const offsets: number[] = [];
    let byteOffset = Buffer.byteLength(parts[0]!, "utf-8");

    for (const obj of allObjects) {
      offsets[obj.id] = byteOffset;
      const objStr = `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
      parts.push(objStr);
      byteOffset += Buffer.byteLength(objStr, "utf-8");
    }

    // Cross-reference table
    const xrefOffset = byteOffset;
    const xrefLines = [`xref\n0 ${allObjects.length + 1}\n`];
    xrefLines.push("0000000000 65535 f \n");
    for (let i = 1; i <= allObjects.length; i++) {
      const off = offsets[i] ?? 0;
      xrefLines.push(`${String(off).padStart(10, "0")} 00000 n \n`);
    }
    parts.push(xrefLines.join(""));

    // Trailer
    parts.push(
      `trailer\n<< /Size ${allObjects.length + 1} /Root ${this.catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    );

    return Buffer.from(parts.join(""), "binary");
  }
}

/**
 * Generate a complete PDF report for a CrimeVision case.
 */
export function generatePdf(report: ReportData): Buffer {
  return new PdfBuilder(report).generate();
}
