import { useState } from "react";
import { importTemplate } from "../../../services/category.service";

interface Props {
  onSuccess: () => void;
}

export default function ImportTemplate({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImport = async () => {
    try {
      setLoading(true);
      setMessage("");

      await importTemplate();

      setMessage("✅ Import danh mục mẫu thành công!");
      onSuccess();
    } catch (error) {
      console.error(error);
      setMessage("❌ Import thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <button
        className="cat-btn"
        onClick={handleImport}
        disabled={loading}
      >
        {loading ? "Đang import..." : "Import danh mục mẫu"}
      </button>

      {message && (
        <div style={{ marginTop: "8px", fontSize: "13px" }}>
          {message}
        </div>
      )}
    </div>
  );
}