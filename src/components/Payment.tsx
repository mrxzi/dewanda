"use client";

import { useState } from "react";
import { ArrowLeft, Send, CreditCard } from "lucide-react";
import { MetodePembayaran } from "@/lib/types";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface PaymentProps {
  total: number;
  onBack: () => void;
  onComplete: (metode: MetodePembayaran, cashDibayar: number) => void;
}

export default function Payment({ total, onBack, onComplete }: PaymentProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [metode, setMetode] = useState<MetodePembayaran>("tunai");
  const [cashInput, setCashInput] = useState(total.toString());

  const cashAmount = parseInt(cashInput) || 0;
  const kembalian = Math.max(0, cashAmount - total);

  // Suggested amounts (rounded up)
  const suggestions = [
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, arr) => v >= total && arr.indexOf(v) === i).slice(0, 3);

  const canPay = metode === "non-tunai" || cashAmount >= total;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 ${isDark ? "bg-slate-800 border-b border-slate-700" : "bg-[#2d3a8c] text-white"}`}>
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">Pilih Pembayaran</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-36">
        {/* Payment method toggle */}
        <div className={`flex gap-2 p-1.5 rounded-xl ${isDark ? "bg-slate-800" : "bg-white"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <button
            onClick={() => setMetode("tunai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              metode === "tunai"
                ? "bg-[#2d3a8c] text-white shadow-md"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Send className="w-4 h-4" />
            Tunai
          </button>
          <button
            onClick={() => setMetode("non-tunai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              metode === "non-tunai"
                ? "bg-[#2d3a8c] text-white shadow-md"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Non Tunai
          </button>
        </div>

        {/* Payment details */}
        <div className={`rounded-xl border p-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Hitung Pembayaran
          </h3>

          {/* Grand Total */}
          <div className={`flex justify-between items-center pb-3 mb-3 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Grand Total</span>
            <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{formatNumber(total)}</span>
          </div>

          {metode === "tunai" && (
            <>
              {/* Suggestion buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashInput(amt.toString())}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      cashInput === amt.toString()
                        ? "bg-blue-50 border-blue-300 text-blue-600"
                        : isDark
                        ? "border-slate-600 text-slate-400 hover:border-blue-500"
                        : "border-slate-300 text-slate-500 hover:border-blue-400"
                    }`}
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>

              {/* Cash input */}
              <div className={`flex justify-between items-center mb-3 pb-3 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cash</span>
                <input
                  type="number"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  className={`text-right text-sm font-medium w-36 px-3 py-2 rounded-lg border outline-none ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Change */}
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Kembali</span>
                <span className={`text-lg font-bold ${kembalian > 0 ? "text-green-500" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {formatNumber(kembalian)}
                </span>
              </div>
            </>
          )}

          {metode === "non-tunai" && (
            <div className={`text-center py-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Pembayaran non-tunai</p>
              <p className="text-xs mt-1">Total: {formatRupiah(total)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 border-t px-4 py-4 ${
          isDark ? "bg-slate-900 border-slate-700/70" : "bg-white border-slate-200"
        }`}
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Grand Total</p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {formatRupiah(total)}
          </p>
        </div>
        <button
          onClick={() => onComplete(metode, metode === "tunai" ? cashAmount : total)}
          disabled={!canPay}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold bg-[#2d3a8c] text-white hover:bg-[#252f73] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#2d3a8c]/30"
        >
          Bayar
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
