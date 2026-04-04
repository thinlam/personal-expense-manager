import { api } from "./api";
import type {
  CustomReportRow,
  ReportFilters,
  ReportsDashboardData,
} from "../types/report";

export async function getReportsDashboard(
  filters: ReportFilters
): Promise<ReportsDashboardData> {
  const { data } = await api.get("/reports/dashboard", {
    params: filters,
  });
  return data;
}

export async function getCustomReport(
  filters: ReportFilters
): Promise<CustomReportRow[]> {
  const { data } = await api.get("/reports/custom", {
    params: filters,
  });
  return data;
}

export function exportCustomReportCsv(rows: CustomReportRow[]): void {
  const headers = [
    "Ngày",
    "Loại",
    "Tiêu đề",
    "Danh mục",
    "Ví",
    "Số tiền",
    "Ghi chú",
  ];

  const body = rows.map((row) => [
    row.date,
    row.type,
    row.title,
    row.category,
    row.wallet,
    row.amount,
    row.note ?? "",
  ]);

  const csv = [headers, ...body]
    .map((line) =>
      line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `custom-report-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}