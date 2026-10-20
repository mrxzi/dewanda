"use client";

import { useState, useMemo, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useBarangStore } from "@/hooks/useBarangStore";
import { Barang, Kategori, SortOption } from "@/lib/types";
import { exportCSV } from "@/lib/utils";
import StatCards from "./StatCards";
import Toolbar from "./Toolbar";
import DataTable from "./DataTable";
import BarangModal from "./BarangModal";
import ConfirmDialog from "./ConfirmDialog";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const store = useBarangStore();

  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<Kategori | "Semua">("Semua");
  const [sortOption, setSortOption] = useState<SortOption>("subtotal-desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Barang | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const filteredData = useMemo(
    () => store.getFilteredData(search, kategoriFilter, sortOption),
    [store, search, kategoriFilter, sortOption]
  );

  const handleAdd = useCallback(() => { setEditItem(null); setModalOpen(true); }, []);
  const handleEdit = useCallback((item: Barang) => { setEditItem(item); setModalOpen(true); }, []);

  const handleSave = useCallback((barang: Barang) => {
    if (editItem) { store.updateBarang(barang.id, barang); }
    else { store.addBarang(barang); }
  }, [editItem, store]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) { store.deleteBarang(deleteId); setDeleteId(null); }
  }, [deleteId, store]);

  const handleResetConfirm = useCallback(() => {
    store.resetData(); setConfirmReset(false);
  }, [store]);

  if (!store.isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Dashboard Dewanda
            </h1>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Stok Barang
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark
              ? "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              : "bg-white border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"
              }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Stats */}
        <section className="mb-5">
          <StatCards totalNilai={store.totalNilai} totalJenis={store.totalJenis} totalQty={store.totalQty} />
        </section>

        {/* Toolbar */}
        <section className="mb-4">
          <Toolbar
            search={search} onSearchChange={setSearch}
            kategoriFilter={kategoriFilter} onKategoriChange={setKategoriFilter}
            sortOption={sortOption} onSortChange={setSortOption}
            onAdd={handleAdd} onExport={() => exportCSV(store.data)}
            onReset={() => setConfirmReset(true)} totalItems={filteredData.length}
          />
        </section>

        {/* Table */}
        <section>
          <DataTable data={filteredData} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
        </section>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className={`text-[11px] ${isDark ? "text-slate-700" : "text-slate-300"}`}>
            © 2026 Dewanda Dashboard
          </p>
        </footer>
      </div>

      {/* Modals */}
      <BarangModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editItem={editItem} />
      <ConfirmDialog isOpen={deleteId !== null} title="Hapus Barang?" message="Data akan dihapus permanen." onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog isOpen={confirmReset} title="Reset Data?" message="Semua perubahan akan hilang." onConfirm={handleResetConfirm} onCancel={() => setConfirmReset(false)} />
    </div>
  );
}
