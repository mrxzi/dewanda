"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Transaksi } from "@/lib/types";

const STORAGE_KEY = "dewanda-transaksi";

export function useTransaksiStore() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTransaksiList(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = useCallback((data: Transaksi[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }, 300);
  }, []);

  const addTransaksi = useCallback(
    (transaksi: Transaksi) => {
      setTransaksiList((prev) => {
        const updated = [transaksi, ...prev];
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const deleteTransaksi = useCallback(
    (id: string) => {
      setTransaksiList((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const clearAllTransaksi = useCallback(() => {
    setTransaksiList([]);
    saveToStorage([]);
  }, [saveToStorage]);

  // Computed stats
  const getStatsForRange = useCallback(
    (startDate: Date, endDate: Date) => {
      const filtered = transaksiList.filter((t) => {
        const d = new Date(t.tanggal);
        return d >= startDate && d <= endDate;
      });

      const totalTransaksi = filtered.length;
      const totalPenjualanKotor = filtered.reduce((sum, t) => sum + t.total, 0);
      const totalKeuntungan = filtered.reduce((sum, t) => sum + t.keuntungan, 0);
      const totalPenjualanBersih = totalPenjualanKotor - totalKeuntungan;

      // Payment method breakdown
      const cashTotal = filtered
        .filter((t) => t.metodePembayaran === "tunai")
        .reduce((sum, t) => sum + t.total, 0);
      const nonCashTotal = filtered
        .filter((t) => t.metodePembayaran === "non-tunai")
        .reduce((sum, t) => sum + t.total, 0);

      // Daily data for charts
      const dailyData: { date: string; transaksi: number; penjualan: number; keuntungan: number }[] = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().slice(0, 10);
        const dayTx = filtered.filter((t) => t.tanggal === dateStr);
        dailyData.push({
          date: dateStr,
          transaksi: dayTx.length,
          penjualan: dayTx.reduce((s, t) => s + t.total, 0),
          keuntungan: dayTx.reduce((s, t) => s + t.keuntungan, 0),
        });
        current.setDate(current.getDate() + 1);
      }

      return {
        totalTransaksi,
        totalPenjualanKotor,
        totalPenjualanBersih,
        totalKeuntungan,
        cashTotal,
        nonCashTotal,
        dailyData,
        filteredTransaksi: filtered,
      };
    },
    [transaksiList]
  );

  return {
    transaksiList,
    isLoaded,
    addTransaksi,
    deleteTransaksi,
    clearAllTransaksi,
    getStatsForRange,
  };
}
