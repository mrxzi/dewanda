import { Barang } from "./types";

/**
 * Format number as Indonesian Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate subtotal of a Barang item
 */
export function getSubtotal(item: Barang): number {
  return item.qty * item.hargaSatuan;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Format date string to Indonesian locale
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Export data to CSV and trigger download
 */
export function exportCSV(data: Barang[]): void {
  const headers = [
    "No",
    "Nama Barang",
    "Kategori",
    "Qty",
    "Harga Satuan",
    "Subtotal",
    "Tanggal",
    "Catatan",
  ];

  const rows = data.map((item, index) => [
    index + 1,
    item.nama,
    item.kategori,
    item.qty,
    item.hargaSatuan,
    item.qty * item.hargaSatuan,
    item.tanggal,
    item.catatan,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",")
            ? `"${cell}"`
            : String(cell)
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `data-inventaris-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
