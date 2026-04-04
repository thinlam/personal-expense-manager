import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { TransactionController } from "./transaction.controller";
import { uploadSingle } from "./transaction.upload";

const router = Router();
router.use(requireAuth);

// ✅ 58 Export (đặt trước /:id)
router.get("/export/csv", TransactionController.exportCsv);
router.get("/export/xlsx", TransactionController.exportXlsx);
router.get("/export/pdf", TransactionController.exportPdf);

router.get("/", TransactionController.list);
router.post("/", TransactionController.create);

router.get("/:id", TransactionController.getOne);
router.post("/:id/attachments", uploadSingle, TransactionController.uploadAttachment);
router.post("/:id/refund", TransactionController.refund);

router.put("/:id", TransactionController.update);
router.delete("/:id", TransactionController.remove);

export default router;