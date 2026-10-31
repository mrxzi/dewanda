"use client";

import { Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Barang } from "@/lib/types";
import { formatRupiah, getSubtotal } from "@/lib/utils";
import { useState, useEffect } from "react";

interface DataTableProps {
  data: Barang[];
  onEdit: (item: Barang) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function DataTable({ data, onEdit, onDelete }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center bg-white border-slate-200">
        <p className="text-3xl mb-2">📦</p>
        <p className="text-sm text-slate-400">Tidak ada data ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden bg-white border-slate-200 shadow-sm">

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-medium uppercase tracking-wider bg-slate-50 text-slate-400 border-b border-slate-200">
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
            {paginatedData.map((item, index) => {
              const habis = item.qty <= 0;
              return (
                <tr
                  key={item.id}
                  className={`transition-colors border-b border-slate-100 hover:bg-slate-50 ${habis ? "opacity-40 grayscale" : ""}`}
                >
                  <td className="py-3 px-4 text-slate-400">{startIdx + index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                        {item.gambar ? (
                          <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">{item.nama}</span>
                        {habis && <p className="text-[10px] text-red-500 font-semibold">Stok Habis</p>}
                        {item.catatan && !habis && (
                          <p className="text-[10px] truncate max-w-[120px] text-slate-400">{item.catatan}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">{item.qty} dus</td>
                  <td className="py-3 px-4 text-right text-slate-500">{formatRupiah(item.hargaSatuan)}</td>
                  <td className="py-3 px-4 text-right text-green-600">{formatRupiah(item.hargaJual)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-blue-600">{formatRupiah(getSubtotal(item))}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-md transition-colors hover:bg-slate-100 text-slate-400"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-md transition-colors hover:bg-slate-100 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden divide-y divide-slate-100">
        {paginatedData.map((item) => {
          const habis = item.qty <= 0;
          return (
            <div
              key={item.id}
              className={`px-4 py-4 transition-opacity ${habis ? "opacity-40 grayscale" : ""}`}
            >
              {/* Row 1: Image + Name + Actions */}
              <div className="flex items-center gap-3 mb-3">
                {/* Gambar lebih besar */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                  {item.gambar ? (
                    <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                  {habis && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white uppercase tracking-wide">Habis</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{item.nama}</p>
                  {item.catatan && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.catatan}</p>
                  )}
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 bg-[#2d3a8c]/10 text-[#2d3a8c]">
                    {item.kategori}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2.5 rounded-xl text-slate-400 active:bg-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2.5 rounded-xl text-slate-400 active:bg-slate-100 active:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Total Dus + Sisa Stok (only 2 columns) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center rounded-2xl py-3 bg-[#2d3a8c]">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">Total Dus</p>
                  <p className="text-xl font-extrabold text-white tabular-nums">{item.qty}</p>
                  <p className="text-[9px] text-white/60 mt-0.5">dus</p>
                </div>
                <div className={`flex flex-col items-center justify-center rounded-2xl py-3 ${habis ? "bg-red-50" : "bg-slate-50"}`}>
                  <p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${habis ? "text-red-400" : "text-slate-400"}`}>Sisa Stok</p>
                  {habis ? (
                    <p className="text-sm font-extrabold text-red-500">HABIS</p>
                  ) : (
                    <>
                      <p className="text-xl font-extrabold text-slate-800 tabular-nums">{item.qty}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">tersedia</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 text-xs text-slate-400">
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
                    ? "bg-[#2d3a8c] text-white"
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
