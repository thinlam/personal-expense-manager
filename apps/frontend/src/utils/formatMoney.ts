/**
 * Định dạng số tiền:
 * - VND: hiển thị số với dấu chấm phân cách hàng nghìn, không ký hiệu tiền tệ.
 * - USD: hiển thị kèm ký hiệu $ và dấu phẩy phân cách hàng nghìn.
 */
export function formatMoney(
  amount: number,
  currency: "VND" | "USD" = "VND"
): string {
  if (Number.isNaN(amount)) return "0";

  if (currency === "VND") {
    // Dùng kiểu "decimal" để chỉ nhóm số, không thêm ký hiệu tiền tệ
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // USD: giữ nguyên style currency
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}