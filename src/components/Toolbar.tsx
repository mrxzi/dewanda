"use client";

import { Search, Plus, Download, RotateCcw } from "lucide-react";
import { Kategori, KATEGORI_LIST, SortOption } from "@/lib/types";
import { useTheme } from "./ThemeProvider";

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  kategoriFilter: Kategori | "Semua";
  onKategoriChange: (v: Kategori | "Semua") => void;
  sortOption: SortOption;
  onSortChange: (v: SortOption) => void;
  onAdd: () => void;
  onExport: () => void;
  onReset: () => void;
  totalItems: number;
}

export default function Toolbar({
  search,
  onSearchChange,
  kategoriFilter,
  onKategoriChange,
  sortOption,
  onSortChange,
  onAdd,
  onExport,
  onReset,
  totalItems,
}: ToolbarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const inputBase = `rounded-lg text-sm outline-none transition-colors ${
    isDark
      ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
  } border`;

  const btnSecondary = `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isDark
      ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
  }`;

  return (
    <div className="space-y-3">
      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari barang..."
            className={`w-full pl-9 pr-3 py-2 ${inputBase}`}
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kategoriFilter}
          onChange={(e) =>
            onKategoriChange(e.target.value as Kategori | "Semua")
          }
          className={`${inputBase} px-3 py-2 pr-8 appearance-none cursor-pointer`}
        >
          <option value="Semua">Semua Kategori</option>
          {KATEGORI_LIST.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className={`${inputBase} px-3 py-2 pr-8 appearance-none cursor-pointer`}
        >
          <option value="subtotal-desc">Subtotal ↓</option>
          <option value="subtotal-asc">Subtotal ↑</option>
          <option value="nama-asc">Nama A–Z</option>
          <option value="nama-desc">Nama Z–A</option>
          <option value="qty-desc">Dus Terbanyak</option>
        </select>

        <div className="flex gap-1.5 ml-auto">
          <button onClick={onExport} className={btnSecondary} title="Export CSV">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button onClick={onReset} className={btnSecondary} title="Reset Data">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <p
        className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
      >
        {totalItems} barang
      </p>
    </div>
  );
}
