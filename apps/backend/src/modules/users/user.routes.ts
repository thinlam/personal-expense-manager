import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import {
  changeMyPassword,
  getMe,
  logoutAllMyDevices,
  updateMe,
  upsertMyPin,
} from "./user.controller";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.patch("/me/password", requireAuth, changeMyPassword);
router.patch("/me/pin", requireAuth, upsertMyPin);
router.post("/me/logout-all-devices", requireAuth, logoutAllMyDevices);

export default router;
