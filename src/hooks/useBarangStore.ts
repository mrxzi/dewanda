"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Barang, Kategori, SortOption } from "@/lib/types";
import { INITIAL_DATA } from "@/lib/data";
import { generateId, getSubtotal } from "@/lib/utils";

export function useBarangStore() {
  const [data, setData] = useState<Barang[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data from API on mount
  useEffect(() => {
    fetch("/api/barang")
      .then((res) => res.json())
      .then((items: Barang[]) => {
        setData(items);
        setIsLoaded(true);
      })
      .catch(() => {
        // Fallback to localStorage if API fails (local dev without Redis)
        try {
          const stored = localStorage.getItem("dewanda-dashboard-data");
          if (stored) {
            setData(JSON.parse(stored));
          } else {
            setData(INITIAL_DATA);
          }
        } catch {
          setData(INITIAL_DATA);
        }
        setIsLoaded(true);
      });
  }, []);

  // Save to API (debounced) whenever data changes
  const saveToServer = useCallback((newData: Barang[]) => {
    // Also save to localStorage as cache
    try {
      localStorage.setItem("dewanda-dashboard-data", JSON.stringify(newData));
    } catch {
      // ignore
    }

    // Debounce server save
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).catch(() => {
        // Silent fail — localStorage is still the fallback
      });
    }, 500);
  }, []);

  const addBarang = useCallback(
    (item: Omit<Barang, "id" | "tanggal">) => {
      const newItem: Barang = {
        ...item,
        id: generateId(),
        tanggal: new Date().toISOString().slice(0, 10),
      };
      setData((prev) => {
        const updated = [newItem, ...prev];
        saveToServer(updated);
        return updated;
      });
    },
    [saveToServer]
  );

  const updateBarang = useCallback(
    (id: string, updates: Partial<Omit<Barang, "id">>) => {
      setData((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
        saveToServer(updated);
        return updated;
      });
    },
    [saveToServer]
  );

  const deleteBarang = useCallback(
    (id: string) => {
      setData((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveToServer(updated);
        return updated;
      });
    },
    [saveToServer]
  );

  const resetData = useCallback(() => {
    setData(INITIAL_DATA);
    saveToServer(INITIAL_DATA);
  }, [saveToServer]);

  // Stats
  const totalNilai = data.reduce((sum, item) => sum + getSubtotal(item), 0);
  const totalJenis = data.length;
  const totalQty = data.reduce((sum, item) => sum + item.qty, 0);

  // Filtered & sorted
  const getFilteredData = useCallback(
    (search: string, kategori: Kategori | "Semua", sort: SortOption): Barang[] => {
      let filtered = [...data];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.nama.toLowerCase().includes(q) ||
            item.catatan.toLowerCase().includes(q)
        );
      }

      if (kategori !== "Semua") {
        filtered = filtered.filter((item) => item.kategori === kategori);
      }

      switch (sort) {
        case "subtotal-desc":
          filtered.sort((a, b) => getSubtotal(b) - getSubtotal(a));
          break;
        case "subtotal-asc":
          filtered.sort((a, b) => getSubtotal(a) - getSubtotal(b));
          break;
        case "nama-asc":
          filtered.sort((a, b) => a.nama.localeCompare(b.nama));
          break;
        case "nama-desc":
          filtered.sort((a, b) => b.nama.localeCompare(a.nama));
          break;
        case "qty-desc":
          filtered.sort((a, b) => b.qty - a.qty);
          break;
      }

      return filtered;
    },
    [data]
  );

  return {
    data,
    isLoaded,
    totalNilai,
    totalJenis,
    totalQty,
    addBarang,
    updateBarang,
    deleteBarang,
    resetData,
    getFilteredData,
  };
}
