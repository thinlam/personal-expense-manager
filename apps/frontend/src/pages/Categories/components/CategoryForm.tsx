import { useState } from "react";
import { createCategory } from "../../../services/category.service";

export default function CategoryForm({ onSuccess }: any) {
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    parentId: "",
    icon: "📁",
    color: "#6366f1",
  });

  const handleSubmit = async () => {
    await createCategory(form);
    onSuccess();
  };

  return (
    <div className="cat-form">
      <input
        placeholder="Tên danh mục"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <select
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="expense">Chi</option>
        <option value="income">Thu</option>
      </select>

      <input
        type="color"
        onChange={(e) => setForm({ ...form, color: e.target.value })}
      />

      <input
        placeholder="Icon (emoji)"
        onChange={(e) => setForm({ ...form, icon: e.target.value })}
      />

      <button onClick={handleSubmit}>Tạo</button>
    </div>
  );
}