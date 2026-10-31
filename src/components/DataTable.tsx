"use client";

import { Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Barang } from "@/lib/types";
import { formatRupiah, getSubtotal } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";

interface DataTableProps {
  data: Barang[];
  onEdit: (item: Barang) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function DataTable({ data, onEdit, onDelete }: DataTableProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const badgeClass = isDark
    ? "bg-slate-700 text-slate-300"
    : "bg-slate-100 text-slate-600";

  if (data.length === 0) {
    return (
      <div
        className={`rounded-xl border p-12 text-center ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <p className="text-3xl mb-2">📦</p>
        <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Tidak ada data ditemukan
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={`text-[11px] font-medium uppercase tracking-wider ${
                isDark
                  ? "bg-slate-800 text-slate-500 border-b border-slate-700"
                  : "bg-slate-50 text-slate-400 border-b border-slate-200"
              }`}
            >
              <th className="py-3 px-4 text-left w-10">No</th>
              <th className="py-3 px-4 text-left">Produk</th>
              <th className="py-3 px-4 text-left">Kategori</th>
              <th className="py-3 px-4 text-right">Dus</th>
              <th className="py-3 px-4 text-right">Beli / Dus</th>
              <th className="py-3 px-4 text-right">Jual / Dus</th>
              <th className="py-3 px-4 text-right">Subtotal</th>
              <th className="py-3 px-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className={`transition-colors ${
                  isDark
                    ? "border-b border-slate-700/50 hover:bg-slate-750 hover:bg-slate-700/40"
                    : "border-b border-slate-100 hover:bg-slate-50"
                }`}
              >
                <td
                  className={`py-3 px-4 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {startIdx + index + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    {/* Product image */}
                    <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                      {item.gambar ? (
                        <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                      )}
                    </div>
                    <div>
                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                        {item.nama}
                      </span>
                      {item.catatan && (
                        <p className={`text-[10px] truncate max-w-[120px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {item.catatan}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${badgeClass}`}
                  >
                    {item.kategori}
                  </span>
                </td>
                <td
                  className={`py-3 px-4 text-right font-medium ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {item.qty} dus
                </td>
                <td
                  className={`py-3 px-4 text-right ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {formatRupiah(item.hargaSatuan)}
                </td>
                <td
                  className={`py-3 px-4 text-right ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {formatRupiah(item.hargaJual)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-semibold ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {formatRupiah(getSubtotal(item))}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      onClick={() => onEdit(item)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDark
                          ? "hover:bg-slate-700 text-slate-400"
                          : "hover:bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDark
                          ? "hover:bg-slate-700 text-slate-500 hover:text-red-400"
                          : "hover:bg-slate-100 text-slate-400 hover:text-red-500"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
        {paginatedData.map((item, index) => (
          <div
            key={item.id}
            className="px-4 py-3.5"
          >
            {/* Row 1: Image + Name + Actions */}
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                {item.gambar ? (
                  <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                  {item.nama}
                </p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-0.5 ${badgeClass}`}>
                  {item.kategori}
                </span>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  className={`p-2 rounded-lg ${isDark ? "text-slate-400 active:bg-slate-700" : "text-slate-400 active:bg-slate-100"}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`p-2 rounded-lg ${isDark ? "text-slate-500 active:bg-slate-700" : "text-slate-400 active:bg-slate-100"}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Stok + Harga Beli + Harga Jual + Subtotal */}
            <div className={`grid grid-cols-4 gap-1 text-center rounded-xl px-2 py-2.5 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
              <div>
                <p className={`text-[9px] font-medium uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>Stok</p>
                <p className={`text-[12px] font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>{item.qty}</p>
                <p className={`text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>dus</p>
              </div>
              <div>
                <p className={`text-[9px] font-medium uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>Beli</p>
                <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{formatRupiah(item.hargaSatuan)}</p>
              </div>
              <div>
                <p className={`text-[9px] font-medium uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>Jual</p>
                <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? "text-green-400" : "text-green-600"}`}>{formatRupiah(item.hargaJual)}</p>
              </div>
              <div>
                <p className={`text-[9px] font-medium uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>Total</p>
                <p className={`text-[11px] font-bold mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>{formatRupiah(getSubtotal(item))}</p>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-t text-xs ${
            isDark
              ? "border-slate-700 text-slate-500"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <span>
            {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, data.length)}{" "}
            dari {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded text-xs font-medium ${
                  currentPage === pg
                    ? "bg-blue-500 text-white"
                    : isDark
                    ? "hover:bg-slate-700"
                    : "hover:bg-slate-100"
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
