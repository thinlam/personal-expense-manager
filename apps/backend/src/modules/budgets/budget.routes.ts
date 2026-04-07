import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { BudgetController } from "./budget.controller";

const router = Router();
router.use(requireAuth);

router.get("/", BudgetController.list);
router.post("/", BudgetController.create);
router.get("/:id", BudgetController.get);
router.put("/:id", BudgetController.update);
router.delete("/:id", BudgetController.remove);

router.get("/:id/usage", BudgetController.usage);
router.get("/:id/compare", BudgetController.compare);
router.get("/:id/history", BudgetController.history);

export default router;