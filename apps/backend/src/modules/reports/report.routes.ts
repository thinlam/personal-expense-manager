import { Router } from "express";
import {
  getCustomReportController,
  getDashboardReportController,
} from "./report.controller";
import { requireAuth } from "../auth/auth.middleware";

const reportRouter = Router();

reportRouter.get("/dashboard", requireAuth, getDashboardReportController);
reportRouter.get("/custom", requireAuth, getCustomReportController);

export default reportRouter;