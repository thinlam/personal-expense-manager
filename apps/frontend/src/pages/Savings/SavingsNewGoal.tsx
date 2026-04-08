import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import "./savings-new-goal.css";
import { createBudget } from "../../services/budget.service";

export default function SavingsNewGoal() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [wallet, setWallet] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);

    if (!name.trim()) {
      setError("Vui lòng nhập tên mục tiêu.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Số tiền mục tiêu phải lớn hơn 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createBudget({
        name: name.trim(),
        amount: parsedAmount,
        periodType: "MONTH",
        periodStart,
        category: category.trim() || undefined,
        wallet: wallet.trim() || undefined,
      });

      navigate("/savings", { replace: true });
    } catch (err: unknown) {
      if (isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? err.message ?? "Không thể tạo mục tiêu tiết kiệm.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể tạo mục tiêu tiết kiệm.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="savingsGoalPage">
      <div className="savingsGoalShell">
        <div className="savingsGoalHeader">
          <div>
            <p>CREATE GOAL</p>
            <h1>Thêm mục tiêu tiết kiệm</h1>
            <span>Tạo mục tiêu mới và lưu trực tiếp vào hệ thống dữ liệu của bạn.</span>
          </div>
          <button type="button" onClick={() => navigate("/savings")}>
            ← Quay lại
          </button>
        </div>

        <form className="savingsGoalForm" onSubmit={handleSubmit}>
          <label>
            <span>Tên mục tiêu</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Quỹ khẩn cấp 6 tháng"
            />
          </label>

          <label>
            <span>Số tiền mục tiêu</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Ví dụ: 20000000"
            />
          </label>

          <label>
            <span>Ngày bắt đầu</span>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </label>

          <label>
            <span>Danh mục (tuỳ chọn)</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ví dụ: Savings"
            />
          </label>

          <label>
            <span>Ví (tuỳ chọn)</span>
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Ví dụ: Ví Chính"
            />
          </label>

          {error ? <div className="savingsGoalError">{error}</div> : null}

          <div className="savingsGoalActions">
            <button type="button" className="ghost" onClick={() => navigate("/savings")}>
              Hủy
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu mục tiêu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
