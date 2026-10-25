"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import { Barang, Kategori, KATEGORI_LIST } from "@/lib/types";
import { formatRupiah, generateId } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface BarangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (barang: Barang) => void;
  editItem?: Barang | null;
}

export default function BarangModal({
  isOpen,
  onClose,
  onSave,
  editItem,
}: BarangModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<Kategori>("Jajanan/Snack");
  const [qty, setQty] = useState("");
  const [hargaSatuan, setHargaSatuan] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [catatan, setCatatan] = useState("");
  const [gambar, setGambar] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setNama(editItem.nama);
      setKategori(editItem.kategori);
      setQty(editItem.qty.toString());
      setHargaSatuan(editItem.hargaSatuan.toString());
      setHargaJual((editItem.hargaJual || editItem.hargaSatuan).toString());
      setCatatan(editItem.catatan);
      setGambar(editItem.gambar);
    } else {
      setNama("");
      setKategori("Jajanan/Snack");
      setQty("");
      setHargaSatuan("");
      setHargaJual("");
      setCatatan("");
      setGambar(undefined);
    }
    setErrors({});
  }, [editItem, isOpen]);

  const subtotal = useMemo(() => {
    return (parseInt(qty) || 0) * (parseInt(hargaSatuan) || 0);
  }, [qty, hargaSatuan]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!nama.trim()) e.nama = "Wajib diisi";
    if (!qty || parseInt(qty) <= 0) e.qty = "Harus > 0";
    if (!hargaSatuan || parseInt(hargaSatuan) < 0) e.hargaSatuan = "Tidak valid";
    if (!hargaJual || parseInt(hargaJual) < 0) e.hargaJual = "Tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setErrors((prev) => ({ ...prev, gambar: "Maks 500KB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGambar(reader.result as string);
        setErrors((prev) => {
          const { gambar: _, ...rest } = prev;
          void _;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: editItem?.id || generateId(),
      nama: nama.trim(),
      kategori,
      qty: parseInt(qty),
      hargaSatuan: parseInt(hargaSatuan),
      hargaJual: parseInt(hargaJual),
      catatan: catatan.trim(),
      tanggal: editItem?.tanggal || new Date().toISOString().slice(0, 10),
      gambar,
    });
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-colors ${
    isDark
      ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
  }`;

  const labelClass = `block text-[11px] font-medium uppercase tracking-wider mb-1.5 ${
    isDark ? "text-slate-400" : "text-slate-500"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className={`relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl border p-5 ${
          isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center mb-3">
          <div className={`w-10 h-1 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            {editItem ? "Edit Barang" : "Tambah Barang"}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gambar Produk */}
          <div>
            <label className={labelClass}>Gambar Produk</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {gambar ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                <img src={gambar} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setGambar(undefined)}
                  className="absolute top-0.5 right-0.5 p-1 bg-red-500 rounded-full text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed text-sm transition-colors ${
                  isDark
                    ? "border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400"
                    : "border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                <ImagePlus className="w-5 h-5" />
                <span>Pilih Gambar</span>
              </button>
            )}
            {errors.gambar && <p className="text-red-400 text-xs mt-1">{errors.gambar}</p>}
          </div>

          <div>
            <label className={labelClass}>Nama Barang</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama barang..." className={inputClass} />
            {errors.nama && <p className="text-red-400 text-xs mt-1">{errors.nama}</p>}
          </div>

          <div>
            <label className={labelClass}>Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value as Kategori)} className={inputClass}>
              {KATEGORI_LIST.map((k) => (<option key={k} value={k}>{k}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Stok (Dus)</label>
              <input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className={inputClass} />
              {errors.qty && <p className="text-red-400 text-xs mt-1">{errors.qty}</p>}
            </div>
            <div>
              <label className={labelClass}>Beli / Dus</label>
              <input type="number" min="0" value={hargaSatuan} onChange={(e) => setHargaSatuan(e.target.value)} placeholder="0" className={inputClass} />
              {errors.hargaSatuan && <p className="text-red-400 text-xs mt-1">{errors.hargaSatuan}</p>}
            </div>
            <div>
              <label className={labelClass}>Jual / Dus</label>
              <input type="number" min="0" value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} placeholder="0" className={inputClass} />
              {errors.hargaJual && <p className="text-red-400 text-xs mt-1">{errors.hargaJual}</p>}
            </div>
          </div>

          {/* Live subtotal */}
          <div className={`rounded-lg px-3 py-2.5 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
            <span className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Subtotal:{" "}
            </span>
            <span className={`text-sm font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              {formatRupiah(subtotal)}
            </span>
          </div>

          <div>
            <label className={labelClass}>Catatan</label>
            <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Opsional..." rows={2} className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              {editItem ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
