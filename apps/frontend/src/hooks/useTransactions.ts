import { useCallback, useEffect, useMemo, useState } from "react";
import type { TransactionDTO, TransactionCreateDTO, TransactionUpdateDTO } from "../types/transaction";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from "../services/transaction.service";

export type Period = "DAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";

export type TxQuery = {
  q: string;
  type: "" | "INCOME" | "EXPENSE";
  wallet: string;
  category: string;
  tag: string; // filter tag 1 cái (nhập)
  period: Period;
  from: string; // yyyy-mm-dd
  to: string;   // yyyy-mm-dd
};

const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10);

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 CN .. 6 T7
  const diff = (day === 0 ? -6 : 1) - day; // về thứ 2
  x.setDate(x.getDate() + diff);
  return x;
}
function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}
function startOfYear(d: Date) {
  const x = startOfDay(d);
  x.setMonth(0, 1);
  return x;
}

function calcRange(period: Period) {
  const now = new Date();
  if (period === "DAY") {
    return { from: yyyyMmDd(startOfDay(now)), to: yyyyMmDd(endOfDay(now)) };
  }
  if (period === "WEEK") {
    const s = startOfWeek(now);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    return { from: yyyyMmDd(s), to: yyyyMmDd(e) };
  }
  if (period === "MONTH") {
    const s = startOfMonth(now);
    const e = new Date(s);
    e.setMonth(e.getMonth() + 1);
    e.setDate(e.getDate() - 1);
    return { from: yyyyMmDd(s), to: yyyyMmDd(e) };
  }
  if (period === "YEAR") {
    const s = startOfYear(now);
    const e = new Date(s);
    e.setFullYear(e.getFullYear() + 1);
    e.setDate(e.getDate() - 1);
    return { from: yyyyMmDd(s), to: yyyyMmDd(e) };
  }
  return { from: yyyyMmDd(now), to: yyyyMmDd(now) };
}

// ✅ normalize: backend có thể trả [] hoặc {data:[]} hoặc {items:[]}
function normalizeList(payload: unknown): TransactionDTO[] {
  if (Array.isArray(payload)) return payload as TransactionDTO[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as TransactionDTO[];
    if (Array.isArray(obj.items)) return obj.items as TransactionDTO[];
    if (Array.isArray(obj.transactions)) return obj.transactions as TransactionDTO[];
  }
  return [];
}

export function useTransactions() {
  const [{ q, type, wallet, category, tag, period, from, to }, setQuery] = useState<TxQuery>(() => {
    const r = calcRange("MONTH");
    return {
      q: "",
      type: "",
      wallet: "",
      category: "",
      tag: "",
      period: "MONTH",
      from: r.from,
      to: r.to,
    };
  });

  const [items, setItems] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ load từ API (có params)
  const fetchList = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {};
      if (q.trim()) params.q = q.trim();
      if (wallet.trim()) params.wallet = wallet.trim();
      if (category.trim()) params.category = category.trim();
      if (from) params.from = from;
      if (to) params.to = to;

      // backend hiện service của bạn chỉ nhận q/wallet/category/from/to
      const res = await getTransactions(params);
      setItems(normalizeList(res));
    } catch {
      setItems([]);
      setErr("Không tải được danh sách giao dịch. Kiểm tra API /transactions.");
    } finally {
      setLoading(false);
    }
  }, [q, wallet, category, from, to]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ✅ filter thêm ở client cho type + tag (để không cần sửa backend ngay)
  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const qq = q.trim().toLowerCase();
    const t = type;
    const tg = tag.trim().toLowerCase();

    return list.filter((x) => {
      if (t && x.type !== t) return false;
      if (tg) {
        const tags = (x.tags ?? []).map((s: string) => s.toLowerCase());
        if (!tags.some((s: string | string[]) => s.includes(tg))) return false;
      }

      if (!qq) return true;
      const hay = [
        x.title,
        x.note ?? "",
        x.payee ?? "",
        x.wallet,
        x.category,
        (x.tags ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [items, q, type, tag]);

  const totalIncome = useMemo(
    () => filtered.filter((x: TransactionDTO) => x.type === "INCOME").reduce((s: number, x: TransactionDTO) => s + (x.amount || 0), 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((x: TransactionDTO) => x.type === "EXPENSE").reduce((s: number, x: TransactionDTO) => s + (x.amount || 0), 0),
    [filtered]
  );

  const setPeriod = useCallback((p: Period) => {
    if (p === "CUSTOM") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setQuery((prev: any) => ({ ...prev, period: "CUSTOM" }));
      return;
    }
    const r = calcRange(p);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setQuery((prev: any) => ({ ...prev, period: p, from: r.from, to: r.to }));
  }, []);

  const create = useCallback(async (payload: TransactionCreateDTO) => {
    setLoading(true);
    setErr(null);
    try {
      await createTransaction(payload);
      await fetchList();
      return true;
    } catch {
      setErr("Tạo giao dịch thất bại. Kiểm tra backend validate / token.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  const update = useCallback(async (id: string, payload: TransactionUpdateDTO) => {
    setLoading(true);
    setErr(null);
    try {
      await updateTransaction(id, payload);
      await fetchList();
      return true;
    } catch {
      setErr("Sửa giao dịch thất bại. Kiểm tra API.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  const remove = useCallback(async (id: string) => {
    const ok = confirm("Xóa giao dịch này?");
    if (!ok) return false;

    setLoading(true);
    setErr(null);
    try {
      await deleteTransaction(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems((prev: any[]) => prev.filter((x: TransactionDTO ) => x._id !== id));
      return true;
    } catch {
      setErr("Xóa thất bại. Kiểm tra API (401/404/500).");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    query: { q, type, wallet, category, tag, period, from, to },
    setQuery,
    setPeriod,
    items,
    filtered,
    totalIncome,
    totalExpense,
    loading,
    err,
    fetchList,
    create,
    update,
    remove,
  };
}
