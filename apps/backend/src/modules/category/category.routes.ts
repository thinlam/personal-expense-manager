import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleFavorite,
  importTemplate,
  clearAllCategories,
  suggestCategory,
} from "./category.controller";

const router = Router();

/* ================= CRUD ================= */

router.get("/", getCategories);
router.post("/", createCategory);

/* 🔥 ĐẶT ROUTE CỤ THỂ TRƯỚC ROUTE ĐỘNG */

router.delete("/clear-all", clearAllCategories);
router.post("/import-template", importTemplate);
router.post("/suggest", suggestCategory);

router.patch("/:id/favorite", toggleFavorite);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;