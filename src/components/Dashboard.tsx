"use client";

import { useState, useMemo, useCallback } from "react";
import { Sun, Moon, Grid3X3, ListOrdered, BarChart3 } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useBarangStore } from "@/hooks/useBarangStore";
import { useCartStore } from "@/hooks/useCartStore";
import { useTransaksiStore } from "@/hooks/useTransaksiStore";
import { Barang, Kategori, SortOption, MetodePembayaran, Transaksi } from "@/lib/types";
import { exportCSV, generateId } from "@/lib/utils";
import StatCards from "./StatCards";
import Toolbar from "./Toolbar";
import DataTable from "./DataTable";
import BarangModal from "./BarangModal";
import ConfirmDialog from "./ConfirmDialog";
import BuatTransaksi from "./BuatTransaksi";
import Checkout from "./Checkout";
import Payment from "./Payment";
import Receipt from "./Receipt";
import TransaksiList from "./TransaksiList";
import Ringkasan from "./Ringkasan";

type AppView = "produk" | "transaksi" | "ringkasan";
type SubView = "list" | "buat" | "checkout" | "payment" | "receipt";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const store = useBarangStore();
  const cartStore = useCartStore();
  const transaksiStore = useTransaksiStore();

  // Navigation
  const [activeView, setActiveView] = useState<AppView>("produk");
  const [subView, setSubView] = useState<SubView>("list");

  // Product page state
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<Kategori | "Semua">("Semua");
  const [sortOption, setSortOption] = useState<SortOption>("subtotal-desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Barang | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Checkout / payment state
  const [checkoutCustomerName, setCheckoutCustomerName] = useState("");
  const [completedTransaksi, setCompletedTransaksi] = useState<Transaksi | null>(null);

  // Ringkasan date range
  const [ringkasanStartDate, setRingkasanStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  });
  const [ringkasanEndDate, setRingkasanEndDate] = useState(() => new Date());

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

  // Cart / Checkout flow
  const handleStartTransaksi = useCallback(() => {
    cartStore.clearCart();
    setActiveView("transaksi");
    setSubView("buat");
  }, [cartStore]);

  const handleProceedToCheckout = useCallback(() => {
    if (cartStore.cart.length === 0) return;
    setSubView("checkout");
  }, [cartStore.cart.length]);

  const handleProceedToPayment = useCallback((customerName: string) => {
    setCheckoutCustomerName(customerName);
    setSubView("payment");
  }, []);

  const handlePaymentComplete = useCallback((metode: MetodePembayaran, cashDibayar: number) => {
    const now = new Date();
    const transaksi: Transaksi = {
      id: generateId(),
      tanggal: now.toISOString().slice(0, 10),
      waktu: now.toTimeString().slice(0, 5),
      namaCustomer: checkoutCustomerName,
      items: cartStore.cart.map((c) => ({
        namaBarang: c.barang.nama,
        gambar: c.barang.gambar,
        jumlah: c.jumlah,
        hargaSatuan: c.barang.hargaSatuan,
        hargaJual: c.barang.hargaJual,
        subtotal: c.jumlah * c.barang.hargaJual,
      })),
      subtotal: cartStore.subtotal,
      total: cartStore.subtotal,
      keuntungan: cartStore.totalKeuntungan,
      metodePembayaran: metode,
      cashDibayar: cashDibayar,
      kembalian: Math.max(0, cashDibayar - cartStore.subtotal),
      kasir: "admin",
    };

    // Deduct stock
    cartStore.cart.forEach((c) => {
      store.updateBarang(c.barang.id, { qty: c.barang.qty - c.jumlah });
    });

    transaksiStore.addTransaksi(transaksi);
    setCompletedTransaksi(transaksi);
    cartStore.clearCart();
    setSubView("receipt");
  }, [checkoutCustomerName, cartStore, store, transaksiStore]);

  const handleReceiptDone = useCallback(() => {
    setCompletedTransaksi(null);
    setSubView("list");
    setActiveView("transaksi");
  }, []);

  const handleViewReceipt = useCallback((tx: Transaksi) => {
    setCompletedTransaksi(tx);
    setSubView("receipt");
  }, []);

  // Ringkasan stats
  const ringkasanStats = useMemo(
    () => transaksiStore.getStatsForRange(ringkasanStartDate, ringkasanEndDate),
    [transaksiStore, ringkasanStartDate, ringkasanEndDate]
  );

  if (!store.isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Full-screen POS / checkout flow
  if (subView === "buat") {
    return (
      <BuatTransaksi
        products={store.data}
        cart={cartStore.cart}
        totalItems={cartStore.totalItems}
        onSetQuantity={cartStore.setQuantity}
        onBack={() => {
          cartStore.clearCart();
          setSubView("list");
          setActiveView("transaksi");
        }}
        onOpenCart={handleProceedToCheckout}
      />
    );
  }

  if (subView === "checkout") {
    return (
      <Checkout
        cart={cartStore.cart}
        subtotal={cartStore.subtotal}
        totalItems={cartStore.totalItems}
        onUpdateQuantity={cartStore.updateQuantity}
        onRemoveFromCart={cartStore.removeFromCart}
        onBack={() => setSubView("buat")}
        onProceedPayment={handleProceedToPayment}
      />
    );
  }

  if (subView === "payment") {
    return (
      <Payment
        total={cartStore.subtotal}
        onBack={() => setSubView("checkout")}
        onComplete={handlePaymentComplete}
      />
    );
  }

  if (subView === "receipt" && completedTransaksi) {
    return (
      <Receipt
        transaksi={completedTransaksi}
        onDone={handleReceiptDone}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors pb-20 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {activeView === "produk" ? "Produk" : activeView === "transaksi" ? "Transaksi" : "Ringkasan"}
            </h1>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {activeView === "produk" ? "Kelola Stok Barang" : activeView === "transaksi" ? "Riwayat Transaksi" : "Laporan Penjualan"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark
                ? "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                : "bg-white border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"
                }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* === PRODUK VIEW === */}
        {activeView === "produk" && (
          <>
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
              <DataTable
                data={filteredData}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            </section>
          </>
        )}

        {/* === TRANSAKSI VIEW === */}
        {activeView === "transaksi" && (
          <TransaksiList
            transaksiList={transaksiStore.transaksiList}
            onDelete={transaksiStore.deleteTransaksi}
            onViewReceipt={handleViewReceipt}
            onAddTransaksi={handleStartTransaksi}
          />
        )}

        {/* === RINGKASAN VIEW === */}
        {activeView === "ringkasan" && (
          <Ringkasan
            totalTransaksi={ringkasanStats.totalTransaksi}
            totalPenjualanKotor={ringkasanStats.totalPenjualanKotor}
            totalPenjualanBersih={ringkasanStats.totalPenjualanBersih}
            totalKeuntungan={ringkasanStats.totalKeuntungan}
            cashTotal={ringkasanStats.cashTotal}
            nonCashTotal={ringkasanStats.nonCashTotal}
            dailyData={ringkasanStats.dailyData}
            startDate={ringkasanStartDate}
            endDate={ringkasanEndDate}
            onDateRangeChange={(s, e) => { setRingkasanStartDate(s); setRingkasanEndDate(e); }}
          />
        )}

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className={`text-[11px] ${isDark ? "text-slate-700" : "text-slate-300"}`}>
            © 2026 Dewanda Dashboard
          </p>
        </footer>
      </div>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 border-t ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="max-w-5xl mx-auto flex">
          <button
            onClick={() => { setActiveView("produk"); setSubView("list"); }}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${activeView === "produk"
                ? isDark ? "text-blue-400" : "text-[#2d3a8c]"
                : isDark ? "text-slate-500" : "text-slate-400"
              }`}
          >
            <Grid3X3 className="w-5 h-5" />
            Produk
          </button>
          <button
            onClick={() => { setActiveView("transaksi"); setSubView("list"); }}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${activeView === "transaksi"
                ? isDark ? "text-blue-400" : "text-[#2d3a8c]"
                : isDark ? "text-slate-500" : "text-slate-400"
              }`}
          >
            <ListOrdered className="w-5 h-5" />
            Transaksi
          </button>
          <button
            onClick={() => { setActiveView("ringkasan"); setSubView("list"); }}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${activeView === "ringkasan"
                ? isDark ? "text-blue-400" : "text-[#2d3a8c]"
                : isDark ? "text-slate-500" : "text-slate-400"
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            Ringkasan
          </button>
        </div>
      </nav>

      {/* Modals */}
      <BarangModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editItem={editItem} />
      <ConfirmDialog isOpen={deleteId !== null} title="Hapus Barang?" message="Data akan dihapus permanen." onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog isOpen={confirmReset} title="Reset Data?" message="Semua perubahan akan hilang." onConfirm={handleResetConfirm} onCancel={() => setConfirmReset(false)} />
    </div>
  );
}
