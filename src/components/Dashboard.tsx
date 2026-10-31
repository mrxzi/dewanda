"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Grid3X3, ListOrdered, BarChart3 } from "lucide-react";
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
  const [checkoutAlamat, setCheckoutAlamat] = useState("");
  const [completedTransaksi, setCompletedTransaksi] = useState<Transaksi | null>(null);

  // Ringkasan date range
  const [ringkasanStartDate, setRingkasanStartDate] = useState<Date | null>(null);
  const [ringkasanEndDate, setRingkasanEndDate] = useState<Date | null>(null);

  // Initialize dates on client only (avoids Next.js prerender error)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    setRingkasanStartDate(d);
    setRingkasanEndDate(new Date());
  }, []);

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

  const handleProceedToPayment = useCallback((customerName: string, alamat: string) => {
    setCheckoutCustomerName(customerName);
    setCheckoutAlamat(alamat);
    setSubView("payment");
  }, []);

  const handlePaymentComplete = useCallback((metode: MetodePembayaran, cashDibayar: number) => {
    const now = new Date();
    const transaksi: Transaksi = {
      id: generateId(),
      tanggal: now.toISOString().slice(0, 10),
      waktu: now.toTimeString().slice(0, 5),
      namaCustomer: checkoutCustomerName,
      alamat: checkoutAlamat || undefined,
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
  }, [checkoutCustomerName, checkoutAlamat, cartStore, store, transaksiStore]);

  const handleReceiptDone = useCallback(() => {
    setCompletedTransaksi(null);
    setSubView("list");
    setActiveView("transaksi");
  }, []);

  const handleViewReceipt = useCallback((tx: Transaksi) => {
    setCompletedTransaksi(tx);
    setSubView("receipt");
  }, []);

  // Ringkasan stats — handle null until dates are initialized on client
  const ringkasanStats = useMemo(
    () => {
      if (!ringkasanStartDate || !ringkasanEndDate) {
        return {
          totalTransaksi: 0,
          totalPenjualanKotor: 0,
          totalPenjualanBersih: 0,
          totalKeuntungan: 0,
          cashTotal: 0,
          nonCashTotal: 0,
          dailyData: [],
          filteredTransaksi: [],
        };
      }
      return transaksiStore.getStatsForRange(ringkasanStartDate, ringkasanEndDate);
    },
    [transaksiStore, ringkasanStartDate, ringkasanEndDate]
  );

  if (!store.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
    <div className="min-h-screen transition-colors pb-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8">
        {/* Header */}
        <header className="mb-6">
          {/* ── NAMA TOKO — ganti teks di bawah ini ── */}
          <h1 className="text-xl font-black uppercase tracking-wide text-slate-900 leading-tight">
          </h1>
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
        {activeView === "ringkasan" && ringkasanStartDate && ringkasanEndDate && (
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
          <p className="text-[11px] text-slate-300">
            © 2026 Dewanda Dashboard
          </p>
        </footer>
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white border-slate-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-5xl mx-auto flex">
          {(
            [
              { view: "produk" as AppView, icon: <Grid3X3 className="w-[22px] h-[22px]" />, label: "Produk" },
              { view: "transaksi" as AppView, icon: <ListOrdered className="w-[22px] h-[22px]" />, label: "Transaksi" },
              { view: "ringkasan" as AppView, icon: <BarChart3 className="w-[22px] h-[22px]" />, label: "Ringkasan" },
            ] as const
          ).map(({ view, icon, label }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                onClick={() => { setActiveView(view); setSubView("list"); }}
                className={`relative flex-1 flex flex-col items-center gap-1.5 py-4 text-xs font-semibold transition-all ${isActive
                  ? "text-[#2d3a8c]"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <span
                  className={`absolute top-0 left-5 right-5 h-[2.5px] rounded-full transition-all duration-300 ${isActive ? "bg-[#2d3a8c]" : "opacity-0"
                    }`}
                />
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <BarangModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editItem={editItem} />
      <ConfirmDialog isOpen={deleteId !== null} title="Hapus Barang?" message="Data akan dihapus permanen." onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog isOpen={confirmReset} title="Reset Data?" message="Semua perubahan akan hilang." onConfirm={handleResetConfirm} onCancel={() => setConfirmReset(false)} />
    </div>
  );
}
