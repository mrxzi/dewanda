"use client";

import { Transaksi } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { Receipt, Trash2 } from "lucide-react";

interface TransaksiListProps {
  transaksiList: Transaksi[];
  onDelete: (id: string) => void;
  onViewReceipt: (transaksi: Transaksi) => void;
}

export default function TransaksiList({
  transaksiList,
  onDelete,
  onViewReceipt,
}: TransaksiListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (transaksiList.length === 0) {
    return (
      <div className={`rounded-xl border p-12 text-center ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <p className="text-3xl mb-2">🧾</p>
        <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Belum ada transaksi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transaksiList.map((tx) => (
        <div
          key={tx.id}
          className={`rounded-xl border p-4 transition-colors ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {tx.namaCustomer || "Customer"}
              </p>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {tx.tanggal} {tx.waktu} · #{tx.id.slice(0, 8)}
              </p>
            </div>
            <p className={`text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              {formatRupiah(tx.total)}
            </p>
          </div>

          <div className={`text-xs space-y-0.5 mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {tx.items.slice(0, 3).map((item, idx) => (
              <p key={idx}>
                {item.jumlah}x {item.namaBarang}
              </p>
            ))}
            {tx.items.length > 3 && (
              <p className="italic">+{tx.items.length - 3} item lainnya</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              tx.metodePembayaran === "tunai"
                ? isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"
                : isDark ? "bg-purple-900/30 text-purple-400" : "bg-purple-50 text-purple-600"
            }`}>
              {tx.metodePembayaran === "tunai" ? "💵 Tunai" : "💳 Non Tunai"}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onViewReceipt(tx)}
                className={`p-1.5 rounded-lg ${isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-400 hover:bg-slate-100"}`}
                title="Lihat Struk"
              >
                <Receipt className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(tx.id)}
                className={`p-1.5 rounded-lg ${isDark ? "text-slate-500 hover:bg-slate-700 hover:text-red-400" : "text-slate-300 hover:bg-slate-100 hover:text-red-500"}`}
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
