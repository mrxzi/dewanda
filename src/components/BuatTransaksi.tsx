"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Barang, CartItem, Kategori, KATEGORI_LIST } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface BuatTransaksiProps {
  products: Barang[];
  cart: CartItem[];
  totalItems: number;
  onSetQuantity: (barang: Barang, jumlah: number) => void;
  onBack: () => void;
  onOpenCart: () => void;
}

export default function BuatTransaksi({
  products,
  cart,
  totalItems,
  onSetQuantity,
  onBack,
  onOpenCart,
}: BuatTransaksiProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState<Kategori | "Semua">("Semua");

  const getQty = (id: string) =>
    cart.find((c) => c.barang.id === id)?.jumlah ?? 0;

  const filtered = useMemo(() => {
    let list = products;
    if (kategori !== "Semua") {
      list = list.filter((p) => p.kategori === kategori);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.kategori.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, search, kategori]);

  const chips: (Kategori | "Semua")[] = ["Semua", ...KATEGORI_LIST];

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-slate-900" : "bg-slate-100"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-20 flex items-center gap-3 px-4 py-3.5 ${
          isDark
            ? "bg-slate-800 border-b border-slate-700"
            : "bg-[#2d3a8c] text-white"
        }`}
      >
        <button onClick={onBack} className="p-1" aria-label="Kembali">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">Buat Transaksi</h1>
      </header>

      {/* Search */}
      <div className={`px-4 pt-4 pb-2 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pt-3 pb-1 -mx-1 px-1 scrollbar-none">
          {chips.map((chip) => {
            const active = kategori === chip;
            return (
              <button
                key={chip}
                onClick={() => setKategori(chip)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#2d3a8c] text-white"
                    : isDark
                      ? "bg-slate-800 text-slate-300 border border-slate-700"
                      : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <p
          className={`text-sm font-semibold mb-3 ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          Daftar Produk ({filtered.length} Item)
        </p>

        {filtered.length === 0 ? (
          <div
            className={`rounded-xl border p-10 text-center ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <p className="text-3xl mb-2">📦</p>
            <p
              className={`text-sm ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Produk tidak ditemukan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const qtyInCart = getQty(item.id);
              const habis = item.qty <= 0;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity ${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200 shadow-sm"
                  } ${habis ? "opacity-50 grayscale" : ""}`}
                >
                  <div
                    className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    }`}
                  >
                    {item.gambar ? (
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        📦
                      </div>
                    )}
                    {habis && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wide">Habis</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.nama}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {formatRupiah(item.hargaJual)}
                    </p>
                    {habis ? (
                      <p className="text-xs font-medium text-red-500 mt-0.5">
                        Stok Habis
                      </p>
                    ) : (
                      <p
                        className={`text-xs mt-0.5 ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Stok: {item.qty} dus
                      </p>
                    )}
                  </div>

                  {!habis && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() =>
                          onSetQuantity(item, Math.max(0, qtyInCart - 1))
                        }
                        disabled={qtyInCart <= 0}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 ${
                          isDark
                            ? "bg-slate-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className={`w-9 text-center text-sm font-semibold tabular-nums ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() =>
                          onSetQuantity(
                            item,
                            Math.min(item.qty, qtyInCart + 1)
                          )
                        }
                        disabled={qtyInCart >= item.qty}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 ${
                          isDark
                            ? "bg-slate-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Keranjang bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-20 px-4 py-3 ${
          isDark ? "bg-slate-900" : "bg-slate-100"
        }`}
      >
        <button
          onClick={onOpenCart}
          disabled={totalItems === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-[#2d3a8c] text-white hover:bg-[#252f73] disabled:opacity-40 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Keranjang
          {totalItems > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {totalItems} dus
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
