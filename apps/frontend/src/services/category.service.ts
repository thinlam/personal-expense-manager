import { api } from "./api";

/* ================= GET ================= */

export const getCategories = () =>
  api.get("/categories");

/* ================= CREATE ================= */

export const createCategory = (data: any) =>
  api.post("/categories", data);

/* ================= UPDATE ================= */

export const updateCategory = (id: string, data: any) =>
  api.put(`/categories/${id}`, data);

/* ================= DELETE ================= */

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`);

/* ================= FAVORITE ================= */

export const toggleFavorite = (id: string) =>
  api.patch(`/categories/${id}/favorite`);

/* ================= IMPORT TEMPLATE ================= */

export const importTemplate = () =>
  api.post("/categories/import-template");

/* ================= CLEAR ALL ================= */

export const clearAllCategories = () =>
  api.delete("/categories/clear-all");

/* ================= SUGGEST ================= */

export const suggestCategory = (text: string) =>
  api.post("/categories/suggest", { text });