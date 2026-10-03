"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { MAX_QTY_PER_LINE } from "@/lib/checkout";

const STORAGE_KEY = "td-cart-v3";
const EMPTY = [];
const CartContext = createContext(null);

// Panier stocké dans le navigateur (synchronisé entre onglets). Chaque ligne garde un instantané
// du produit (voir cartSnapshot) ; prix et stock sont revérifiés par le serveur à la commande.
let cache = null;
const listeners = new Set();

const isLine = (i) =>
  i && typeof i.key === "string" && typeof i.variantId === "string" && Number.isInteger(i.qty) && i.qty > 0 && i.price > 0;

function readCart() {
  if (cache === null) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      cache = Array.isArray(saved) ? saved.filter(isLine) : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function writeCart(next) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};
const cap = (line) => Math.max(0, Math.min(line.max ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE));

export default function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);
  // Faux au rendu serveur, vrai dès que le panier du navigateur est lu (évite d'afficher « panier vide » à tort).
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);

  // Une ligne = une variante + une couleur. `snapshot` vient de cartSnapshot().
  const add = useCallback((snapshot, { openDrawer = true } = {}) => {
    const key = [snapshot.variantId, snapshot.color].join("|");
    const cur = readCart();
    const found = cur.find((i) => i.key === key);
    const max = cap(snapshot);
    if (max === 0) return;
    writeCart(
      found
        ? cur.map((i) => (i.key === key ? { ...i, ...snapshot, key, qty: Math.min(i.qty + 1, max) } : i))
        : [...cur, { ...snapshot, key, qty: 1 }],
    );
    if (openDrawer) setOpen(true);
  }, []);

  const setQty = useCallback((key, qty) => {
    const cur = readCart();
    writeCart(
      qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, cap(i)) } : i)),
    );
  }, []);

  const clear = useCallback(() => writeCart(EMPTY), []);

  const value = useMemo(
    () => ({
      lines: items.map((i) => ({ ...i, max: cap(i) })),
      count: items.reduce((n, l) => n + l.qty, 0),
      subtotal: items.reduce((n, l) => n + l.qty * l.price, 0),
      ready,
      add,
      setQty,
      clear,
      open,
      setOpen,
    }),
    [items, ready, add, setQty, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
