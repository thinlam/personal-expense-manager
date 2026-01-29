import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { getOverview } from "./dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/overview", requireAuth, getOverview);

export default dashboardRouter;
