import type { DateFormat } from "../services/user.service";

export function formatMoneyByCurrency(value: number, currency: "VND" | "USD" | "EUR") {
  const localeMap = {
    VND: "vi-VN",
    USD: "en-US",
    EUR: "de-DE",
  } as const;

  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export function formatDateBySetting(
  input: string | Date,
  dateFormat: DateFormat = "DD/MM/YYYY"
) {
  const d = new Date(input);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    case "DD/MM/YYYY":
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}