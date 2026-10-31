"use client";

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/lib/types";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface CheckoutProps {
  cart: CartItem[];
  subtotal: number;
  totalItems: number;
  onUpdateQuantity: (barangId: string, jumlah: number) => void;
  onRemoveFromCart: (barangId: string) => void;
  onBack: () => void;
  onProceedPayment: (namaCustomer: string) => void;
}

export default function Checkout({
  cart,
  subtotal,
  totalItems,
  onUpdateQuantity,
  onRemoveFromCart,
  onBack,
  onProceedPayment,
}: CheckoutProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [namaCustomer, setNamaCustomer] = useState("");
  const [showNameError, setShowNameError] = useState(false);
  const [produkOpen, setProdukOpen] = useState(true);
  const [rincianOpen, setRincianOpen] = useState(true);

  const total = subtotal;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 ${isDark ? "bg-slate-800 border-b border-slate-700" : "bg-[#2d3a8c] text-white"}`}>
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">Checkout Transaksi</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-36">
        {/* Nama Customer */}
        <div className="space-y-1">
          <input
            type="text"
            value={namaCustomer}
            onChange={(e) => {
              setNamaCustomer(e.target.value);
              if (e.target.value.trim()) setShowNameError(false);
            }}
            placeholder="Nama customer (wajib diisi)"
            className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${
              showNameError
                ? "border-red-400 bg-red-50 placeholder:text-red-300 text-slate-900"
                : isDark
                  ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            }`}
          />
          {showNameError && (
            <p className="text-xs text-red-500 px-1">⚠ Nama customer wajib diisi sebelum melanjutkan.</p>
          )}
        </div>

        {/* Produk Terpilih */}
        <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <button
            onClick={() => setProdukOpen(!produkOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <span className="font-semibold text-sm">Produk Terpilih</span>
            {produkOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {produkOpen && (
            <div className="px-4 pb-4 space-y-3">
              {cart.map((item) => (
                <div key={item.barang.id} className="flex items-center gap-3">
                  {/* Product image */}
                  <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                    {item.barang.gambar ? (
                      <img src={item.barang.gambar} alt={item.barang.nama} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                      {item.barang.nama}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => onUpdateQuantity(item.barang.id, item.jumlah - 1)}
                        className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`text-xs min-w-[40px] text-center ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        {item.jumlah} dus × {formatNumber(item.barang.hargaJual)}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.barang.id, item.jumlah + 1)}
                        disabled={item.jumlah >= item.barang.qty}
                        className={`w-6 h-6 rounded flex items-center justify-center disabled:opacity-30 ${isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveFromCart(item.barang.id)}
                        className="p-1 text-red-400 hover:text-red-500 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <span className={`text-sm font-semibold flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    {formatNumber(item.jumlah * item.barang.hargaJual)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rincian Transaksi */}
        <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <button
            onClick={() => setRincianOpen(!rincianOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <span className="font-semibold text-sm">Rincian Transaksi</span>
            {rincianOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {rincianOpen && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Sub Total</span>
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>{formatNumber(subtotal)}</span>
              </div>
              <div className={`flex justify-between text-sm pt-2 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Total</span>
                <span className={`font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>{formatRupiah(total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`fixed bottom-0 left-0 right-0 border-t px-4 py-3 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Grand Total</p>
            <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{totalItems} dus</p>
          </div>
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {formatRupiah(total)}
          </p>
        </div>
        <button
          onClick={() => {
            if (!namaCustomer.trim()) {
              setShowNameError(true);
              return;
            }
            onProceedPayment(namaCustomer.trim());
          }}
          disabled={cart.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-[#2d3a8c] text-white hover:bg-[#252f73] disabled:opacity-40 transition-colors"
        >
          Pilih Pembayaran
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
