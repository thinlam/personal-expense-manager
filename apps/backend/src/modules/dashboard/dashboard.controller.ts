import { Response } from "express";
import { type AuthRequest } from "../auth/auth.middleware";
import { dashboardService } from "./dashboard.service";

export async function getOverview(req: AuthRequest, res: Response) {
  const range = (req.query.range as string) || "THIS_MONTH";
  const userId = req.userId!;
  const dto = await dashboardService.getOverview(userId, range);
  return res.json(dto);
}
