import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { getMe, updateMe } from "./user.controller";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);

export default router;