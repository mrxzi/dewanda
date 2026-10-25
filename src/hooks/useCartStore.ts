"use client";

import { useState, useCallback } from "react";
import { Barang, CartItem } from "@/lib/types";

export function useCartStore() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((barang: Barang) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.barang.id === barang.id);
      if (existing) {
        return prev.map((c) =>
          c.barang.id === barang.id
            ? { ...c, jumlah: Math.min(c.jumlah + 1, c.barang.qty) }
            : c
        );
      }
      return [...prev, { barang, jumlah: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((barangId: string) => {
    setCart((prev) => prev.filter((c) => c.barang.id !== barangId));
  }, []);

  const updateQuantity = useCallback((barangId: string, jumlah: number) => {
    if (jumlah <= 0) {
      setCart((prev) => prev.filter((c) => c.barang.id !== barangId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.barang.id === barangId
          ? { ...c, jumlah: Math.min(jumlah, c.barang.qty) }
          : c
      )
    );
  }, []);

  /** Set absolute cart qty for a product (0 removes). Uses latest barang snapshot. */
  const setQuantity = useCallback((barang: Barang, jumlah: number) => {
    if (jumlah <= 0) {
      setCart((prev) => prev.filter((c) => c.barang.id !== barang.id));
      return;
    }
    const capped = Math.min(jumlah, barang.qty);
    setCart((prev) => {
      const exists = prev.some((c) => c.barang.id === barang.id);
      if (exists) {
        return prev.map((c) =>
          c.barang.id === barang.id ? { barang, jumlah: capped } : c
        );
      }
      return [...prev, { barang, jumlah: capped }];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce((sum, c) => sum + c.jumlah, 0);
  const subtotal = cart.reduce(
    (sum, c) => sum + c.jumlah * c.barang.hargaJual,
    0
  );
  const totalKeuntungan = cart.reduce(
    (sum, c) => sum + c.jumlah * (c.barang.hargaJual - c.barang.hargaSatuan),
    0
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    clearCart,
    totalItems,
    subtotal,
    totalKeuntungan,
  };
}
