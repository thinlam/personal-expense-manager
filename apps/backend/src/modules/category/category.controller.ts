import { Request, Response } from "express";
import Category from "./category.model";

/* ================= GET ================= */

export const getCategories = async (_req: Request, res: Response) => {
  const data = await Category.find().sort({ createdAt: -1 });
  res.json(data);
};

/* ================= CREATE ================= */

export const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
};

/* ================= UPDATE ================= */

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.json(updated);
};

/* ================= DELETE ================= */

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};

/* ================= FAVORITE ================= */

export const toggleFavorite = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = await Category.findById(id);

  if (!cat) {
    return res.status(404).json({ message: "Not found" });
  }

  cat.isFavorite = !cat.isFavorite;
  await cat.save();

  res.json(cat);
};

/* ================= IMPORT TEMPLATE ================= */

export const importTemplate = async (_req: Request, res: Response) => {
  const exists = await Category.countDocuments();

  if (exists > 0) {
    return res.status(400).json({
      message:
        "Danh mục đã tồn tại. Hãy xóa toàn bộ trước khi import lại.",
    });
  }

  const templates = [
    // ===== INCOME =====
    {
      name: "Lương",
      type: "income",
      icon: "💰",
      color: "#22c55e",
      isSystem: true,
    },
    {
      name: "Thưởng",
      type: "income",
      icon: "🎁",
      color: "#10b981",
      isSystem: true,
    },
    {
      name: "Khác",
      type: "income",
      icon: "📦",
      color: "#3b82f6",
      isSystem: true,
    },

    // ===== EXPENSE =====
    {
      name: "Ăn uống",
      type: "expense",
      icon: "🍜",
      color: "#f97316",
      isSystem: true,
    },
    {
      name: "Di chuyển",
      type: "expense",
      icon: "🚗",
      color: "#ef4444",
      isSystem: true,
    },
    {
      name: "Mua sắm",
      type: "expense",
      icon: "🛍",
      color: "#a855f7",
      isSystem: true,
    },
    {
      name: "Khác",
      type: "expense",
      icon: "📦",
      color: "#64748b",
      isSystem: true,
    },
  ];

  await Category.insertMany(templates);

  res.json({ message: "Import thành công" });
};

/* ================= CLEAR ALL ================= */

export const clearAllCategories = async (_req: Request, res: Response) => {
  await Category.deleteMany({});
  res.json({ message: "Đã xóa toàn bộ danh mục" });
};

/* ================= SUGGEST ================= */

export const suggestCategory = async (
  req: Request,
  res: Response
) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Missing text" });
  }

  const lowerText = text.toLowerCase();

  if (lowerText.includes("ăn")) {
    return res.json({
      name: "Ăn uống",
      type: "expense",
      icon: "🍜",
      color: "#f97316",
    });
  }

  if (lowerText.includes("lương")) {
    return res.json({
      name: "Lương",
      type: "income",
      icon: "💰",
      color: "#22c55e",
    });
  }

  return res.json({
    name: "Khác",
    type: "expense",
    icon: "📦",
    color: "#64748b",
  });
};