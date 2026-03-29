import type { Request, Response } from "express";
import {
  getCustomReportRows,
  getReportsDashboard,
  type ReportFilters,
} from "./report.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
  };
  userId?: string;
};

function getUserId(req: AuthenticatedRequest): string | null {
  if (req.userId) return String(req.userId);
  if (req.user?.id) return String(req.user.id);
  if (req.user?._id) return String(req.user._id);
  return null;
}

function parseFilters(req: Request): ReportFilters {
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const wallet = typeof req.query.wallet === "string" ? req.query.wallet : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const keyword = typeof req.query.keyword === "string" ? req.query.keyword : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;

  return {
    from,
    to,
    wallet,
    category,
    keyword,
    type:
      type === "income" || type === "expense" || type === "all"
        ? type
        : "all",
  };
}

export async function getDashboardReportController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const filters = parseFilters(req);
    const data = await getReportsDashboard(userId, filters);

    return res.status(200).json(data);
  } catch (error) {
    console.error("getDashboardReportController error:", error);

    return res.status(500).json({
      message: "Không thể lấy dữ liệu báo cáo",
    });
  }
}

export async function getCustomReportController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const filters = parseFilters(req);
    const rows = await getCustomReportRows(userId, filters);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("getCustomReportController error:", error);

    return res.status(500).json({
      message: "Không thể lấy báo cáo tùy biến",
    });
  }
}