import type { RequestHandler, Response } from "express";
import type { AuthRequest } from "../auth/auth.middleware";
import { budgetService } from "./budget.service";

function qs(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export const BudgetController = {
  list: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const items = await budgetService.list(req.userId, {
      periodType: qs(req.query.periodType),
      periodKey: qs(req.query.periodKey),
      wallet: qs(req.query.wallet),
      category: qs(req.query.category),
    });
    return res.json(items);
  }) as RequestHandler,

  create: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const doc = await budgetService.create(req.userId, req.body);
    return res.status(201).json(doc);
  }) as RequestHandler,

  get: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const doc = await budgetService.get(req.userId, qs(req.params.id)!);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  }) as RequestHandler,

  update: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const doc = await budgetService.update(req.userId, qs(req.params.id)!, req.body);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  }) as RequestHandler,

  remove: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const out = await budgetService.remove(req.userId, qs(req.params.id)!);
    return res.json(out);
  }) as RequestHandler,

  usage: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const out = await budgetService.usage(req.userId, qs(req.params.id)!);
    if (!out) return res.status(404).json({ message: "Not found" });
    return res.json(out);
  }) as RequestHandler,

  compare: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const out = await budgetService.compare(req.userId, qs(req.params.id)!);
    if (!out) return res.status(404).json({ message: "Not found" });
    return res.json(out);
  }) as RequestHandler,

  history: (async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const out = await budgetService.history(req.userId, qs(req.params.id)!);
    if (!out) return res.status(404).json({ message: "Not found" });
    return res.json(out);
  }) as RequestHandler,
};