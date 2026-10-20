export interface Barang {
  id: string;
  nama: string;
  kategori: Kategori;
  qty: number;
  hargaSatuan: number;
  catatan: string;
  tanggal: string;
}

export type Kategori =
  | "Jajanan/Snack"
  | "Mie Instan"
  | "Sabun & Deterjen"
  | "Sembako"
  | "Minuman";

export const KATEGORI_LIST: Kategori[] = [
  "Jajanan/Snack",
  "Mie Instan",
  "Sabun & Deterjen",
  "Sembako",
  "Minuman",
];

export type SortOption =
  | "subtotal-desc"
  | "subtotal-asc"
  | "nama-asc"
  | "nama-desc"
  | "qty-desc";
