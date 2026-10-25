"use client";

import { useRef, useState } from "react";
import { CheckCircle, Share2, Download, Printer, Loader2 } from "lucide-react";
import { Transaksi } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { printReceiptBluetooth } from "@/lib/bluetooth-print";
import { useTheme } from "./ThemeProvider";

interface ReceiptProps {
  transaksi: Transaksi;
  onDone: () => void;
}

export default function Receipt({ transaksi, onDone }: ReceiptProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const receiptRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    setPrintError(null);

    const result = await printReceiptBluetooth(transaksi);

    setPrinting(false);
    if (!result.ok) {
      setPrintError(result.error);
    }
  };

  const handleDownload = () => {
    // Create a text receipt and download it
    const lines = [
      "================================",
      "         DEWANDA",
      "================================",
      "",
      `ID     : ${transaksi.id}`,
      `Waktu  : ${transaksi.tanggal} ${transaksi.waktu}`,
      `Nama   : ${transaksi.namaCustomer || "-"}`,
      `Kasir  : ${transaksi.kasir}`,
      "--------------------------------",
      ...transaksi.items.flatMap(item => [
        item.namaBarang,
        `${item.jumlah}x ${new Intl.NumberFormat("id-ID").format(item.hargaJual)}          ${new Intl.NumberFormat("id-ID").format(item.subtotal)}`,
      ]),
      "--------------------------------",
      `Sub Total    Rp ${new Intl.NumberFormat("id-ID").format(transaksi.subtotal)}`,
      "--------------------------------",
      `Total        Rp ${new Intl.NumberFormat("id-ID").format(transaksi.total)}`,
      `Cash         Rp ${new Intl.NumberFormat("id-ID").format(transaksi.cashDibayar)}`,
      ...(transaksi.kembalian > 0 ? [`Kembali      Rp ${new Intl.NumberFormat("id-ID").format(transaksi.kembalian)}`] : []),
      "--------------------------------",
      "",
      "        Terima Kasih!",
      "    Powered by NUSAJAYA",
      "================================",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `struk-${transaksi.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Struk ${transaksi.id}`,
          text: `Transaksi ${formatRupiah(transaksi.total)} - ${transaksi.tanggal}`,
        });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 ${isDark ? "bg-slate-800 border-b border-slate-700" : "bg-[#2d3a8c] text-white"}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">Transaksi</h1>
        </div>
      </header>

      {/* Success animation */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-green-500 font-semibold text-base mt-3">Transaksi Berhasil</h2>
        <p className={`text-xl font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          {formatRupiah(transaksi.total)}
        </p>
      </div>

      {/* Receipt Card */}
      <div className="px-4 flex-1 pb-32">
        <div
          ref={receiptRef}
          className={`rounded-xl border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          {/* Zigzag top */}
          <div className={`h-3 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
            style={{
              maskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10'%3E%3Cpolygon points='0,10 10,0 20,10'/%3E%3C/svg%3E\")",
              maskSize: "20px 10px",
              maskRepeat: "repeat-x",
              WebkitMaskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10'%3E%3Cpolygon points='0,10 10,0 20,10'/%3E%3C/svg%3E\")",
              WebkitMaskSize: "20px 10px",
              WebkitMaskRepeat: "repeat-x",
            }}
          />

          <div className="px-5 py-4">
            {/* Store name */}
            <h3 className={`text-center text-lg font-bold tracking-wider mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              TERIMA KASIH
            </h3>

            {/* Transaction details */}
            <div className={`border-t border-dashed py-3 space-y-1 text-xs ${isDark ? "border-slate-600 text-slate-400" : "border-slate-300 text-slate-500"}`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              <div className="flex justify-between"><span>ID</span><span>{transaksi.id}</span></div>
              <div className="flex justify-between"><span>Waktu</span><span>{transaksi.tanggal} {transaksi.waktu}</span></div>
              <div className="flex justify-between"><span>Nama</span><span>{transaksi.namaCustomer || "-"}</span></div>
              <div className="flex justify-between"><span>Kasir</span><span>{transaksi.kasir}</span></div>
            </div>

            {/* Items */}
            <div className={`border-t border-dashed py-3 space-y-2 ${isDark ? "border-slate-600" : "border-slate-300"}`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {transaksi.items.map((item, idx) => (
                <div key={idx}>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    {item.namaBarang}
                  </p>
                  <div className={`flex justify-between text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span>{item.jumlah}x {new Intl.NumberFormat("id-ID").format(item.hargaJual)}</span>
                    <span>{new Intl.NumberFormat("id-ID").format(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className={`border-t border-dashed py-2 space-y-1 text-xs ${isDark ? "border-slate-600 text-slate-400" : "border-slate-300 text-slate-500"}`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>{formatRupiah(transaksi.subtotal)}</span>
              </div>
            </div>

            <div className={`border-t border-dashed py-2 space-y-1 text-xs ${isDark ? "border-slate-600" : "border-slate-300"}`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              <div className={`flex justify-between font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                <span>Total</span>
                <span>{formatRupiah(transaksi.total)}</span>
              </div>
              <div className={`flex justify-between ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>Cash</span>
                <span>{formatRupiah(transaksi.cashDibayar)}</span>
              </div>
              {transaksi.kembalian > 0 && (
                <div className={`flex justify-between ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span>Kembali</span>
                  <span>{formatRupiah(transaksi.kembalian)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`border-t border-dashed pt-3 text-center ${isDark ? "border-slate-600" : "border-slate-300"}`}>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Powered By</p>
              <p className={`text-[10px] mt-2 ${isDark ? "text-slate-600" : "text-slate-300"}`}>
                <span className="font-bold text-blue-500">NUSAJAYA</span>
              </p>
            </div>
          </div>

          {/* Zigzag bottom */}
          <div className={`h-3 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
            style={{
              maskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10'%3E%3Cpolygon points='0,0 10,10 20,0'/%3E%3C/svg%3E\")",
              maskSize: "20px 10px",
              maskRepeat: "repeat-x",
              WebkitMaskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10'%3E%3Cpolygon points='0,0 10,10 20,0'/%3E%3C/svg%3E\")",
              WebkitMaskSize: "20px 10px",
              WebkitMaskRepeat: "repeat-x",
            }}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`fixed bottom-0 left-0 right-0 border-t px-4 py-3 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        {printError && (
          <p className="mb-2 text-xs text-red-500 text-center">{printError}</p>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`p-3 rounded-xl border ${isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className={`p-3 rounded-xl border ${isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            title="Cetak ke RPP02N"
            className={`p-3 rounded-xl border ${isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"} disabled:opacity-50`}
          >
            {printing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Printer className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDone}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            Selesai
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
