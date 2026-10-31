export interface Barang {
  id: string;
  nama: string;
  kategori: Kategori;
  qty: number;
  hargaSatuan: number;
  hargaJual: number;
  catatan: string;
  tanggal: string;
  gambar?: string; // base64 data URL
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

// Cart item for checkout
export interface CartItem {
  barang: Barang;
  jumlah: number;
}

// Payment method
export type MetodePembayaran = "tunai" | "non-tunai";

// Transaction record
export interface Transaksi {
  id: string;
  tanggal: string;
  waktu: string;
  namaCustomer: string;
  alamat?: string;
  items: {
    namaBarang: string;
    gambar?: string;
    jumlah: number;
    hargaSatuan: number;
    hargaJual: number;
    subtotal: number;
  }[];
  subtotal: number;
  total: number;
  keuntungan: number;
  metodePembayaran: MetodePembayaran;
  cashDibayar: number;
  kembalian: number;
  kasir: string;
}
