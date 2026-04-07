import type { RequestHandler, Response } from "express";
import type { AuthRequest } from "../auth/auth.middleware";
import { transactionService } from "./transaction.service";
import { buildFileUrl } from "./transaction.upload";

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

function qs(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}
function qd(v: unknown): Date | undefined {
  const s = qs(v);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function paramId(req: AuthRequest): string {
  const raw = (req as any).params?.id;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  // fallback: express params thường là string
  return String((req as any).params?.id ?? "");
}

export const TransactionController = {
  list: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const out = await transactionService.list({
      userId: req.userId,
      q: qs(req.query.q),
      wallet: qs(req.query.wallet),
      category: qs(req.query.category),
      tag: qs(req.query.tag),
      from: qd(req.query.from),
      to: qd(req.query.to),
      range: qs(req.query.range) as any,
    });

    return res.json(out);
  }) as RequestHandler,

  create: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const created = await transactionService.create(req.userId, req.body);
    return res.status(201).json(created);
  }) as RequestHandler,

  update: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const id = paramId(req);
    const updated = await transactionService.update(req.userId, id, req.body);

    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  }) as RequestHandler,

  remove: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const id = paramId(req);
    const out = await transactionService.remove(req.userId, id);

    return res.json(out);
  }) as RequestHandler,

  // 45
  getOne: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const id = paramId(req);
    const tx = await transactionService.get(req.userId, id);

    if (!tx) return res.status(404).json({ message: "Not found" });
    return res.json(tx);
  }) as RequestHandler,

  // 51
  uploadAttachment: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const id = paramId(req);
    const file = (req as any).file as { filename: string; mimetype: string; size: number } | undefined;
    if (!file) return res.status(400).json({ message: "Missing file" });

    const url = buildFileUrl(req as any, file.filename);

    const updated = await transactionService.addAttachment(req.userId, id, {
      filename: file.filename,
      url,
      mimeType: file.mimetype || "",
      size: file.size || 0,
    });

    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  }) as RequestHandler,

  // 55
  refund: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const id = paramId(req);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const out = await transactionService.refund(req.userId, id);
    if (!out) return res.status(404).json({ message: "Not found" });

    return res.status(201).json(out);
  }) as RequestHandler,

  // 58: CSV
  exportCsv: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    // dùng service.exportCsv cho gọn + chuẩn
    const csv = await transactionService.exportCsv({
      userId: req.userId,
      q: qs(req.query.q),
      wallet: qs(req.query.wallet),
      category: qs(req.query.category),
      tag: qs(req.query.tag),
      from: qd(req.query.from),
      to: qd(req.query.to),
      range: qs(req.query.range) as any,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="transactions.csv"`);
    return res.send(csv);
  }) as RequestHandler,

  // ✅ 58: Excel
  exportXlsx: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await transactionService.list({
      userId: req.userId,
      q: qs(req.query.q),
      wallet: qs(req.query.wallet),
      category: qs(req.query.category),
      tag: qs(req.query.tag),
      from: qd(req.query.from),
      to: qd(req.query.to),
      range: qs(req.query.range) as any,
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Transactions");

    ws.columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Type", key: "type", width: 10 },
      { header: "Amount", key: "amount", width: 14 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Title", key: "title", width: 26 },
      { header: "Category", key: "category", width: 18 },
      { header: "Wallet", key: "wallet", width: 16 },
      { header: "Payee", key: "payee", width: 18 },
      { header: "Note", key: "note", width: 22 },
      { header: "Tags", key: "tags", width: 22 },
    ];

    (items as any[]).forEach((t) => {
      ws.addRow({
        date: String(t.date).slice(0, 10),
        type: t.type,
        amount: t.amount,
        currency: t.currency ?? "VND",
        title: t.title,
        category: t.category,
        wallet: t.wallet,
        payee: t.payee ?? "",
        note: t.note ?? "",
        tags: (t.tags ?? []).join(", "),
      });
    });

    ws.getRow(1).font = { bold: true };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="transactions.xlsx"`);

    await wb.xlsx.write(res);
    return res.end();
  }) as RequestHandler,

  // ✅ 58: PDF
  exportPdf: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await transactionService.list({
      userId: req.userId,
      q: qs(req.query.q),
      wallet: qs(req.query.wallet),
      category: qs(req.query.category),
      tag: qs(req.query.tag),
      from: qd(req.query.from),
      to: qd(req.query.to),
      range: qs(req.query.range) as any,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="transactions.pdf"`);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(res);

    doc.fontSize(16).text("Transactions");
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Exported at: ${new Date().toLocaleString("vi-VN")}`);
    doc.moveDown(1);

    doc.fontSize(10).text("Date | Type | Amount | Title | Category | Wallet", { underline: true });
    doc.moveDown(0.5);

    (items as any[]).forEach((t) => {
      const line =
        `${String(t.date).slice(0, 10)} | ${t.type} | ${t.amount} ${t.currency ?? ""} | ` +
        `${t.title} | ${t.category} | ${t.wallet}`;
      doc.text(line);
    });

    doc.end();
  }) as RequestHandler,
};