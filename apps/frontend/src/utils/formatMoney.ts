export function formatMoney(
  amount: number,
  currency: "VND" | "USD" = "VND"
): string {
  if (Number.isNaN(amount)) return "0";

  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
