import path from "path";
import multer from "multer";
import type { Request } from "express";

// @ts-ignore - multer types not available, install @types/multer to fix
const upload = multer as any;

const uploadDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
    const uniq = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`;
    cb(null, uniq);
  },
});

export const uploadSingle = multer({ storage }).single("file");

export function buildFileUrl(req: Request, filename: string) {
  const proto = req.headers["x-forwarded-proto"] ? String(req.headers["x-forwarded-proto"]) : req.protocol;
  const host = req.headers["x-forwarded-host"] ? String(req.headers["x-forwarded-host"]) : req.get("host");
  return `${proto}://${host}/uploads/${filename}`;
}