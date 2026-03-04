import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleFavorite,
  importTemplate,
  clearAllCategories,
} from "../../services/category.service";
import type { Category } from "../../types/category";
import "./categories.css";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "expense" as "income" | "expense",
  });

  /* ================= LOAD ================= */

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= RESET ================= */

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      type: "expense",
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setSubmitting(true);

      if (editing?._id) {
        await updateCategory(editing._id, form);
        setMessage("Cập nhật thành công");
      } else {
        await createCategory({
          ...form,
          icon: "📁",
          color: "#3b82f6",
        });
        setMessage("Tạo danh mục thành công");
      }

      resetForm();
      loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  /* ================= FAVORITE ================= */

  const handleFavorite = async (
    e: React.MouseEvent,
    id?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    await toggleFavorite(id);
    loadData();
  };

  /* ================= DELETE ================= */

  const handleDelete = async (cat: Category) => {
    if (!cat._id || cat.isSystem) return;
    if (!window.confirm(`Xóa "${cat.name}"?`)) return;

    await deleteCategory(cat._id);
    loadData();
  };

  /* ================= IMPORT ================= */

  const handleImport = async () => {
    try {
      await importTemplate();
      loadData();
      setMessage("Import thành công");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  /* ================= CLEAR ================= */

  const handleClearAll = async () => {
    if (!window.confirm("Xóa toàn bộ danh mục?")) return;

    await clearAllCategories();
    loadData();
  };

  /* ================= START EDIT ================= */

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      type: cat.type,
    });
  };

  /* ================= RENDER LIST ================= */

  const renderList = (type: "income" | "expense") =>
    categories
      .filter((c) => c.type === type)
      .map((cat) => (
        <div key={cat._id} className="cat-item">
          <div className="cat-left">
            <div
              className="cat-icon"
              style={{ background: cat.color }}
            >
              {cat.icon}
            </div>
            <span>{cat.name}</span>
          </div>

          <div className="cat-actions">
            <button
              type="button"
              onClick={(e) =>
                handleFavorite(e, cat._id)
              }
            >
              ⭐
            </button>

            <button
              type="button"
              onClick={() => startEdit(cat)}
            >
              ✏
            </button>

            {!cat.isSystem && (
              <button
                type="button"
                onClick={() => handleDelete(cat)}
              >
                🗑
              </button>
            )}
          </div>
        </div>
      ));

  /* ================= RENDER ================= */

  return (
    <div className="categories-page">
      <h1 className="page-title">Quản lý Danh mục</h1>

      {message && (
        <div className="toast-message">{message}</div>
      )}

      {editing && (
        <div className="edit-banner">
          <span>
            ✏ Đang chỉnh sửa: <strong>{editing.name}</strong>
          </span>
          <button
            type="button"
            className="cancel-btn"
            onClick={resetForm}
          >
            Huỷ
          </button>
        </div>
      )}

      <form className="cat-form" onSubmit={handleSubmit}>
        <input
          placeholder="Tên danh mục"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as any })
          }
        >
          <option value="expense">Chi</option>
          <option value="income">Thu</option>
        </select>

        <button
          type="submit"
          className="cat-btn"
          disabled={submitting}
        >
          {editing ? "Cập nhật" : "Tạo"}
        </button>
      </form>

      <div className="categories-tools">
        <button type="button" onClick={handleImport}>
          Import danh mục mẫu
        </button>

        <button
          type="button"
          className="danger-btn"
          onClick={handleClearAll}
        >
          Xóa toàn bộ
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <h3>Danh mục Thu</h3>
          {renderList("income")}

          <h3>Danh mục Chi</h3>
          {renderList("expense")}
        </>
      )}
    </div>
  );
}